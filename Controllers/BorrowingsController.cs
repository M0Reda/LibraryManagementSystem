using LibraryManagementSystem.DTOs.Borrowing;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BorrowingsController : ControllerBase
    {
        private readonly IBorrowingService _service;

        public BorrowingsController(IBorrowingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var borrowings = await _service.GetAllBorrowingsAsync();
            return Ok(borrowings);
        }

        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetByMemberId(int memberId)
        {
            var borrowings = await _service.GetBorrowingsByMemberIdAsync(memberId);
            return Ok(borrowings);
        }

        [HttpPost]
        [Authorize(Roles = "Member,Admin")]
        public async Task<IActionResult> Borrow(CreateBorrowingDto dto)
        {
            try
            {
                var borrowing = await _service.CreateBorrowingAsync(dto);
                return Ok(borrowing);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/return")]
        [Authorize(Roles = "Member,Admin")]
        public async Task<IActionResult> Return(int id)
        {
            var result = await _service.ReturnBookAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Book returned successfully" });
        }
    }
}
