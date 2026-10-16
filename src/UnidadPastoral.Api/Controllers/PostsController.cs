using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Models;
using UnidadPastoral.Api.Services;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController(AppDbContext db, UploadService uploads) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] PostType? type, [FromQuery] int? parishId)
    {
        var query = db.Posts.Include(p => p.Parish).AsQueryable();
        if (type is not null)
        {
            query = query.Where(p => p.Type == type);
        }

        if (parishId is not null)
        {
            query = query.Where(p => p.ParishId == parishId);
        }

        var items = await query.OrderByDescending(p => p.PublishedAt).ToListAsync();
        return Ok(items);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> Get(string slug)
    {
        var post = await db.Posts.Include(p => p.Parish).FirstOrDefaultAsync(p => p.Slug == slug);
        return post is null ? NotFound() : Ok(post);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] PostForm form)
    {
        var slug = Slug.From(form.Title);
        if (await db.Posts.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{slug}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        var post = new Post
        {
            ParishId = form.ParishId,
            Type = form.Type,
            Title = form.Title,
            Slug = slug,
            Body = form.Body ?? "",
            PublishedAt = DateTime.UtcNow,
            EventStartsAt = form.EventStartsAt
        };

        if (form.Cover is not null)
        {
            post.CoverImagePath = await uploads.SaveAsync(form.Cover, "covers");
        }

        if (form.Attachment is not null)
        {
            post.AttachmentPath = await uploads.SaveAsync(form.Attachment, "documents");
            post.AttachmentName = form.Attachment.FileName;
        }

        db.Posts.Add(post);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { slug = post.Slug }, post);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] PostUpdateForm form)
    {
        var post = await db.Posts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        if (form.ParishId is not null)
        {
            post.ParishId = form.ParishId;
        }

        if (form.Type is not null)
        {
            post.Type = form.Type.Value;
        }

        if (!string.IsNullOrWhiteSpace(form.Title))
        {
            var baseSlug = Slug.From(form.Title);
            var slug = baseSlug;
            if (await db.Posts.AnyAsync(p => p.Id != id && p.Slug == slug))
            {
                slug = $"{slug}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            post.Title = form.Title;
            post.Slug = slug;
        }

        if (form.Body is not null)
        {
            post.Body = form.Body;
        }

        if (form.EventStartsAt is not null)
        {
            post.EventStartsAt = form.EventStartsAt.Value;
        }

        if (form.Cover is not null)
        {
            post.CoverImagePath = await uploads.SaveAsync(form.Cover, "covers");
        }

        if (form.Attachment is not null)
        {
            post.AttachmentPath = await uploads.SaveAsync(form.Attachment, "documents");
            post.AttachmentName = form.Attachment.FileName;
        }

        await db.SaveChangesAsync();
        return Ok(post);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var post = await db.Posts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        db.Posts.Remove(post);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public class PostForm
{
    public int? ParishId { get; set; }
    public PostType Type { get; set; }
    public string Title { get; set; } = "";
    public string? Body { get; set; }
    public DateTime? EventStartsAt { get; set; }
    public IFormFile? Cover { get; set; }
    public IFormFile? Attachment { get; set; }
}

public class PostUpdateForm
{
    public int? ParishId { get; set; }
    public PostType? Type { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
    public DateTime? EventStartsAt { get; set; }
    public IFormFile? Cover { get; set; }
    public IFormFile? Attachment { get; set; }
}
