
using System.Text.Json;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Kan importere ferdigheter fra den gamle JSON-filen
public static class LegacySkillImporter
{
    public static async Task ImportAsync(IServiceProvider tjenester)
    {
        using var scope = tjenester.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var migreringer = await db.Database.GetPendingMigrationsAsync();

        if (migreringer.Any())
        {
            throw new InvalidOperationException(
                "Database has pending migrations. " +
                "Run 'dotnet ef database update' first."
            );
        }

        // Filen ligger sammen med backend når den bygges
        var filSti = Path.Combine(
            AppContext.BaseDirectory,
            "SeedData",
            "legacy-skills.json"
        );

        if (!File.Exists(filSti))
        {
            throw new FileNotFoundException(
                "Legacy skills data is not included in the build",
                filSti
            );
        }

        var data = JsonSerializer.Deserialize<List<SkillSeed>>(
            await File.ReadAllTextAsync(filSti),
            new JsonSerializerOptions {
                PropertyNameCaseInsensitive = true
            }
        ) ?? new();

        // Unngår at samme ferdighet blir lagt inn flere ganger
        var eksisterende = (
            await db.Skills.Select(s => s.Slug).ToListAsync()
        ).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var lagtTil = 0;

        foreach (var ferdighet in data)
        {
            if (string.IsNullOrWhiteSpace(ferdighet.Slug) ||
                !eksisterende.Add(ferdighet.Slug))
            {
                continue;
            }

            db.Skills.Add(new Skill
            {
                Slug = ferdighet.Slug,
                Name = ferdighet.Name,
                NameEn = ferdighet.NameEn,
                Category = ferdighet.Category,
                CategoryEn = ferdighet.CategoryEn,
                Description = ferdighet.Description,
                DescriptionEn = ferdighet.DescriptionEn,
                SortOrder = ferdighet.SortOrder
            });

            lagtTil++;
        }

        await db.SaveChangesAsync();

        Console.WriteLine(
            $"Imported {lagtTil} legacy skills. " +
            "Existing records were left unchanged."
        );
    }

    private sealed record SkillSeed(
        string Slug,
        string Name,
        string NameEn,
        string Category,
        string CategoryEn,
        string Description,
        string DescriptionEn,
        int SortOrder
    );
}
