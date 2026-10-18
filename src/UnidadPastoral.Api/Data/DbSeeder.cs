using Microsoft.AspNetCore.Identity;
using UnidadPastoral.Api.Models;

namespace UnidadPastoral.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db, string adminUsername, string adminPassword)
    {
        if (!db.Parishes.Any())
        {
            db.Parishes.AddRange(
                new Parish
                {
                    Name = "St-Nicolas",
                    Slug = "st-nicolas",
                    Patron = "Saint Nicolas",
                    Address = "Paroisse Saint-Nicolas",
                    MassSchedule = "Horaires à confirmer auprès de la paroisse",
                    Description = "Paroisse de l’unité pastorale Saint-Nicolas.",
                    AccentColor = "#2f5d50"
                },
                new Parish
                {
                    Name = "St-Hubert",
                    Slug = "st-hubert",
                    Patron = "Saint Hubert",
                    Address = "Paroisse Saint-Hubert",
                    MassSchedule = "Horaires à confirmer auprès de la paroisse",
                    Description = "Paroisse de l’unité pastorale Saint-Hubert.",
                    AccentColor = "#6b4c7a"
                },
                new Parish
                {
                    Name = "N.-D. des Pauvres",
                    Slug = "n-d-des-pauvres",
                    Patron = "Notre-Dame des Pauvres",
                    Address = "Paroisse Notre-Dame des Pauvres",
                    MassSchedule = "Horaires à confirmer auprès de la paroisse",
                    Description = "Paroisse de l’unité pastorale Notre-Dame des Pauvres.",
                    AccentColor = "#8b3a2a"
                },
                new Parish
                {
                    Name = "St-François de Sales",
                    Slug = "st-francois-de-sales",
                    Patron = "Saint François de Sales",
                    Address = "Paroisse Saint-François de Sales",
                    MassSchedule = "Horaires à confirmer auprès de la paroisse",
                    Description = "Paroisse de l’unité pastorale Saint-François de Sales.",
                    AccentColor = "#3d5a80"
                },
                new Parish
                {
                    Name = "St-Gilles",
                    Slug = "st-gilles",
                    Patron = "Saint Gilles",
                    Address = "Paroisse Saint-Gilles",
                    MassSchedule = "Horaires à confirmer auprès de la paroisse",
                    Description = "Paroisse de l’unité pastorale Saint-Gilles.",
                    AccentColor = "#9a6b2f"
                });
            db.SaveChanges();
        }

        if (!db.AdminUsers.Any())
        {
            var hasher = new PasswordHasher<AdminUser>();
            var admin = new AdminUser { Username = adminUsername };
            admin.PasswordHash = hasher.HashPassword(admin, adminPassword);
            db.AdminUsers.Add(admin);
            db.SaveChanges();
        }

        if (!db.Posts.Any())
        {
            var first = db.Parishes.OrderBy(p => p.Id).First();
            db.Posts.AddRange(
                new Post
                {
                    ParishId = first.Id,
                    Type = PostType.News,
                    Title = "Bienvenue sur le site de l’unité pastorale",
                    Slug = "bienvenue-unite-pastorale",
                    Body = "Le site de l’unité pastorale publie les informations de la communauté et les annonces des paroisses.",
                    PublishedAt = DateTime.UtcNow
                },
                new Post
                {
                    ParishId = first.Id,
                    Type = PostType.Event,
                    Title = "Rencontre de l’unité pastorale",
                    Slug = "rencontre-unite-pastorale",
                    Body = "Moment de partage et de célébration pour la communauté de l’unité pastorale.",
                    PublishedAt = DateTime.UtcNow,
                    EventStartsAt = DateTime.UtcNow.Date.AddDays(14).AddHours(18)
                });

            var start = DateTime.UtcNow.Date.AddDays(7).AddHours(11);
            db.CalendarEvents.Add(new CalendarEvent
            {
                ParishId = first.Id,
                Title = "Célébration dominicale",
                Description = "Moment de prière et de célébration de la communauté.",
                Location = first.Address,
                StartsAt = start,
                EndsAt = start.AddHours(1),
                AllDay = false
            });
            db.SaveChanges();
        }
    }
}
