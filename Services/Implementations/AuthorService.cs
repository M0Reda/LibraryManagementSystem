using LibraryManagementSystem.Data;
using LibraryManagementSystem.DTOs.Author;
using LibraryManagementSystem.Models;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Services.Implementations
{
    public class AuthorService : IAuthorService
    {
        private readonly AppDbContext _context;

        public AuthorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuthorResponseDto>> GetAllAuthorsAsync()
        {
            return await _context.Authors
                .AsNoTracking()
                .Select(a => new AuthorResponseDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Email = a.Email,
                    Bio = a.Bio
                })
                .ToListAsync();
        }

        public async Task<AuthorResponseDto?> GetAuthorByIdAsync(int id)
        {
            return await _context.Authors
                .AsNoTracking()
                .Where(a => a.Id == id)
                .Select(a => new AuthorResponseDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Email = a.Email,
                    Bio = a.Bio
                })
                .FirstOrDefaultAsync();
        }

        public async Task<AuthorResponseDto> CreateAuthorAsync(CreateAuthorDto dto)
        {
            var author = new Author
            {
                Name = dto.Name,
                Email = dto.Email,
                Bio = dto.Bio
            };

            await _context.Authors.AddAsync(author);
            await _context.SaveChangesAsync();

            return new AuthorResponseDto
            {
                Id = author.Id,
                Name = author.Name,
                Email = author.Email,
                Bio = author.Bio
            };
        }

        public async Task<AuthorResponseDto?> UpdateAuthorAsync(int id, UpdateAuthorDto dto)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null) return null;

            if (dto.Name != null) author.Name = dto.Name;
            if (dto.Email != null) author.Email = dto.Email;
            if (dto.Bio != null) author.Bio = dto.Bio;

            await _context.SaveChangesAsync();

            return new AuthorResponseDto
            {
                Id = author.Id,
                Name = author.Name,
                Email = author.Email,
                Bio = author.Bio
            };
        }

        public async Task<bool> DeleteAuthorAsync(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null) return false;

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
