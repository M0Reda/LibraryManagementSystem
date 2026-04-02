using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.DTOs.Book
{
    public class CreateBookDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string ISBN { get; set; } = string.Empty;

        [Range(1000, 2100)]
        public int PublishedYear { get; set; }

        [Required]
        public int AuthorId { get; set; }
    }

    public class UpdateBookDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? ISBN { get; set; }

        [Range(1000, 2100)]
        public int? PublishedYear { get; set; }

        public int? AuthorId { get; set; }
    }

    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int PublishedYear { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
}
