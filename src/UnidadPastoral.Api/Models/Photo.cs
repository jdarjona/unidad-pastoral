namespace UnidadPastoral.Api.Models;

public class Photo
{
    public int Id { get; set; }
    public int? ParishId { get; set; }
    public Parish? Parish { get; set; }
    public int? AlbumId { get; set; }
    public PhotoAlbum? Album { get; set; }
    public string Title { get; set; } = "";
    public string Caption { get; set; } = "";
    public string FilePath { get; set; } = "";
    public DateTime TakenAt { get; set; } = DateTime.UtcNow;
}
