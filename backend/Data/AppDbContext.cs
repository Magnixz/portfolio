
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

// Databasetabellene og koblingene mellom dem
public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Beholder tabellnavnene, siden databasen allerede finnes
    public DbSet<Project> Project => Set<Project>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Course> Courses => Set<Course>();

    protected override void OnModelCreating(ModelBuilder bygger)
    {
        base.OnModelCreating(bygger);

        // Prosjekter kan bruke flere ferdigheter, og omvendt
        bygger.Entity<Project>()
            .HasMany(p => p.Skills)
            .WithMany(s => s.Projects);

        // Hver ferdighet skal ha en unik slug
        bygger.Entity<Skill>()
            .HasIndex(s => s.Slug)
            .IsUnique();

        // En utdanning kan ha flere emner
        bygger.Entity<Education>()
            .HasMany(e => e.Courses)
            .WithOne(c => c.Education)
            .HasForeignKey(c => c.EducationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
