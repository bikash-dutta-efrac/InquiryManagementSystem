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

                    INSERT INTO tblBD_FORECAST (CODECD, CUSTACCCODE, PROJVAL, REMARKS)
                    VALUES (@BdCode, @ClientCode, @ProjVal, @Remarks);

                    SELECT CAST(SCOPE_IDENTITY() AS INT);
                ";              

                int newId = await connection.QuerySingleAsync<int>(query, new
                {
                    BdCode = request.BdCode,
                    ClientCode = request.ClientCode,
                    ProjVal = request.ProjVal,
                    Remarks = request.Remarks
                });

                return newId;
            }
        }

        public async Task<int> UpdateProjectionAsync(int id, BdProjectionRequest? request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var existingProjection = await GetProjectionByIdAsync(id);

                if (existingProjection == null)
                    throw new Exception($"Projection with ID {id} not found.");

                string query = @"

                    UPDATE tblBD_FORECAST
                    SET 
                        CODECD = @BdCode,
                        CUSTACCCODE = @ClientCode,
                        PROJVAL = @ProjVal,
                        REMARKS = @Remarks
                    WHERE Id = @Id;
                ";

                var affectedRows = await connection.ExecuteAsync(query, new
                {
                    Id = id,
                    BdCode = request.BdCode ?? existingProjection.BdCode,
                    ClientCode = request.ClientCode,
                    ProjVal = request.ProjVal,
                    Remarks = request.Remarks ?? existingProjection.Remarks
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
                    c.CUSTACCCODE AS ClientCode,
                    bd.CODECD AS BdCode,
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
                var clientCodeList = (filter.BdCodeList != null && filter.BdCodeList.Any())
                    ? string.Join(",", filter.BdCodeList)
                    : null;

                var query = @"
                SELECT
                    f.Id,
                    f.PROJDATE AS ProjDate,
                    CAST(f.PROJVAL AS VARCHAR) AS ProjVal,
                    bd.CODEDESC AS BDName,
                    c.CUSTNAME AS ClientName,
                    c.CUSTACCCODE AS ClientCode,
                    bd.CODECD AS BdCode,
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
                    AND (
                        @CODECDList IS NULL
                        OR f.CODECD IN (SELECT Value FROM dbo.SplitStrings(@CODECDList, ','))
                    )
                ORDER BY f.PROJDATE DESC;
            ";

                var result = await connection.QueryAsync<BdProjection>(query, new
                {
                    FromDate = filter.FromDate,
                    ToDate = filter.ToDate,
                    CODECDList = clientCodeList
                });

                return result;
            }
        }


        public async Task<int> CreateTargetAsync(BdTargetRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string query = @"
                INSERT INTO tblBD_TARGET (CODECD, TARGETVAL, REMARKS)
                VALUES (@CODECD, @TargetVal, @Remarks);
                SELECT CAST(SCOPE_IDENTITY() as int);
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
                    t.CODECD,
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

        public async Task<IEnumerable<BdTarget>> GetAllTargetsAsync(BdProjectionFilter filter)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var codecdList = (filter.BdCodeList != null && filter.BdCodeList.Any())
                    ? string.Join(",", filter.BdCodeList)
                    : null;

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
                    (@FromDate IS NULL OR t.TARGETDATE >= @FromDate)
                    AND (@ToDate IS NULL OR t.TARGETDATE <= @ToDate)
                    AND (
                        @CODECDList IS NULL
                        OR t.CODECD IN (SELECT Value FROM dbo.SplitStrings(@CODECDList, ','))
                    )
                ORDER BY t.TARGETDATE DESC;
            ";

                var result = await connection.QueryAsync<BdTarget>(query, new
                {
                    FromDate = filter.FromDate,
                    ToDate = filter.ToDate,
                    CODECDList = codecdList
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
