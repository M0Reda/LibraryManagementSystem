using LibraryManagementSystem.DTOs.Author;

namespace LibraryManagementSystem.Services.Interfaces
{
    public interface IAuthorService
    {
        Task<IEnumerable<AuthorResponseDto>> GetAllAuthorsAsync();
        Task<AuthorResponseDto?> GetAuthorByIdAsync(int id);
        Task<AuthorResponseDto> CreateAuthorAsync(CreateAuthorDto dto);
        Task<AuthorResponseDto?> UpdateAuthorAsync(int id, UpdateAuthorDto dto);
        Task<bool> DeleteAuthorAsync(int id);
    }
}
