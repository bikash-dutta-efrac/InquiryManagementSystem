namespace InquiryManagementWebService.Models
{
    public class BdProjection
    {
        public int Id { get; set; }
        public string BdCode { get; set; } = null!;
        public string? ClientCode { get; set; }

        public int ProjMonth { get; set; }
        public int ProjYear { get; set; }

        public string? BDName { get; set; }
        public string? ClientName { get; set; }

        // --- Week 1 Forecast Data ---
        public long? ProjValWeek1 { get; set; }
        public DateTime? ProjDateWeek1 { get; set; }
        public string? RemarksWeek1 { get; set; }

        public long? RevisedValWeek1 { get; set; }
        public DateTime? ReviseDateWeek1 { get; set; }


        // --- Week 2 Forecast Data ---
        public long? ProjValWeek2 { get; set; }
        public DateTime? ProjDateWeek2 { get; set; }
        public string? RemarksWeek2 { get; set; }

        public long? RevisedValWeek2 { get; set; }
        public DateTime? ReviseDateWeek2 { get; set; }


        // --- Week 3 Forecast Data ---
        public long? ProjValWeek3 { get; set; }
        public DateTime? ProjDateWeek3 { get; set; }
        public string? RemarksWeek3 { get; set; }

        public long? RevisedValWeek3 { get; set; }
        public DateTime? ReviseDateWeek3 { get; set; }


        // --- Week 4 Forecast Data ---
        public long? ProjValWeek4 { get; set; }
        public DateTime? ProjDateWeek4 { get; set; }
        public string? RemarksWeek4 { get; set; }

        public long? RevisedValWeek4 { get; set; }
        public DateTime? ReviseDateWeek4 { get; set; }


        // --- Week 5 Forecast Data ---
        public long? ProjValWeek5 { get; set; }
        public DateTime? ProjDateWeek5 { get; set; }
        public string? RemarksWeek5 { get; set; }

        public long? RevisedValWeek5 { get; set; }
        public DateTime? ReviseDateWeek5 { get; set; }
    }

}
