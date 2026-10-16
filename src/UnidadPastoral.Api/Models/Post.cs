namespace UnidadPastoral.Api.Models;

public enum PostType
{
    News = 0,
    Event = 1,
    Document = 2
}

public class Post
{
    public int Id { get; set; }
    public int? ParishId { get; set; }
    public Parish? Parish { get; set; }
    public PostType Type { get; set; }
    public string Title { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EventStartsAt { get; set; }
    public string? CoverImagePath { get; set; }
    public string? AttachmentPath { get; set; }
    public string? AttachmentName { get; set; }
}
