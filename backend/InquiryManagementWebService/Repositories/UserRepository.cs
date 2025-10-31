using Azure.Core;
using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace InquiryManagementWebService.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"]; ;
        }

        public async Task<User?> GetUserAsync(string employeeId)
        {
            const string query = @"
                SELECT 
                    U.USERNAME AS [Username], 
                    U.USERPSWD AS [Password], 
                    U.USERLOGINID AS [EmployeeId], 
                    U.USERDESIGNATION AS [Designation], 
                    R2.ROLE_NAME AS [Role],
                    BD.CODECD AS [BdCode]
                FROM USERFILE U
                LEFT JOIN USER_ROLE_REL R1 
                    ON U.USERID = R1.USERID
                LEFT JOIN ROLE_MAST R2 
                    ON R2.ROLE_CODE = R1.ROLE_CODE
                LEFT JOIN OCODEMST BD
                    ON BD.CODEDESC = U.USERNAME
                    AND BD.CODETYPE = 'SP'
                WHERE U.USERLOGINID = @EmployeeId
                ORDER BY U.USERNAME;
            ";

            using (var connection = new SqlConnection(_connectionString))
            {


                return await connection.QueryFirstOrDefaultAsync<User>(query,
                new { EmployeeId = employeeId });
            }
        }
    }
}
