using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IInquiryRepository
    {
        Task<IEnumerable<Inquiry>> GetInquiriesAsync(InquiryRequest request);
        Task<IEnumerable<BdDetail>> GetBdNamesAsync(InquiryRequest request);
        Task<IEnumerable<string>> GetVerticalsAsync(InquiryRequest request);
        Task<IEnumerable<ClientDetail>> GetClientNamesAsync(InquiryRequest request);
    }
}