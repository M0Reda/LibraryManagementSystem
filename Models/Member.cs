namespace LibraryManagementSystem.Models
{
    public class Member
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";

        public MemberProfile Profile { get; set; } = null!;

        public ICollection<Borrowing> Borrowings { get; set; } = new List<Borrowing>();
    }
}
