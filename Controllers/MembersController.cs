using LibraryManagementSystem.DTOs.Member;
using LibraryManagementSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _service;

        public MembersController(IMemberService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var members = await _service.GetAllMembersAsync();
            return Ok(members);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _service.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            return Ok(member);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMemberDto dto)
        {
            var member = await _service.UpdateMemberAsync(id, dto);
            if (member == null) return NotFound();
            return Ok(member);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteMemberAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
