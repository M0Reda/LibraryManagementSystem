using LibraryManagementSystem.Data;
using LibraryManagementSystem.DTOs.Member;
using LibraryManagementSystem.Models;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LibraryManagementSystem.Services.Implementations
{
    public class MemberService : IMemberService
    {
        private readonly AppDbContext _context;

        public MemberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MemberResponseDto>> GetAllMembersAsync()
        {
            return await _context.Members
                .AsNoTracking()
                .Select(m => new MemberResponseDto
                {
                    Id = m.Id,
                    FullName = m.FullName,
                    Email = m.Email,
                    Role = m.Role,
                    Phone = m.Profile.Phone,
                    Address = m.Profile.Address,
                    Bio = m.Profile.Bio
                })
                .ToListAsync();
        }

        public async Task<MemberResponseDto?> GetMemberByIdAsync(int id)
        {
            return await _context.Members
                .AsNoTracking()
                .Where(m => m.Id == id)
                .Select(m => new MemberResponseDto
                {
                    Id = m.Id,
                    FullName = m.FullName,
                    Email = m.Email,
                    Role = m.Role,
                    Phone = m.Profile.Phone,
                    Address = m.Profile.Address,
                    Bio = m.Profile.Bio
                })
                .FirstOrDefaultAsync();
        }

        public async Task<MemberResponseDto> CreateMemberAsync(RegisterDto dto)
        {
            var member = new Member
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Member",
                Profile = new MemberProfile()
            };

            await _context.Members.AddAsync(member);
            await _context.SaveChangesAsync();

            return new MemberResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                Email = member.Email,
                Role = member.Role
            };
        }

        public async Task<MemberResponseDto?> UpdateMemberAsync(int id, UpdateMemberDto dto)
        {
            var member = await _context.Members.Include(m => m.Profile).FirstOrDefaultAsync(m => m.Id == id);
            if (member == null) return null;

            if (dto.FullName != null) member.FullName = dto.FullName;
            if (dto.Email != null) member.Email = dto.Email;
            if (dto.Role != null) member.Role = dto.Role;

            await _context.SaveChangesAsync();

            return new MemberResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                Email = member.Email,
                Role = member.Role,
                Phone = member.Profile?.Phone,
                Address = member.Profile?.Address,
                Bio = member.Profile?.Bio
            };
        }

        public async Task<bool> DeleteMemberAsync(int id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null) return false;

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
