namespace InquiryManagementWebService.Models
{
    public class BdTarget
    {
        public int? Id { get; set; }
        public string BdCode { get; set; }
        public DateTime TargetDate { get; set; }
        public string? TargetVal { get; set; }
        public string BDName { get; set; }
        public string? Remarks { get; set; }
    }

}
