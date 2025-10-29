using System.ComponentModel.DataAnnotations;

namespace InquiryManagementWebService.Models
{
    public class BdProjectionRequest
    {
        [Required]
        public string CODECD { get; set; }

        [Required]
        public string ClientName { get; set; }

        [Required]
        public long PROJVAL { get; set; }

        public string? REMARKS { get; set; }
    }

}
