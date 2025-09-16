namespace InquiryManagementWebService.Models
{
    public class Projection
    {
        public string Id { get; set; }
        public DateTime ProjDate { get; set; }
        public string? ProjVal { get; set; }
        public string BDName { get; set; }
        public string ClientName { get; set; }
        public string TargetVal { get; set; }

    }
}
