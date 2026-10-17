
namespace Backend.Models;

// Et prosjekt med norske og engelske tekster
public class Project
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";

    public string ProjectType { get; set; } = "";
    public string ProjectTypeEn { get; set; } = "";

    public string Description { get; set; } = "";
    public string DescriptionEn { get; set; } = "";

    public string? DetailedDescription { get; set; }
    public string? DetailedDescriptionEn { get; set; }

    public string? MyRole { get; set; }
    public string? MyRoleEn { get; set; }

    public string? LogoUrl { get; set; }
    public string? GitHubLink { get; set; }
    public string? DemoUrl { get; set; }

    public int SortOrder { get; set; }

    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
}

// Ferdighetene som kan kobles til prosjektene
public class Skill
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";

    public string Slug { get; set; } = "";

    public string Category { get; set; } = "";
    public string CategoryEn { get; set; } = "";

    public string Description { get; set; } = "";
    public string DescriptionEn { get; set; } = "";

    public int SortOrder { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

// Utdanning med en liste over emner
public class Education
{
    public int Id { get; set; }

    public string Institution { get; set; } = "";

    public string Degree { get; set; } = "";
    public string DegreeEn { get; set; } = "";

    public string Period { get; set; } = "";
    public int Ects { get; set; }

    public int SortOrder { get; set; }

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}

public class Course
{
    public int Id { get; set; }

    public int EducationId { get; set; }
    public Education? Education { get; set; }

    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";

    public int SortOrder { get; set; }
}
