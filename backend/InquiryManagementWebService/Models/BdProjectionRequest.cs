using System.ComponentModel.DataAnnotations;

namespace InquiryManagementWebService.Models
{
    public class BdProjectionRequest
    {
        [Required]
        public string BdCode { get; set; }

        [Required]
        public string ClientCode { get; set; }

        [Required]
        public long ProjVal { get; set; }

        public string? Remarks { get; set; }
    }

}
