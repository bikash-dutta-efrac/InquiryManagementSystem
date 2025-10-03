using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    [Route("api/labs")]
    [ApiController]
    public class LabController : Controller
    {
        private readonly ILabRepository _labRepository;

        public LabController(ILabRepository labRepository)
        {
            _labRepository = labRepository;
        }

        [HttpPost]
        public async Task<IActionResult> GetProjections([FromBody] LabRequest request)
        {
            try
            {
                var response = await _labRepository.GetLabParameters(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
