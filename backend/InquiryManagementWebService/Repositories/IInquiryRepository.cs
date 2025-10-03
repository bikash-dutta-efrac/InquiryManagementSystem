using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IInquiryRepository
    {
        Task<IEnumerable<Inquiry>> GetInquiriesAsync(InquiryRequest request);
        Task<IEnumerable<string>> GetBdNamesAsync(InquiryRequest request);
        Task<IEnumerable<string>> GetVerticalsAsync(InquiryRequest request);
        Task<IEnumerable<string>> GetClientNamesAsync(InquiryRequest request);
    }
}