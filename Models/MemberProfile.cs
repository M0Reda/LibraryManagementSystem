namespace LibraryManagementSystem.Models
{
    public class MemberProfile
    {
        public int Id { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;

        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;
    }
}
