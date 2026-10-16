using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Models;
using UnidadPastoral.Api.Services;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
    {
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return Unauthorized();
        }

        var hasher = new PasswordHasher<AdminUser>();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        return Ok(new { token = tokens.Create(user.Username), username = user.Username });
    }
}

public record LoginRequest(string Username, string Password);
