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


        public async Task<int> CreateProjectionAsync(BdProjectionRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
        INSERT INTO tblBD_FORECAST (CODECD, CUSTACCCODE, PROJVAL, REMARKS)
        VALUES (@CODECD, @CUSTACCCODE, @PROJVAL, @REMARKS);
        SELECT CAST(SCOPE_IDENTITY() as int);
    ";

                int newId = connection.QuerySingle<int>(query,
                    new
                    {
                        CODECD = request.CODECD,
                        CUSTACCCODE = request.CUSTACCCODE,
                        PROJVAL = request.PROJVAL,
                        REMARKS = request.REMARKS
                    }
                );
                return newId;
            }
        }

        public async Task<int> UpdateProjectionAsync(int id, BdProjectionRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
            UPDATE tblBD_FORECAST
            SET CODECD = @CODECD,
                CUSTACCCODE = @CUSTACCCODE,
                PROJVAL = @PROJVAL,
                REMARKS = @REMARKS
            WHERE Id = @Id;
        ";

                var affectedRows = await connection.ExecuteAsync(query, new
                {
                    Id = id,
                    request.CODECD,
                    request.CUSTACCCODE,
                    request.PROJVAL,
                    request.REMARKS
                });

                return affectedRows;
            }
        }

        public async Task<int> DeleteProjectionAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = "DELETE FROM tblBD_FORECAST WHERE Id = @Id;";
                var affectedRows = await connection.ExecuteAsync(query, new { Id = id });
                return affectedRows;
            }
        }

        public async Task<BdProjection?> GetProjectionByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
            SELECT
                f.Id,
                f.PROJDATE AS ProjDate,
                CAST(f.PROJVAL AS VARCHAR) AS ProjVal,
                bd.CODEDESC AS BDName,
                c.CUSTNAME AS ClientName,
                c.CUSTACCCODE,
                bd.CODECD,
                f.REMARKS AS Remarks
            FROM tblBD_FORECAST f
            INNER JOIN OCODEMST bd 
                ON f.CODECD = bd.CODECD 
               AND bd.CODETYPE = 'SP'
            LEFT JOIN OCUSTMST c 
                ON f.CUSTACCCODE = c.CUSTACCCODE
            WHERE f.Id = @Id;
";
                var result = await connection.QueryFirstOrDefaultAsync<BdProjection>(query, new { Id = id });
                return result;
            }
        }

        public async Task<IEnumerable<BdProjection>> GetAllProjectionsAsync(BdProjectionFilter filter)
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
                c.CUSTACCCODE,
                bd.CODECD,
                f.REMARKS AS Remarks
            FROM tblBD_FORECAST f
            INNER JOIN OCODEMST bd 
                ON f.CODECD = bd.CODECD 
               AND bd.CODETYPE = 'SP'
            LEFT JOIN OCUSTMST c 
                ON f.CUSTACCCODE = c.CUSTACCCODE
            WHERE 
                (@FromDate IS NULL OR f.PROJDATE >= @FromDate)
                AND (@ToDate IS NULL OR f.PROJDATE <= @ToDate)
                AND (@CODECD IS NULL OR f.CODECD = @CODECD);
        ";
                var result = await connection.QueryAsync<BdProjection>(query,
                    new
                    {
                        FromDate = filter.FromDate,
                        ToDate = filter.ToDate,
                        CODECD = filter.CODECD
                    });
                return result;
            }
        }


    }
}
