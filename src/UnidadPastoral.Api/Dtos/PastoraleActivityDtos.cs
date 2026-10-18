using System.ComponentModel.DataAnnotations;

namespace UnidadPastoral.Api.Dtos;

/// <summary>Request data for creating a pastoral activity.</summary>
public sealed record CreatePastoraleActivityRequest
{
    /// <summary>Name displayed for the activity.</summary>
    [Required, MaxLength(200)]
    public required string Name { get; init; }

    /// <summary>Description of the activity.</summary>
    [Required, MaxLength(4000)]
    public required string Description { get; init; }

    /// <summary>Parish hosting the activity.</summary>
    [Range(1, int.MaxValue)]
    public int ParishId { get; init; }
}

/// <summary>Request data for updating a pastoral activity.</summary>
public sealed record UpdatePastoraleActivityRequest
{
    /// <summary>Name displayed for the activity.</summary>
    [Required, MaxLength(200)]
    public required string Name { get; init; }

    /// <summary>Description of the activity.</summary>
    [Required, MaxLength(4000)]
    public required string Description { get; init; }

    /// <summary>Parish hosting the activity.</summary>
    [Range(1, int.MaxValue)]
    public int ParishId { get; init; }
}

/// <summary>Pastoral activity details returned by the API.</summary>
public sealed record PastoraleActivityResponse(
    int Id,
    string Name,
    string Description,
    int ParishId,
    string ParishName);