namespace InquiryManagementWebService.Models
{
    public class SampleSummaryRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public List<string>? Labs { get; set; }
        public bool ExcludeLabs { get; set; }
    }

}
