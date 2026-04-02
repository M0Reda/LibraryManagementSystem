using LibraryManagementSystem.Data;
using LibraryManagementSystem.DTOs.Book;
using LibraryManagementSystem.Models;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Services.Implementations
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookResponseDto>> GetAllBooksAsync()
        {
            return await _context.Books
                .AsNoTracking()
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    PublishedYear = b.PublishedYear,
                    AuthorName = b.Author.Name
                })
                .ToListAsync();
        }

        public async Task<BookResponseDto?> GetBookByIdAsync(int id)
        {
            return await _context.Books
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    PublishedYear = b.PublishedYear,
                    AuthorName = b.Author.Name
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BookResponseDto> CreateBookAsync(CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                PublishedYear = dto.PublishedYear,
                AuthorId = dto.AuthorId
            };

            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            var author = await _context.Authors.FindAsync(dto.AuthorId);

            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                PublishedYear = book.PublishedYear,
                AuthorName = author?.Name ?? "Unknown"
            };
        }

        public async Task<BookResponseDto?> UpdateBookAsync(int id, UpdateBookDto dto)
        {
            var book = await _context.Books.Include(b => b.Author).FirstOrDefaultAsync(b => b.Id == id);
            if (book == null) return null;

            if (dto.Title != null) book.Title = dto.Title;
            if (dto.ISBN != null) book.ISBN = dto.ISBN;
            if (dto.PublishedYear.HasValue) book.PublishedYear = dto.PublishedYear.Value;
            if (dto.AuthorId.HasValue) book.AuthorId = dto.AuthorId.Value;

            await _context.SaveChangesAsync();

            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                PublishedYear = book.PublishedYear,
                AuthorName = book.Author?.Name ?? "Unknown"
            };
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
