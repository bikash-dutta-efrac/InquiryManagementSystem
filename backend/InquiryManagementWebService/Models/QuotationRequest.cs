namespace InquiryManagementWebService.Models
{
    public class QuotationRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? AgeFilter { get; set; }
        public string? QuotNo { get; set; }
        public List<string>? BdCodes { get; set; }
    }
}
