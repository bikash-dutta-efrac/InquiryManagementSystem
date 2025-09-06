using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IInquiryRepository
    {
        Task<IEnumerable<Inquiry>> GetAsync(DateTime? fromDate, DateTime? toDate, int? year, int? month, string? bdName, string? clientName, string? dateField);
    }
}