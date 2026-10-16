using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/parishes")]
public class ParishesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List() =>
        Ok(await db.Parishes.OrderBy(p => p.Name).ToListAsync());

    [HttpGet("{slug}")]
    public async Task<IActionResult> Get(string slug)
    {
        var parish = await db.Parishes.FirstOrDefaultAsync(p => p.Slug == slug);
        return parish is null ? NotFound() : Ok(parish);
    }
}
