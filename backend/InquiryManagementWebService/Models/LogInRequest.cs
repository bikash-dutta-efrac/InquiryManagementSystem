using System.ComponentModel.DataAnnotations;

namespace InquiryManagementWebService.Models
{
    public class LogInRequest
    {
        [Required]
        public string EmployeeId { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
