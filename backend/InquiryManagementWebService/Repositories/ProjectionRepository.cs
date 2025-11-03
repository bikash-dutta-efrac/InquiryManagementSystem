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


        public async Task<int> CreateProjectionAsync(BdProjectionRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    INSERT INTO tblBD_FORECAST (
                        CODECD, CUSTACCCODE, 
                        PROJVAL_WEEK1, PROJDATE_WEEK1, REMARKS_WEEK1, REVISEDVAL_WEEK1, REVISEDATE_WEEK1,
                        PROJVAL_WEEK2, PROJDATE_WEEK2, REMARKS_WEEK2, REVISEDVAL_WEEK2, REVISEDATE_WEEK2,
                        PROJVAL_WEEK3, PROJDATE_WEEK3, REMARKS_WEEK3, REVISEDVAL_WEEK3, REVISEDATE_WEEK3,
                        PROJVAL_WEEK4, PROJDATE_WEEK4, REMARKS_WEEK4, REVISEDVAL_WEEK4, REVISEDATE_WEEK4,
                        PROJVAL_WEEK5, PROJDATE_WEEK5, REMARKS_WEEK5, REVISEDVAL_WEEK5, REVISEDATE_WEEK5
                    )
                    VALUES (
                        @BdCode, @ClientCode,
                        @ProjValWeek1, @ProjDateWeek1, @RemarksWeek1, @RevisedValWeek1, @ReviseDateWeek1,
                        @ProjValWeek2, @ProjDateWeek2, @RemarksWeek2, @RevisedValWeek2, @ReviseDateWeek2,
                        @ProjValWeek3, @ProjDateWeek3, @RemarksWeek3, @RevisedValWeek3, @ReviseDateWeek3,
                        @ProjValWeek4, @ProjDateWeek4, @RemarksWeek4, @RevisedValWeek4, @ReviseDateWeek4,
                        @ProjValWeek5, @ProjDateWeek5, @RemarksWeek5, @RevisedValWeek5, @ReviseDateWeek5
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);
                ";

                int newId = await connection.QuerySingleAsync<int>(query, new
                {
                    request.BdCode,
                    request.ClientCode,
                    request.ProjValWeek1,
                    request.ProjDateWeek1,
                    request.RemarksWeek1,
                    request.RevisedValWeek1,
                    request.ReviseDateWeek1,
                    request.ProjValWeek2,
                    request.ProjDateWeek2,
                    request.RemarksWeek2,
                    request.RevisedValWeek2,
                    request.ReviseDateWeek2,
                    request.ProjValWeek3,
                    request.ProjDateWeek3,
                    request.RemarksWeek3,
                    request.RevisedValWeek3,
                    request.ReviseDateWeek3,
                    request.ProjValWeek4,
                    request.ProjDateWeek4,
                    request.RemarksWeek4,
                    request.RevisedValWeek4,
                    request.ReviseDateWeek4,
                    request.ProjValWeek5,
                    request.ProjDateWeek5,
                    request.RemarksWeek5,
                    request.RevisedValWeek5,
                    request.ReviseDateWeek5
                });

                return newId;
            }
        }


        public async Task<int> UpdateProjectionAsync(int id, BdProjectionRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var existingProjection = await GetProjectionByIdAsync(id);

                if (existingProjection == null)
                    throw new Exception($"Projection with ID {id} not found.");

                // Merge request fields with existing ones
                var merged = new
                {
                    Id = id,

                    ProjValWeek1 = request.ProjValWeek1 ?? existingProjection.ProjValWeek1,
                    ProjDateWeek1 = request.ProjDateWeek1 ?? existingProjection.ProjDateWeek1,
                    RemarksWeek1 = request.RemarksWeek1 ?? existingProjection.RemarksWeek1,
                    RevisedValWeek1 = request.RevisedValWeek1 ?? existingProjection.RevisedValWeek1,
                    ReviseDateWeek1 = request.ReviseDateWeek1 ?? existingProjection.ReviseDateWeek1,

                    ProjValWeek2 = request.ProjValWeek2 ?? existingProjection.ProjValWeek2,
                    ProjDateWeek2 = request.ProjDateWeek2 ?? existingProjection.ProjDateWeek2,
                    RemarksWeek2 = request.RemarksWeek2 ?? existingProjection.RemarksWeek2,
                    RevisedValWeek2 = request.RevisedValWeek2 ?? existingProjection.RevisedValWeek2,
                    ReviseDateWeek2 = request.ReviseDateWeek2 ?? existingProjection.ReviseDateWeek2,

                    ProjValWeek3 = request.ProjValWeek3 ?? existingProjection.ProjValWeek3,
                    ProjDateWeek3 = request.ProjDateWeek3 ?? existingProjection.ProjDateWeek3,
                    RemarksWeek3 = request.RemarksWeek3 ?? existingProjection.RemarksWeek3,
                    RevisedValWeek3 = request.RevisedValWeek3 ?? existingProjection.RevisedValWeek3,
                    ReviseDateWeek3 = request.ReviseDateWeek3 ?? existingProjection.ReviseDateWeek3,

                    ProjValWeek4 = request.ProjValWeek4 ?? existingProjection.ProjValWeek4,
                    ProjDateWeek4 = request.ProjDateWeek4 ?? existingProjection.ProjDateWeek4,
                    RemarksWeek4 = request.RemarksWeek4 ?? existingProjection.RemarksWeek4,
                    RevisedValWeek4 = request.RevisedValWeek4 ?? existingProjection.RevisedValWeek4,
                    ReviseDateWeek4 = request.ReviseDateWeek4 ?? existingProjection.ReviseDateWeek4,

                    ProjValWeek5 = request.ProjValWeek5 ?? existingProjection.ProjValWeek5,
                    ProjDateWeek5 = request.ProjDateWeek5 ?? existingProjection.ProjDateWeek5,
                    RemarksWeek5 = request.RemarksWeek5 ?? existingProjection.RemarksWeek5,
                    RevisedValWeek5 = request.RevisedValWeek5 ?? existingProjection.RevisedValWeek5,
                    ReviseDateWeek5 = request.ReviseDateWeek5 ?? existingProjection.ReviseDateWeek5
                };

                string query = @"
            UPDATE tblBD_FORECAST
            SET
                PROJVAL_WEEK1 = @ProjValWeek1,
                PROJDATE_WEEK1 = @ProjDateWeek1,
                REMARKS_WEEK1 = @RemarksWeek1,
                REVISEDVAL_WEEK1 = @RevisedValWeek1,
                REVISEDATE_WEEK1 = @ReviseDateWeek1,

                PROJVAL_WEEK2 = @ProjValWeek2,
                PROJDATE_WEEK2 = @ProjDateWeek2,
                REMARKS_WEEK2 = @RemarksWeek2,
                REVISEDVAL_WEEK2 = @RevisedValWeek2,
                REVISEDATE_WEEK2 = @ReviseDateWeek2,

                PROJVAL_WEEK3 = @ProjValWeek3,
                PROJDATE_WEEK3 = @ProjDateWeek3,
                REMARKS_WEEK3 = @RemarksWeek3,
                REVISEDVAL_WEEK3 = @RevisedValWeek3,
                REVISEDATE_WEEK3 = @ReviseDateWeek3,

                PROJVAL_WEEK4 = @ProjValWeek4,
                PROJDATE_WEEK4 = @ProjDateWeek4,
                REMARKS_WEEK4 = @RemarksWeek4,
                REVISEDVAL_WEEK4 = @RevisedValWeek4,
                REVISEDATE_WEEK4 = @ReviseDateWeek4,

                PROJVAL_WEEK5 = @ProjValWeek5,
                PROJDATE_WEEK5 = @ProjDateWeek5,
                REMARKS_WEEK5 = @RemarksWeek5,
                REVISEDVAL_WEEK5 = @RevisedValWeek5,
                REVISEDATE_WEEK5 = @ReviseDateWeek5
            WHERE Id = @Id;
        ";

                var affectedRows = await connection.ExecuteAsync(query, merged);
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
                    f.CODECD AS BdCode,
                    f.CUSTACCCODE AS ClientCode,
                    f.PROJMONTH AS ProjMonth,
                    f.PROJYEAR AS ProjYear,
                    
                    f.PROJVAL_WEEK1 AS ProjValWeek1, 
                    f.PROJDATE_WEEK1 AS ProjDateWeek1, 
                    f.REMARKS_WEEK1 AS RemarksWeek1, 
                    f.REVISEDVAL_WEEK1 AS RevisedValWeek1, 
                    f.REVISEDATE_WEEK1 AS ReviseDateWeek1,
                    
                    f.PROJVAL_WEEK2 AS ProjValWeek2, 
                    f.PROJDATE_WEEK2 AS ProjDateWeek2, 
                    f.REMARKS_WEEK2 AS RemarksWeek2, 
                    f.REVISEDVAL_WEEK2 AS RevisedValWeek2, 
                    f.REVISEDATE_WEEK2 AS ReviseDateWeek2,
                    
                    f.PROJVAL_WEEK3 AS ProjValWeek3, 
                    f.PROJDATE_WEEK3 AS ProjDateWeek3, 
                    f.REMARKS_WEEK3 AS RemarksWeek3, 
                    f.REVISEDVAL_WEEK3 AS RevisedValWeek3, 
                    f.REVISEDATE_WEEK3 AS ReviseDateWeek3,
                    
                    f.PROJVAL_WEEK4 AS ProjValWeek4, 
                    f.PROJDATE_WEEK4 AS ProjDateWeek4, 
                    f.REMARKS_WEEK4 AS RemarksWeek4, 
                    f.REVISEDVAL_WEEK4 AS RevisedValWeek4, 
                    f.REVISEDATE_WEEK4 AS ReviseDateWeek4,
                    
                    f.PROJVAL_WEEK5 AS ProjValWeek5, 
                    f.PROJDATE_WEEK5 AS ProjDateWeek5, 
                    f.REMARKS_WEEK5 AS RemarksWeek5, 
                    f.REVISEDVAL_WEEK5 AS RevisedValWeek5, 
                    f.REVISEDATE_WEEK5 AS ReviseDateWeek5,

                    bd.CODEDESC AS BDName,
                    c.CUSTNAME AS ClientName
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
                var codecdList = (filter.BdCodeList != null && filter.BdCodeList.Any())
                    ? string.Join(",", filter.BdCodeList)
                    : null;

                var query = @"
                SELECT
                    f.Id,
                    f.CODECD AS BdCode,
                    f.CUSTACCCODE AS ClientCode,
                    f.PROJMONTH AS ProjMonth,
                    f.PROJYEAR AS ProjYear,
                    
                    f.PROJVAL_WEEK1 AS ProjValWeek1, 
                    f.PROJDATE_WEEK1 AS ProjDateWeek1, 
                    f.REMARKS_WEEK1 AS RemarksWeek1, 
                    f.REVISEDVAL_WEEK1 AS RevisedValWeek1, 
                    f.REVISEDATE_WEEK1 AS ReviseDateWeek1,
                    
                    f.PROJVAL_WEEK2 AS ProjValWeek2, 
                    f.PROJDATE_WEEK2 AS ProjDateWeek2, 
                    f.REMARKS_WEEK2 AS RemarksWeek2, 
                    f.REVISEDVAL_WEEK2 AS RevisedValWeek2, 
                    f.REVISEDATE_WEEK2 AS ReviseDateWeek2,
                    
                    f.PROJVAL_WEEK3 AS ProjValWeek3, 
                    f.PROJDATE_WEEK3 AS ProjDateWeek3, 
                    f.REMARKS_WEEK3 AS RemarksWeek3, 
                    f.REVISEDVAL_WEEK3 AS RevisedValWeek3, 
                    f.REVISEDATE_WEEK3 AS ReviseDateWeek3,
                    
                    f.PROJVAL_WEEK4 AS ProjValWeek4, 
                    f.PROJDATE_WEEK4 AS ProjDateWeek4, 
                    f.REMARKS_WEEK4 AS RemarksWeek4, 
                    f.REVISEDVAL_WEEK4 AS RevisedValWeek4, 
                    f.REVISEDATE_WEEK4 AS ReviseDateWeek4,
                    
                    f.PROJVAL_WEEK5 AS ProjValWeek5, 
                    f.PROJDATE_WEEK5 AS ProjDateWeek5, 
                    f.REMARKS_WEEK5 AS RemarksWeek5, 
                    f.REVISEDVAL_WEEK5 AS RevisedValWeek5, 
                    f.REVISEDATE_WEEK5 AS ReviseDateWeek5,

                    bd.CODEDESC AS BDName,
                    c.CUSTNAME AS ClientName
                FROM tblBD_FORECAST f
                INNER JOIN OCODEMST bd 
                    ON f.CODECD = bd.CODECD 
                    AND bd.CODETYPE = 'SP'
                LEFT JOIN OCUSTMST c 
                    ON f.CUSTACCCODE = c.CUSTACCCODE
                WHERE 
                    -- Filtering by month and year
                    (@ProjMonth IS NULL OR f.PROJMONTH = @ProjMonth) 
                    AND (@ProjYear IS NULL OR f.PROJYEAR = @ProjYear)
                    AND (
                        @CODECDList IS NULL
                        OR f.CODECD IN (SELECT Value FROM dbo.SplitStrings(@CODECDList, ','))
                    )
                ORDER BY f.PROJYEAR DESC, f.PROJMONTH DESC;
            ";

                var result = await connection.QueryAsync<BdProjection>(query, new
                {
                    ProjMonth = filter.ProjMonth,
                    ProjYear = filter.ProjYear,
                    CODECDList = codecdList
                });

                return result;
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


        public async Task<int> CreateTargetAsync(BdTargetRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
                INSERT INTO tblBD_TARGET (CODECD, TARGETVAL, REMARKS)
                VALUES (@CODECD, @TargetVal, @Remarks);
                SELECT CAST(SCOPE_IDENTITY() as INT);
            ";

                int newId = await connection.QuerySingleAsync<int>(query, new
                {
                    CODECD = request.BdCode,
                    TargetVal = request.TargetVal,
                    Remarks = request.Remarks
                });

                return newId;
            }
        }

        public async Task<BdTarget?> GetTargetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
                SELECT 
                    t.Id,
                    t.CODECD AS BdCode,
                    t.TARGETDATE AS TargetDate,
                    CAST(t.TARGETVAL AS VARCHAR) AS TargetVal,
                    bd.CODEDESC AS BDName,
                    t.REMARKS
                FROM tblBD_TARGET t
                INNER JOIN OCODEMST bd 
                    ON t.CODECD = bd.CODECD 
                    AND bd.CODETYPE = 'SP'
                WHERE t.Id = @Id;
            ";

                return await connection.QueryFirstOrDefaultAsync<BdTarget>(query, new { Id = id });
            }
        }

        // NOTE: Keeping the original GetAllTargetsAsync for completeness, using the updated BdProjectionFilter 
        // but ignoring the new month/year properties and relying on the original date fields if they exist 
        // in the BdTargetFilter or if it was modified separately.
        public async Task<IEnumerable<BdTarget>> GetAllTargetsAsync(BdProjectionFilter filter)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var codecdList = (filter.BdCodeList != null && filter.BdCodeList.Any())
                    ? string.Join(",", filter.BdCodeList)
                    : null;

                // Assuming BdTarget table still uses date fields for filtering targets, 
                // the BdProjectionFilter's date properties are not used here.
                // We'll filter only by BdCodeList for simplicity, as the filter was updated for projections.

                string query = @"
                SELECT 
                    t.Id,
                    t.CODECD AS BdCode,
                    t.TARGETDATE AS TargetDate,
                    CAST(t.TARGETVAL AS VARCHAR) AS TargetVal,
                    bd.CODEDESC AS BDName,
                    t.REMARKS AS Remarks
                FROM tblBD_TARGET t
                INNER JOIN OCODEMST bd 
                    ON t.CODECD = bd.CODECD 
                    AND bd.CODETYPE = 'SP'
                WHERE 
                    (@TargetMonth IS NULL OR t.TARGETMONTH = @TargetMonth) 
                    AND (@TargetYear IS NULL OR t.TARGETYEAR = @TargetYear)
                    AND (
                        @CODECDList IS NULL
                        OR t.CODECD IN (SELECT Value FROM dbo.SplitStrings(@CODECDList, ','))
                    )
                ORDER BY t.TARGETDATE DESC;
            ";

                var result = await connection.QueryAsync<BdTarget>(query, new
                {
                    CODECDList = codecdList,
                    TargetMonth = filter.ProjMonth,
                    TargetYear = filter.ProjYear
                });

                return result;
            }
        }

        public async Task<int> UpdateTargetAsync(int id, BdTargetRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {

                var existingTarget = await GetTargetByIdAsync(id);

                if (existingTarget == null)
                    throw new Exception($"Target with ID {id} not found.");


                string query = @"
                UPDATE tblBD_TARGET
                SET CODECD = @CODECD,
                    TARGETVAL = @TargetVal,
                    REMARKS = @Remarks
                WHERE Id = @Id;
            ";

                var affectedRows = await connection.ExecuteAsync(query, new
                {
                    Id = id,
                    CODECD = request.BdCode ?? existingTarget.BdCode,
                    TargetVal = request.TargetVal,
                    REMARKS = request.Remarks ?? existingTarget.Remarks
                });

                return affectedRows;
            }
        }

        public async Task<int> DeleteTargetAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = "DELETE FROM tblBD_TARGET WHERE Id = @Id;";
                var affectedRows = await connection.ExecuteAsync(query, new { Id = id });
                return affectedRows;
            }
        }

        public async Task<IEnumerable<ClientDetail>> GetAssociateClientAsync(string bdCode)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT 
                        CUSTNAME AS ClientName, 
                        CUSTACCCODE AS ClientCode,
                        CUSTUNIT AS Unit,
                        CUSTADD1 AS Address,
                        CUSTCITY AS City,
                        CUSTPIN AS Pin
                    FROM OCUSTMST
                    WHERE CUSTSALEPERSONCD = @BdCode
                ";
                return await connection.QueryAsync<ClientDetail>(query, new { BdCode = bdCode });
            }
        }
    }
}