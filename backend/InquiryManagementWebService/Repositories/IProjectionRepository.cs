using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IProjectionRepository
    {
        Task<IEnumerable<Projection>> GetProjectionsAsync(ProjectionRequest request);
    }
}