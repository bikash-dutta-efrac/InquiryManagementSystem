using InquiryManagementWebService.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    [ApiController]
    [Route("api/inquiries")]
    public class InquiryController : Controller
    {

        private readonly IInquiryRepository _inquiryRepository;
        public InquiryController(IInquiryRepository inquiryRepository)
        {
            _inquiryRepository = inquiryRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetInquiriesAsync(
            DateTime? fromDate,
            DateTime? toDate,
            int? year,
            int? month,
            string? bdName,
            string? clientName,
            string? dateField = "inqDate"
        )
        {
            try
            {
                var response = await _inquiryRepository.GetAsync(fromDate, toDate, year, month, bdName, clientName, dateField);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
