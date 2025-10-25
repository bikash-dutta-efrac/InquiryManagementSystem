namespace InquiryManagementWebService.Models
{
    public class BdProjection
    {
        public int? Id { get; set; }
        public string CODECD { get; set; }
        public string CUSTACCCODE { get; set; }
        public DateTime ProjDate { get; set; }
        public string? ProjVal { get; set; }
        public string BDName { get; set; }
        public string ClientName { get; set; }
        public string? Remarks { get; set; }
    }

}
