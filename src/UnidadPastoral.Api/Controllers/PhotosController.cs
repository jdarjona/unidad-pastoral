using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Models;
using UnidadPastoral.Api.Services;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/photos")]
public class PhotosController(AppDbContext db, UploadService uploads) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? parishId, [FromQuery] int? albumId)
    {
        var query = db.Photos.Include(p => p.Parish).Include(p => p.Album).AsQueryable();

        if (parishId is not null)
        {
            query = query.Where(p => p.ParishId == parishId);
        }

        if (albumId is not null)
        {
            query = query.Where(p => p.AlbumId == albumId);
        }

        return Ok(await query.OrderByDescending(p => p.TakenAt).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] PhotoForm form)
    {
        if (form.File is null)
        {
            return BadRequest("Falta el archivo de la foto.");
        }

        if (form.AlbumId is not null && !await db.PhotoAlbums.AnyAsync(a => a.Id == form.AlbumId))
        {
            return BadRequest("Album introuvable.");
        }

        var photo = new Photo
        {
            ParishId = form.ParishId,
            AlbumId = form.AlbumId,
            Title = form.Title ?? form.File.FileName,
            Caption = form.Caption ?? "",
            FilePath = await uploads.SaveAsync(form.File, "photos"),
            TakenAt = form.TakenAt ?? DateTime.UtcNow
        };

        db.Photos.Add(photo);
        await db.SaveChangesAsync();
        return Ok(photo);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var photo = await db.Photos.FindAsync(id);
        if (photo is null)
        {
            return NotFound();
        }

        db.Photos.Remove(photo);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public class PhotoForm
{
    public int? ParishId { get; set; }
    public int? AlbumId { get; set; }
    public string? Title { get; set; }
    public string? Caption { get; set; }
    public DateTime? TakenAt { get; set; }
    public IFormFile? File { get; set; }
}
