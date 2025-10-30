using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;

namespace InquiryManagementWebService.Controllers
{
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api")]
    public class ProjectionController : Controller
    {
        private readonly IProjectionRepository _projectionRepository;

        public ProjectionController(IProjectionRepository projectionRepository)
        {
            _projectionRepository = projectionRepository;
        }

        [HttpPost("projections/create")]
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

        [HttpPut("projections/update/{id}")]
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

        [HttpDelete("projections/delete/{id}")]
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

        [HttpGet("projections/get/{id}")]
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

        [HttpPost("projections/get")]
        public async Task<IActionResult> GetAllProjections([FromBody] BdProjectionFilter filter)
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


        [HttpPost("target/create")]
        public async Task<IActionResult> CreateTarget([FromBody] BdTargetRequest request)
        {
            try
            {
                var newId = await _projectionRepository.CreateTargetAsync(request);
                return Ok(newId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("target/get/{id}")]
        public async Task<IActionResult> GetTargetById(int id)
        {
            try
            {
                var target = await _projectionRepository.GetTargetByIdAsync(id);
                if (target == null)
                    return NotFound($"Target with Id {id} not found.");
                return Ok(target);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("target/get")]
        public async Task<IActionResult> GetAllTargets([FromBody] BdProjectionFilter filter)
        {
            try
            {
                var targets = await _projectionRepository.GetAllTargetsAsync(filter);
                return Ok(targets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("target/update/{id}")]
        public async Task<IActionResult> UpdateTarget(int id, [FromBody] BdTargetRequest request)
        {
            try
            {
                var rowsAffected = await _projectionRepository.UpdateTargetAsync(id, request);

                if (rowsAffected == 0)
                    return NotFound($"Target with Id {id} not found.");

                return Ok($"Target {id} updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("target/delete/{id}")]
        public async Task<IActionResult> DeleteTarget(int id)
        {
            try
            {
                var rowsAffected = await _projectionRepository.DeleteTargetAsync(id);

                if (rowsAffected == 0)
                    return NotFound($"Target with Id {id} not found.");

                return Ok($"Target {id} deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("projections/clients/get/{bdCode}")]
        public async Task<IActionResult> GetAssoicateClients(string bdCode)
        {
            try
            {
                var response = await _projectionRepository.GetAssociateClientAsync(bdCode);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

}
