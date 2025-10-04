namespace InquiryManagementWebService.Models
{
    public class LabSummary
    {
        public string LabName { get; set; }
        public int TotalRegistrations { get; set; }
        public int TotalSubRegistrations { get; set; }
        public int TotalParameters { get; set; }
        public int TotalMailReviewed { get; set; }
        public int TotalQaReviewed { get; set; }
        public int TotalHodReviewed { get; set; }
    }
}
