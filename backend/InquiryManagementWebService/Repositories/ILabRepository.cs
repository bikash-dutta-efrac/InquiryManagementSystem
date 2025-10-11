using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface ILabRepository
    {
        Task<IEnumerable<SampleSummary>> GetSampleSummary(SampleSummaryRequest request);
        Task<IEnumerable<LabSummary>> GetLabSummary(SampleSummaryRequest request);
        Task<IEnumerable<string>> GetLabsAsync(SampleSummaryRequest request);
    }
}