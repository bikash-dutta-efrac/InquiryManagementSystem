namespace InquiryManagementWebService.Models
{
    public class BdBusinessSummary
    {
        public string BDName { get; set; }
        public string YearMonth { get; set; }
        public int TotalRegistrations { get; set; }
        public decimal TotalRegisValue { get; set; }
        public int UniqueVerticals { get; set; }
        public int UniqueClients { get; set; }
        public string VerticalSummary { get; set; }
        public string ClientSummary { get; set; }
    }
}
