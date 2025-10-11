namespace InquiryManagementWebService.Models
{
    public class SampleSummary
    {
        public string? BillNo { get; set; }
        public string? InvoiceDate { get; set; }
        public string RegistrationNo { get; set; }
        public string SampleName { get; set; }
        public string Lab { get; set; }
        public string RegistrationDateTime { get; set; }
        public string LabTatDate { get; set; }
        public string? MailingDate { get; set; }
        public string? AnalysisCompletionDateTime { get; set; }
        public string? HodReview { get; set; }
        public decimal? DistributedRegisVal { get; set; }
        public string Status { get; set; }
    }
}
