using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface ILabRepository
    {
        Task<IEnumerable<Lab>> GetLabParameters(LabRequest request);
        Task<IEnumerable<LabSummary>> GetLabSummary(LabRequest request);
        Task<IEnumerable<string>> GetLabsAsync(LabRequest request);
    }
}