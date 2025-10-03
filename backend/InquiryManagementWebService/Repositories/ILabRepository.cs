using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface ILabRepository
    {
        Task<IEnumerable<Lab>> GetLabParameters(LabRequest request);
    }
}