using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Models;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/calendar")]
public class CalendarController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? parishId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = db.CalendarEvents.Include(e => e.Parish).AsQueryable();
        if (parishId is not null)
        {
            query = query.Where(e => e.ParishId == parishId);
        }

        if (from is not null)
        {
            query = query.Where(e => e.StartsAt >= from);
        }

        if (to is not null)
        {
            query = query.Where(e => e.StartsAt <= to);
        }

        return Ok(await query.OrderBy(e => e.StartsAt).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CalendarForm form)
    {
        if (!await db.Parishes.AnyAsync(p => p.Id == form.ParishId))
        {
            return BadRequest("Parroquia no encontrada.");
        }

        var item = new CalendarEvent
        {
            ParishId = form.ParishId,
            Title = form.Title,
            Description = form.Description ?? "",
            Location = form.Location ?? "",
            StartsAt = form.StartsAt,
            EndsAt = form.EndsAt,
            AllDay = form.AllDay
        };

        db.CalendarEvents.Add(item);
        await db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CalendarForm form)
    {
        var item = await db.CalendarEvents.FindAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        if (!await db.Parishes.AnyAsync(p => p.Id == form.ParishId))
        {
            return BadRequest("Parroquia no encontrada.");
        }

        item.ParishId = form.ParishId;
        item.Title = form.Title;
        item.Description = form.Description ?? "";
        item.Location = form.Location ?? "";
        item.StartsAt = form.StartsAt;
        item.EndsAt = form.EndsAt;
        item.AllDay = form.AllDay;

        await db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.CalendarEvents.FindAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        db.CalendarEvents.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CalendarForm(
    int ParishId,
    string Title,
    string? Description,
    string? Location,
    DateTime StartsAt,
    DateTime? EndsAt,
    bool AllDay);
