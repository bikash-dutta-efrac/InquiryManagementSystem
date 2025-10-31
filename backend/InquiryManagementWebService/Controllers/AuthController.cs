using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;
using InquiryManagementWebService.Utils;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IUserRepository _userRepo;
        private readonly JwtService _jwtService;

        public AuthController(IUserRepository userRepo, JwtService jwtService)
        {
            _userRepo = userRepo;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LogInRequest request)
        {
            var user = await _userRepo.GetUserAsync(request.EmployeeId);
            if (user == null || user.Password != request.Password)
                return Unauthorized("Invalid username or password.");

            var token = _jwtService.GenerateToken(user);
            return Ok(new { token });
        }
    }
}
