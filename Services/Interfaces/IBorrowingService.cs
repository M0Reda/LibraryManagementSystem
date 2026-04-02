using LibraryManagementSystem.DTOs.Borrowing;

namespace LibraryManagementSystem.Services.Interfaces
{
    public interface IBorrowingService
    {
        Task<IEnumerable<BorrowingResponseDto>> GetAllBorrowingsAsync();
        Task<IEnumerable<BorrowingResponseDto>> GetBorrowingsByMemberIdAsync(int memberId);
        Task<BorrowingResponseDto> CreateBorrowingAsync(CreateBorrowingDto dto);
        Task<bool> ReturnBookAsync(int borrowingId);
    }
}
