using LibraryManagementSystem.DTOs.Member;

namespace LibraryManagementSystem.Services.Interfaces
{
    public interface IMemberService
    {
        Task<IEnumerable<MemberResponseDto>> GetAllMembersAsync();
        Task<MemberResponseDto?> GetMemberByIdAsync(int id);
        Task<MemberResponseDto> CreateMemberAsync(RegisterDto dto);
        Task<MemberResponseDto?> UpdateMemberAsync(int id, UpdateMemberDto dto);
        Task<bool> DeleteMemberAsync(int id);
    }
}
