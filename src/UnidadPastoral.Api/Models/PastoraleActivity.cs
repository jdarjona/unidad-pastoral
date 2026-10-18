namespace UnidadPastoral.Api.Models;

public class PastoraleActivity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int ParishId { get; set; }
    public Parish Parish { get; set; } = null!;
}