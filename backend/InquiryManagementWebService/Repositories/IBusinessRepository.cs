using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IBusinessRepository
    {
        Task<IEnumerable<BdBusinessSummary>> GetBdBusinessOverviewAsync(BdBusinessSummaryRequest request);

        Task<IEnumerable<BdBusinessSummary>> GetMtoMBusinessComparisonAsync(MtoMComparisonRequest request);
    }
}