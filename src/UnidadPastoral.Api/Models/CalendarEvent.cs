namespace UnidadPastoral.Api.Models;

public class CalendarEvent
{
    public int Id { get; set; }
    public int ParishId { get; set; }
    public Parish Parish { get; set; } = null!;
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool AllDay { get; set; }
}
