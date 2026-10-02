namespace Backend.Models;

public class Skill
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}