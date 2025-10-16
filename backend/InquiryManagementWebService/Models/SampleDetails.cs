namespace InquiryManagementWebService.Models
{
    public class SampleDetails
    {
        public string RegistrationNo { get; set; }
        public string SampleName { get; set; }
        public string Lab { get; set; }
        public string Parameter { get; set; }
        public string RegistrationDate { get; set; }
        public string? MailingDate { get; set; }
        public string? AnalysisCompletionDateTime { get; set; }
        public decimal? DistributedRegisVal { get; set; }
        public string Status { get; set; }
    }
}
