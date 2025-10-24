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
        public async Task<IActionResult> GetBdBusinessOverview([FromBody] BdBusinessSummaryRequest request)
        {
            try
            {
                var response = await _businessRepository.GetBdBusinessOverviewAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("bd-business-comparison")]
        public async Task<IActionResult> GetMtoMBusinessComparison([FromBody] MtoMComparisonRequest request)
        {
            try
            {
                var response = await _businessRepository.GetMtoMBusinessComparisonAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
