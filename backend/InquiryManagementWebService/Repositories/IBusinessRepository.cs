using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IBusinessRepository
    {
        Task<IEnumerable<BdBusinessSummary>> GetBdBusinessOverview(BdBusinessSummaryRequest request);
    }
}