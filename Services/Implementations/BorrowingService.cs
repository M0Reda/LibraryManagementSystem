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
            var borrowing = new Borrowing
            {
                MemberId = dto.MemberId,
                BookId = dto.BookId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dto.DueDate
            };

            await _context.Borrowings.AddAsync(borrowing);
            await _context.SaveChangesAsync();

            var member = await _context.Members.FindAsync(dto.MemberId);
            var book = await _context.Books.FindAsync(dto.BookId);

            return new BorrowingResponseDto
            {
                Id = borrowing.Id,
                MemberId = borrowing.MemberId,
                MemberName = member?.FullName ?? "Unknown",
                BookId = borrowing.BookId,
                BookTitle = book?.Title ?? "Unknown",
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
