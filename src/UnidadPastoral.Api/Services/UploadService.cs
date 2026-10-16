namespace UnidadPastoral.Api.Services;

public class UploadService(IWebHostEnvironment environment)
{
    public async Task<string> SaveAsync(IFormFile file, string folder)
    {
        var root = Path.Combine(environment.ContentRootPath, "uploads", folder);
        Directory.CreateDirectory(root);
        var extension = Path.GetExtension(file.FileName);
        var name = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(root, name);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream);
        return $"/uploads/{folder}/{name}";
    }
}
