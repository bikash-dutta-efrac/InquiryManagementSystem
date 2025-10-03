namespace InquiryManagementWebService.Models
{
    public class Lab
    {
        public DateTime RegDate { get; set; }
        public string RegNo { get; set; }
        public string SubRegNo { get; set; }
        public string LabName { get; set; }
        public string Parameter { get; set; }
        public string HodReview { get; set; }
        public string QaReview { get; set; }
        public DateTime? MailDate { get; set; }

    }
}
