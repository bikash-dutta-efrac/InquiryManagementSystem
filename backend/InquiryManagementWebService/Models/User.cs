namespace InquiryManagementWebService.Models
{
    public class User
    {
        public string EmployeeId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string? BdCode { get; set; }
        public string Role { get; set; }
        public string Designation { get; set; }

    }
}
