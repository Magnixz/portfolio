namespace Backend.Models;

public class Project
{
    public int Id { get; set; }
    public string Name {get; set;} = "";
    public string ProjectType { get; set; } = "";
    public string Description { get; set; } = "";
    public string? LogoUrl { get; set; } = "";
    public string? GitHubLink { get; set; } = "";

    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
}