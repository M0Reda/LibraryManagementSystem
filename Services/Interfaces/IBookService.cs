using LibraryManagementSystem.DTOs.Book;

namespace LibraryManagementSystem.Services.Interfaces
{
    public interface IBookService
    {
        Task<IEnumerable<BookResponseDto>> GetAllBooksAsync();
        Task<BookResponseDto?> GetBookByIdAsync(int id);
        Task<BookResponseDto> CreateBookAsync(CreateBookDto dto);
        Task<BookResponseDto?> UpdateBookAsync(int id, UpdateBookDto dto);
        Task<bool> DeleteBookAsync(int id);
    }
}
