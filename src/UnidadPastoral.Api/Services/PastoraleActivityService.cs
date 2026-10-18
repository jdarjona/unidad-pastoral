using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Dtos;
using UnidadPastoral.Api.Models;

namespace UnidadPastoral.Api.Services;

public sealed class PastoraleActivityService(AppDbContext db) : IPastoraleActivityService
{
    public async Task<IReadOnlyList<PastoraleActivityResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var activities = await db.PastoraleActivities
            .AsNoTracking()
            .Include(activity => activity.Parish)
            .OrderBy(activity => activity.Parish.Name)
            .ThenBy(activity => activity.Name)
            .ToListAsync(cancellationToken);

        return activities.Select(ToResponse).ToList();
    }

    public async Task<PastoraleActivityResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var activity = await db.PastoraleActivities
            .AsNoTracking()
            .Include(item => item.Parish)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        return activity is null ? null : ToResponse(activity);
    }

    public async Task<PastoraleActivityResponse> CreateAsync(CreatePastoraleActivityRequest request, CancellationToken cancellationToken)
    {
        var parish = await db.Parishes.FindAsync([request.ParishId], cancellationToken);
        if (parish is null)
        {
            throw new ArgumentException("Paroisse introuvable.");
        }

        var activity = new PastoraleActivity
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            ParishId = parish.Id,
            Parish = parish
        };

        db.PastoraleActivities.Add(activity);
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(activity);
    }

    public async Task<PastoraleActivityResponse?> UpdateAsync(int id, UpdatePastoraleActivityRequest request, CancellationToken cancellationToken)
    {
        var activity = await db.PastoraleActivities
            .Include(item => item.Parish)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (activity is null)
        {
            return null;
        }

        var parish = await db.Parishes.FindAsync([request.ParishId], cancellationToken);
        if (parish is null)
        {
            throw new ArgumentException("Paroisse introuvable.");
        }

        activity.Name = request.Name.Trim();
        activity.Description = request.Description.Trim();
        activity.ParishId = parish.Id;
        activity.Parish = parish;

        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(activity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var activity = await db.PastoraleActivities.FindAsync([id], cancellationToken);
        if (activity is null)
        {
            return false;
        }

        db.PastoraleActivities.Remove(activity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static PastoraleActivityResponse ToResponse(PastoraleActivity activity) =>
        new(activity.Id, activity.Name, activity.Description, activity.ParishId, activity.Parish.Name);
}