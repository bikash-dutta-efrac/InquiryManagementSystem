using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InquiryManagementWebService.Controllers
{
    using InquiryManagementWebService.Models;
    using InquiryManagementWebService.Repositories;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/quotations")]
    [ApiController]
    public class QuotationController : ControllerBase
    {
        private readonly IQuotationRepositiry _repository;

        public QuotationController(IQuotationRepositiry repository)
        {
            _repository = repository;
        }


        [HttpPost("pending")]
        public async Task<IActionResult> GetPendingQuotations([FromBody] QuotationRequest request)
        {
            var result = await _repository.GetPendingQuotationAsync(request);

            if (result == null || !result.Any())
                return NotFound(new { message = "No quotations found." });

            return Ok(result);
        }

        [HttpPatch("update-status")]
        public async Task<IActionResult> UpdateQuotation([FromBody] UpdateQuotationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.QuotNo))
                return BadRequest(new { message = "Quotation number is required." });

            var success = await _repository.UpdateQuotationAsync(request);

            if (!success)
                return NotFound(new { message = "Quotation not found or update failed." });

            return Ok(new { message = "Quotation updated successfully." });
        }

    }

}
