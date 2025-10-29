using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IProjectionRepository
    {
        Task<int> CreateProjectionAsync(BdProjectionRequest request);
        Task<int> CreateTargetAsync(BdTargetRequest request);
        Task<int> DeleteProjectionAsync(int id);
        Task<int> DeleteTargetAsync(int id);
        Task<IEnumerable<BdProjection>> GetAllProjectionsAsync(BdProjectionFilter filter);
        Task<IEnumerable<BdTarget>> GetAllTargetsAsync(BdProjectionFilter filter);
        Task<BdProjection?> GetProjectionByIdAsync(int id);
        Task<IEnumerable<Projection>> GetProjectionsAsync(ProjectionRequest request);
        Task<BdTarget?> GetTargetByIdAsync(int id);
        Task<int> UpdateProjectionAsync(int id, BdProjectionRequest request);
        Task<int> UpdateTargetAsync(int id, BdTargetRequest request);
    }
}