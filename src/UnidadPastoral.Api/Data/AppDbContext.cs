using Microsoft.EntityFrameworkCore;
using UnidadPastoral.Api.Models;

namespace UnidadPastoral.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Parish> Parishes => Set<Parish>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<PhotoAlbum> PhotoAlbums => Set<PhotoAlbum>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Parish>().HasIndex(p => p.Slug).IsUnique();
        modelBuilder.Entity<Post>().HasIndex(p => p.Slug).IsUnique();
        modelBuilder.Entity<AdminUser>().HasIndex(u => u.Username).IsUnique();
    }
}
