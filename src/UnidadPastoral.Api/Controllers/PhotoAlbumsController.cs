using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Models;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/photo-albums")]
public class PhotoAlbumsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? parishId)
    {
        var query = db.PhotoAlbums.Include(a => a.Parish).AsQueryable();

        if (parishId is not null)
        {
            query = query.Where(a => a.ParishId == parishId);
        }

        var items = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PhotoAlbumForm form)
    {
        if (string.IsNullOrWhiteSpace(form.Name))
        {
            return BadRequest("Le nom de l’album est obligatoire.");
        }

        if (form.ParishId is not null && !await db.Parishes.AnyAsync(p => p.Id == form.ParishId))
        {
            return BadRequest("Paroisse introuvable.");
        }

        var album = new PhotoAlbum
        {
            ParishId = form.ParishId,
            Name = form.Name.Trim(),
            Description = form.Description?.Trim()
        };

        db.PhotoAlbums.Add(album);
        await db.SaveChangesAsync();
        return Ok(album);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var album = await db.PhotoAlbums.FindAsync(id);
        if (album is null)
        {
            return NotFound();
        }

        db.PhotoAlbums.Remove(album);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public class PhotoAlbumForm
{
    public int? ParishId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
}
