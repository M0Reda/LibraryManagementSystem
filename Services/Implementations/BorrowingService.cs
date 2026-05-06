using LibraryManagementSystem.Data;
using LibraryManagementSystem.DTOs.Borrowing;
using LibraryManagementSystem.Models;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Services.Implementations
{
    public class BorrowingService : IBorrowingService
    {
        private readonly AppDbContext _context;

        public BorrowingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BorrowingResponseDto>> GetAllBorrowingsAsync()
        {
            return await _context.Borrowings
                .AsNoTracking()
                .Select(b => new BorrowingResponseDto
                {
                    Id = b.Id,
                    MemberId = b.MemberId,
                    MemberName = b.Member.FullName,
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    BorrowDate = b.BorrowDate,
                    DueDate = b.DueDate,
                    ReturnDate = b.ReturnDate
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<BorrowingResponseDto>> GetBorrowingsByMemberIdAsync(int memberId)
        {
            return await _context.Borrowings
                .AsNoTracking()
                .Where(b => b.MemberId == memberId)
                .Select(b => new BorrowingResponseDto
                {
                    Id = b.Id,
                    MemberId = b.MemberId,
                    MemberName = b.Member.FullName,
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    BorrowDate = b.BorrowDate,
                    DueDate = b.DueDate,
                    ReturnDate = b.ReturnDate
                })
                .ToListAsync();
        }

        public async Task<BorrowingResponseDto> CreateBorrowingAsync(CreateBorrowingDto dto)
        {
            // Validate that member and book exist
            var member = await _context.Members.FindAsync(dto.MemberId);
            if (member == null)
                throw new ArgumentException($"Member with ID {dto.MemberId} not found.");

            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null)
                throw new ArgumentException($"Book with ID {dto.BookId} not found.");

            // Validate due date is in the future
            if (dto.DueDate <= DateTime.UtcNow)
                throw new ArgumentException("Due date must be in the future.");

            var borrowing = new Borrowing
            {
                MemberId = dto.MemberId,
                BookId = dto.BookId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dto.DueDate
            };

            try
            {
                await _context.Borrowings.AddAsync(borrowing);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to save borrowing: {ex.InnerException?.Message ?? ex.Message}", ex);
            }

            return new BorrowingResponseDto
            {
                Id = borrowing.Id,
                MemberId = borrowing.MemberId,
                MemberName = member.FullName,
                BookId = borrowing.BookId,
                BookTitle = book.Title,
                BorrowDate = borrowing.BorrowDate,
                DueDate = borrowing.DueDate
            };
        }

        public async Task<bool> ReturnBookAsync(int borrowingId)
        {
            var borrowing = await _context.Borrowings.FindAsync(borrowingId);
            if (borrowing == null) return false;

            borrowing.ReturnDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
