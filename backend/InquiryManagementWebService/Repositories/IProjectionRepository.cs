using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IProjectionRepository
    {
        Task<int> CreateProjectionAsync(BdProjectionRequest request);
        Task<int> DeleteProjectionAsync(int id);
        Task<IEnumerable<BdProjection>> GetAllProjectionsAsync(BdProjectionFilter filter);
        Task<BdProjection?> GetProjectionByIdAsync(int id);
        Task<IEnumerable<Projection>> GetProjectionsAsync(ProjectionRequest request);
        Task<int> UpdateProjectionAsync(int id, BdProjectionRequest request);
    }
}