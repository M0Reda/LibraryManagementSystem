using LibraryManagementSystem.DTOs.Author;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthorsController : ControllerBase
    {
        private readonly IAuthorService _service;

        public AuthorsController(IAuthorService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var authors = await _service.GetAllAuthorsAsync();
            return Ok(authors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var author = await _service.GetAuthorByIdAsync(id);
            if (author == null) return NotFound();
            return Ok(author);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateAuthorDto dto)
        {
            var author = await _service.CreateAuthorAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = author.Id }, author);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdateAuthorDto dto)
        {
            var author = await _service.UpdateAuthorAsync(id, dto);
            if (author == null) return NotFound();
            return Ok(author);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAuthorAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
