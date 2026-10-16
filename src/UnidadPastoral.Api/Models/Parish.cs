namespace UnidadPastoral.Api.Models;

public class Parish
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Patron { get; set; } = "";
    public string Address { get; set; } = "";
    public string MassSchedule { get; set; } = "";
    public string Description { get; set; } = "";
    public string AccentColor { get; set; } = "#2f5d50";

    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<PhotoAlbum> Albums { get; set; } = new List<PhotoAlbum>();
    public ICollection<CalendarEvent> CalendarEvents { get; set; } = new List<CalendarEvent>();
}
