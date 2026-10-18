using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using UnidadPastoral.Api.Data;
using UnidadPastoral.Api.Services;

static void EnsureDatabaseCompatibility(AppDbContext db)
{
    using var connection = db.Database.GetDbConnection();
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='PhotoAlbums'";
        var albumTableExists = Convert.ToInt32(command.ExecuteScalar()) > 0;

        if (!albumTableExists)
        {
            using var createTable = connection.CreateCommand();
            createTable.CommandText = @"
                CREATE TABLE ""PhotoAlbums"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_PhotoAlbums"" PRIMARY KEY AUTOINCREMENT,
                    ""ParishId"" INTEGER NULL,
                    ""Name"" TEXT NOT NULL DEFAULT '',
                    ""Description"" TEXT NULL,
                    ""CreatedAt"" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT ""FK_PhotoAlbums_Parishes_ParishId"" FOREIGN KEY (""ParishId"") REFERENCES ""Parishes"" (""Id"")
                );";
            createTable.ExecuteNonQuery();
        }
    }

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('Photos') WHERE name='AlbumId'";
        var albumColumnExists = Convert.ToInt32(command.ExecuteScalar()) > 0;

        if (!albumColumnExists)
        {
            using var addColumn = connection.CreateCommand();
            addColumn.CommandText = "ALTER TABLE Photos ADD COLUMN AlbumId INTEGER NULL;";
            addColumn.ExecuteNonQuery();
        }
    }

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='PastoraleActivities'";
        var pastoraleTableExists = Convert.ToInt32(command.ExecuteScalar()) > 0;

        if (!pastoraleTableExists)
        {
            using var createTable = connection.CreateCommand();
            createTable.CommandText = @"
                CREATE TABLE ""PastoraleActivities"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_PastoraleActivities"" PRIMARY KEY AUTOINCREMENT,
                    ""Name"" TEXT NOT NULL,
                    ""Description"" TEXT NOT NULL,
                    ""ParishId"" INTEGER NOT NULL,
                    CONSTRAINT ""FK_PastoraleActivities_Parishes_ParishId"" FOREIGN KEY (""ParishId"") REFERENCES ""Parishes"" (""Id"") ON DELETE CASCADE
                );
                CREATE INDEX ""IX_PastoraleActivities_ParishId"" ON ""PastoraleActivities"" (""ParishId"");";
            createTable.ExecuteNonQuery();
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=unidad-pastoral.db"));

var jwtKey = builder.Configuration["Jwt:Key"];
if (!builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Configure Jwt:Key with a secret environment variable before starting outside Development.");
}

jwtKey ??= "dev-key-change-me-please-use-32chars";
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key must contain at least 32 bytes.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "unidad-pastoral",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "unidad-pastoral",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? [];
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(new[] { "http://localhost:5173" }.Concat(allowedOrigins).ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()));
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<UploadService>();
builder.Services.AddScoped<IPastoraleActivityService, PastoraleActivityService>();

var app = builder.Build();

var uploads = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploads);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    EnsureDatabaseCompatibility(db);
    var initialAdminPassword = builder.Configuration["Admin:InitialPassword"];
    if (string.IsNullOrWhiteSpace(initialAdminPassword) && !app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("Configure Admin:InitialPassword before starting outside Development.");
    }

    DbSeeder.Seed(
        db,
        builder.Configuration["Admin:Username"] ?? "admin",
        initialAdminPassword ?? "CambiaEsto1");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploads),
    RequestPath = "/uploads"
});
app.MapControllers();
app.Run();
