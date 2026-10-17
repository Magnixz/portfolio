
using Backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Brukes til å sjekke database og innhold fra terminalen
public static class PortfolioDiagnostics
{
    public static async Task RunAsync(IServiceProvider tjenester)
    {
        using var scope = tjenester.CreateScope();

        var konfig = scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

        if (string.IsNullOrWhiteSpace(
            konfig.GetConnectionString("DefaultConnection")))
        {
            Console.WriteLine("ERROR: Database connection is missing.");
            Console.WriteLine("Set ConnectionStrings__DefaultConnection for the backend.");
            Console.WriteLine("No database changes have been made.");
            return;
        }

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Viser hvilken database applikasjonen er koblet til
        try
        {
            Console.WriteLine(
                "Configured database: " +
                db.Database.GetDbConnection().Database
            );
        }
        catch
        {
            Console.WriteLine(
                "Database name could not be read from the configuration."
            );
        }

        try
        {
            var tilkoblet = await db.Database.CanConnectAsync();

            Console.WriteLine("Database reachable: " + tilkoblet);

            if (!tilkoblet)
            {
                Console.WriteLine(
                    "Check PostgreSQL, configured host, user, password and database."
                );
                return;
            }

            // Sjekker om det er migreringer som ikke er kjørt
            var migreringer = (
                await db.Database.GetPendingMigrationsAsync()
            ).ToList();

            Console.WriteLine("Pending migrations: " + migreringer.Count);

            foreach (var navn in migreringer) {
                Console.WriteLine("  " + navn);
            }

            if (migreringer.Count > 0)
            {
                Console.WriteLine(
                    "Back up your existing database, then run 'dotnet ef database update'."
                );
                Console.WriteLine("No database changes have been made.");
                return;
            }

            // Sjekker hvor mye innhold som ligger i databasen
            Console.WriteLine("Projects: " + await db.Project.CountAsync());
            Console.WriteLine("Skills: " + await db.Skills.CountAsync());
            Console.WriteLine("Education entries: " + await db.Educations.CountAsync());
            Console.WriteLine("Courses: " + await db.Courses.CountAsync());

            var brukere = scope.ServiceProvider
                .GetRequiredService<UserManager<IdentityUser>>();

            Console.WriteLine("Login users: " + await brukere.Users.CountAsync());
            Console.WriteLine("All schema-dependent queries completed successfully.");
        }
        catch (Exception feil)
        {
            // Ikke skriv ut passord eller tilkoblingsstreng ved feil
            Console.Error.WriteLine(
                $"Database check failed ({feil.GetType().Name})."
            );

            Console.Error.WriteLine(
                "Check PostgreSQL logs, connection configuration and migration status."
            );

            Console.Error.WriteLine(
                "The diagnostic command has not changed your database."
            );
        }
    }
}
