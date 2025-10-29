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

                return await connection.QueryAsync<Projection>(query, new
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
                var query = @"
                    DECLARE @custCode VARCHAR(50);

                    SELECT TOP 1 @custCode = CUSTACCCODE
                    FROM OCUSTMST
                    WHERE CUSTNAME = @ClientName;

                    IF @custCode IS NULL
                    BEGIN
                        THROW 50001, 'Customer not found for given ClientName', 1;
                    END

                    INSERT INTO tblBD_FORECAST (CODECD, CUSTACCCODE, PROJVAL, REMARKS)
                    VALUES (@CODECD, @custCode, @PROJVAL, @REMARKS);

                    SELECT CAST(SCOPE_IDENTITY() AS INT);
";

                int newId = await connection.QuerySingleAsync<int>(query, new
                {
                    CODECD = request.CODECD,
                    ClientName = request.ClientName,
                    PROJVAL = request.PROJVAL,
                    REMARKS = request.REMARKS
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
                    DECLARE @custCode VARCHAR(50);

                    SELECT TOP 1 @custCode = CUSTACCCODE
                    FROM OCUSTMST
                    WHERE CUSTNAME = @ClientName;

                    IF @custCode IS NULL
                    BEGIN
                        THROW 50001, 'Customer not found for given ClientName', 1;
                    END

                    UPDATE tblBD_FORECAST
                    SET 
                        CODECD = @CODECD,
                        CUSTACCCODE = @custCode,
                        PROJVAL = @PROJVAL,
                        REMARKS = @REMARKS
                    WHERE Id = @Id;
                ";

                var affectedRows = await connection.ExecuteAsync(query, new
                {
                    Id = id,
                    CODECD = request.CODECD ?? existingProjection.CODECD,
                    ClientName = request.ClientName,
                    PROJVAL = request.PROJVAL,
                    REMARKS = request.REMARKS ?? existingProjection.Remarks
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
                var codecdList = (filter.CODECDs != null && filter.CODECDs.Any())
                    ? string.Join(",", filter.CODECDs)
                    : null;

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
                    CODECDList = codecdList
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
                    CODECD = request.CODECD,
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
                var codecdList = (filter.CODECDs != null && filter.CODECDs.Any())
                    ? string.Join(",", filter.CODECDs)
                    : null;

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
                    CODECD = request.CODECD ?? existingTarget.CODECD,
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
    }


}
