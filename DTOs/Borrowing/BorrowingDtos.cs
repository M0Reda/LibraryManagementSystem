using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.DTOs.Borrowing
{
    public class CreateBorrowingDto
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public DateTime DueDate { get; set; }
    }

    public class BorrowingResponseDto
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
    }
}
