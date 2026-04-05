using LibraryManagementSystem.Data;
using LibraryManagementSystem.Models;
using LibraryManagementSystem.DTOs.Member;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LibraryManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResetAdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResetAdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("reset-admin")]
        public async Task<IActionResult> ResetAdmin([FromBody] LoginDto dto)
        {
            var admin = await _context.Members.FirstOrDefaultAsync(m => m.Email.ToLower() == dto.Email.ToLower());

            if (admin == null)
            {
                admin = new Member
                {
                    FullName = "Admin User",
                    Email = dto.Email,
                    Role = "Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Profile = new MemberProfile { Address = "Admin HQ", Phone = "123456789", Bio = "Systems Admin" }
                };
                _context.Members.Add(admin);
                await _context.SaveChangesAsync();
                return Ok(new { message = $"Admin user created successfully with email {dto.Email} and the provided password." });
            }

            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            admin.Email = dto.Email; // Update email if it changed in casing or entirely
            
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Admin credentials updated successfully for {dto.Email}." });
        }
    }
}
