namespace InquiryManagementWebService.Models
{
    public class LabRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public List<string>? ReviewsBy { get; set; }
    }

}
