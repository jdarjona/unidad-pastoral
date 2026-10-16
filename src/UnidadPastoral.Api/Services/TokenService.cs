using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace UnidadPastoral.Api.Services;

public class TokenService(IConfiguration configuration)
{
    public string Create(string username)
    {
        var key = configuration["Jwt:Key"] ?? "dev-key-change-me-please-use-32chars";
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"] ?? "unidad-pastoral",
            audience: configuration["Jwt:Audience"] ?? "unidad-pastoral",
            claims: [new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.Role, "Admin")],
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
