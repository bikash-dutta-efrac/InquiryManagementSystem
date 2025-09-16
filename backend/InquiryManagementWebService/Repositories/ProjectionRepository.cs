using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace InquiryManagementWebService.Repositories
{
    public class ProjectionRepository : IProjectionRepository
    {

        private readonly string _connectionString;
        public ProjectionRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }

        public async Task<IEnumerable<Projection>> GetProjectionsAsync(ProjectionRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {

                var query = @"
            SELECT 
                f.Id,
                f.PROJDATE AS ProjDate,
                CAST(f.PROJVAL AS VARCHAR) AS ProjVal,
                bd.CODEDESC AS BDName,
                c.CUSTNAME AS ClientName,
                CAST(f.TARGETVAL AS VARCHAR) AS TargetVal
            FROM tblBD_FORECAST f
            INNER JOIN OCODEMST bd 
                ON f.CODECD = bd.CODECD 
               AND bd.CODETYPE = 'SP'
            LEFT JOIN OCUSTMST c 
                ON f.CUSTACCCODE = c.CUSTACCCODE
            WHERE 
                (@FromDate IS NULL OR f.PROJDATE >= @FromDate)
                AND (@ToDate IS NULL OR f.PROJDATE <= @ToDate)
                AND (@Year IS NULL OR YEAR(f.PROJDATE) = @Year)
                AND (@Month IS NULL OR MONTH(f.PROJDATE) = @Month)
                AND (
                    @BDNames IS NULL 
                    OR (
                        (@ExcludeBDs = 0 AND bd.CODEDESC IN (SELECT Value FROM dbo.SplitStrings(@BDNames, ',')))
                        OR (@ExcludeBDs = 1 AND bd.CODEDESC NOT IN (SELECT Value FROM dbo.SplitStrings(@BDNames, ',')))
                    )
                );
        ";

                var bdNames = request.BdNames != null && request.BdNames.Any()
                    ? string.Join(",", request.BdNames)
                    : null;


                return await connection.QueryAsync<Projection>(query,
                    new
                    {
                        request.FromDate,
                        request.ToDate,
                        request.Month,
                        request.Year,
                        BDNames = bdNames,
                        request.ExcludeBDs
                    });
            }
        }
    }
}
