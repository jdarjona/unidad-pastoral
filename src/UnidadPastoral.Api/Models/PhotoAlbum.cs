namespace UnidadPastoral.Api.Models;

public class PhotoAlbum
{
    public int Id { get; set; }
    public int? ParishId { get; set; }
    public Parish? Parish { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}
