using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.DTOs.Author
{
    public class CreateAuthorDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Bio { get; set; } = string.Empty;
    }

    public class UpdateAuthorDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }
    }

    public class AuthorResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
    }
}
