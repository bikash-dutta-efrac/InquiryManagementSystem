namespace InquiryManagementWebService.Models
{
    public class InquiryRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public string? DateField { get; set; } = "inqDate";
        public List<string>? Verticals { get; set; }
        public List<string>? BdNames { get; set; }
        public List<string>? ClientNames { get; set; }
        public bool ExcludeBDs { get; set; }
        public bool ExcludeClients { get; set; }
        public bool ExcludeVerticals { get; set; }
    }

}
