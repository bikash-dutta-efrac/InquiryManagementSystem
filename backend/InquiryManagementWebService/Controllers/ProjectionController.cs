using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    [ApiController]
    [Route("api/projections")]
    public class ProjectionController : Controller
    {
        private readonly IProjectionRepository _projectionRepository;

        public ProjectionController(IProjectionRepository projectionRepository)
        {
            _projectionRepository = projectionRepository;
        }

        [HttpPost]
        public async Task<IActionResult> GetProjections([FromBody] ProjectionRequest request)
        {
            try
            {
                var response = await _projectionRepository.GetProjectionsAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
