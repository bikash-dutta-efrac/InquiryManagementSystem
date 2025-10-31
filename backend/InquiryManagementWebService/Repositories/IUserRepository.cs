using InquiryManagementWebService.Models;

namespace InquiryManagementWebService.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserAsync(string employeeId);
    }
}