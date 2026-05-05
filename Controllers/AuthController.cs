using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LibraryManagementSystem.Data;
using LibraryManagementSystem.DTOs.Member;
using LibraryManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace LibraryManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Members.AnyAsync(m => m.Email == dto.Email))
                return BadRequest("Email already exists");

            var member = new Member
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Member",
                Profile = new MemberProfile { Address = "", Phone = dto.Phone ?? "", Bio = "" }
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(member);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var member = await _context.Members.FirstOrDefaultAsync(m => m.Email.ToLower() == dto.Email.ToLower());

            if (member == null || !BCrypt.Net.BCrypt.Verify(dto.Password, member.PasswordHash))
                return Unauthorized("Invalid email or password");

            var token = GenerateJwtToken(member);
            return Ok(new { token });
        }

        private string GenerateJwtToken(Member member)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, member.Id.ToString()),
                new Claim(ClaimTypes.Email, member.Email),
                new Claim(ClaimTypes.Name, member.FullName),
                new Claim(ClaimTypes.Role, member.Role)
            };

            var jwtKey = _config["Jwt:Key"] ?? "default_secret_key_32_chars_long!!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["Jwt:ExpirationMinutes"]));

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
