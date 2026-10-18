using UnidadPastoral.Api.Dtos;

namespace UnidadPastoral.Api.Services;

public interface IPastoraleActivityService
{
    Task<IReadOnlyList<PastoraleActivityResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<PastoraleActivityResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<PastoraleActivityResponse> CreateAsync(CreatePastoraleActivityRequest request, CancellationToken cancellationToken);
    Task<PastoraleActivityResponse?> UpdateAsync(int id, UpdatePastoraleActivityRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}