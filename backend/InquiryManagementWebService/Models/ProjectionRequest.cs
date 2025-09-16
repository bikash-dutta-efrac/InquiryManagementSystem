namespace InquiryManagementWebService.Models
{
    public class ProjectionRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public List<string>? Verticals { get; set; }
        public List<string>? BdNames { get; set; }
        public bool ExcludeBDs { get; set; }
    }

}
