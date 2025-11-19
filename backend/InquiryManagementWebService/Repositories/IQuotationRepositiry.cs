using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IQuotationRepositiry
    {
        Task<IEnumerable<Quotation>> GetPendingQuotationAsync(QuotationRequest request);
        Task<bool> UpdateQuotationAsync(UpdateQuotationRequest request);
    }
}