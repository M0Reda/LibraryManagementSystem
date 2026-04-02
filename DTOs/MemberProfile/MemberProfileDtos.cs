using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.DTOs.MemberProfile
{
    public class UpdateMemberProfileDto
    {
        [Phone]
        public string? Phone { get; set; }

        public string? Address { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }
    }

    public class MemberProfileResponseDto
    {
        public int Id { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public int MemberId { get; set; }
    }
}
