using InquiryManagementWebService.Models;
using InquiryManagementWebService.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using static Azure.Core.HttpHeader;

namespace InquiryManagementWebService.Controllers
{
    [ApiController]
    [Route("api/inquiries")]
    public class InquiryController : ControllerBase
    {
        private readonly IInquiryRepository _inquiryRepository;

        public InquiryController(IInquiryRepository inquiryRepository)
        {
            _inquiryRepository = inquiryRepository;
        }

        [HttpPost]
        public async Task<IActionResult> GetInquiriesAsync([FromBody] InquiryRequest request)
        {
            try
            {
                var response = await _inquiryRepository.GetInquiriesAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("verticals")]
        public async Task<IActionResult> GetVerticalsAsync([FromBody] InquiryRequest request)
        {
            try
            {
                var verticals = await _inquiryRepository.GetVerticalsAsync(request);
                return Ok(verticals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("bdnames")]
        public async Task<IActionResult> GetBDNamesAsync([FromBody] InquiryRequest request)
        {
            try
            {
                var bdNames = await _inquiryRepository.GetBDNamesAsync(request);
                return Ok(bdNames);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("clientnames")]
        public async Task<IActionResult> GetClientNamesAsync([FromBody] InquiryRequest request)
        {
            try
            {
                var bdNames = request.BdNames != null && request.BdNames.Any()
                    ? string.Join(",", request.BdNames)
                    : null;

                var clients = await _inquiryRepository.GetClientNamesAsync(request);
                return Ok(clients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

}
