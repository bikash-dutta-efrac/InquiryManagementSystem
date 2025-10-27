namespace InquiryManagementWebService.Models
{
    public class BdTarget
    {
        public int? Id { get; set; }
        public string CODECD { get; set; }
        public DateTime ProjDate { get; set; }
        public string? TargetVal { get; set; }
        public string BDName { get; set; }
        public string? Remarks { get; set; }
    }

}
