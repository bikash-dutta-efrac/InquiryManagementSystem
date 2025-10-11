namespace InquiryManagementWebService.Models
{
    public class LabSummary
    {
        public string Lab { get; set; }
        public int Samples { get; set; }
        public int Pendings { get; set; }
        public int Released { get; set; }
        public int ReleasedBeforeTat { get; set; }
        public int ReleasedOnTat { get; set; }
        public int ReleasedAfterTat { get; set; }
        public int PendingBeyondTat { get; set; }
        public int PendingInvoiced { get; set; }
        public int PendingBilled { get; set; }
        public double TotalRegValue { get; set; }
        public double PendingRegValue { get; set; }
    }
}
