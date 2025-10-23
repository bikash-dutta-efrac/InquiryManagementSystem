using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    [Route("api/business")]
    [ApiController]
    public class BusinessController : ControllerBase
    {

        private readonly IBusinessRepository _businessRepository;
        public BusinessController(IBusinessRepository businessRepository)
        {
            _businessRepository = businessRepository;
        }

        [HttpPost("bd-business-overview")]
        public async Task<IActionResult> GetSampleOverview([FromBody] BdBusinessSummaryRequest request)
        {
            try
            {
                var response = await _businessRepository.GetBdBusinessOverview(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
