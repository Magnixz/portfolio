using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {    
    }

    public DbSet<Project> Project { get; set; }
    public DbSet<Skill> Skills { get; set; }
}
