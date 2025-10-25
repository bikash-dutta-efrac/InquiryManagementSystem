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

        [HttpPost("bd/create")]
        public async Task<IActionResult> CreateProjection([FromBody] BdProjectionRequest request)
        {
            try
            {
                var response = await _projectionRepository.CreateProjectionAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("bd/{id}")]
        public async Task<IActionResult> UpdateProjection(int id, [FromBody] BdProjectionRequest request)
        {
            try
            {
                var rowsAffected = await _projectionRepository.UpdateProjectionAsync(id, request);

                if (rowsAffected == 0)
                    return NotFound($"Projection with Id {id} not found.");

                return Ok($"Projection {id} updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("bd/{id}")]
        public async Task<IActionResult> DeleteProjection(int id)
        {
            try
            {
                var rowsAffected = await _projectionRepository.DeleteProjectionAsync(id);

                if (rowsAffected == 0)
                    return NotFound($"Projection with Id {id} not found.");

                return Ok($"Projection {id} deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("bd/{id}")]
        public async Task<IActionResult> GetProjectionById(int id)
        {
            try
            {
                var projection = await _projectionRepository.GetProjectionByIdAsync(id);

                if (projection == null)
                    return NotFound($"Projection with Id {id} not found.");

                return Ok(projection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("bd/get-all")]
        public async Task<IActionResult> GetAllProjections(BdProjectionFilter filter)
        {
            try
            {
                var projections = await _projectionRepository.GetAllProjectionsAsync(filter);
                return Ok(projections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
