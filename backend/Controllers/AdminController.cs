
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Data som sendes fra adminpanelet til backend
// Navnene må stemme med feltene i React

public record ProjectInput(
    string Name,
    string NameEn,
    string ProjectType,
    string ProjectTypeEn,
    string Description,
    string DescriptionEn,
    string? DetailedDescription,
    string? DetailedDescriptionEn,
    string? MyRole,
    string? MyRoleEn,
    string? LogoUrl,
    string? GitHubLink,
    string? DemoUrl,
    int SortOrder,
    List<int> SkillIds
);

public record SkillInput(
    string Name,
    string NameEn,
    string Slug,
    string Category,
    string CategoryEn,
    string Description,
    string DescriptionEn,
    int SortOrder
);

public record EducationInput(
    string Institution,
    string Degree,
    string DegreeEn,
    string Period,
    int Ects,
    int SortOrder
);

public record CourseInput(
    int EducationId,
    string Name,
    string NameEn,
    int SortOrder
);

// Dette API-et brukes bare når man er logget inn
[ApiController]
[Authorize]
[ValidateAntiForgeryToken]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) {
        _db = db;
    }

    // Finner ferdighetene som er valgt i skjemaet
    private async Task<List<Skill>> HentFerdigheter(IEnumerable<int> ider)
    {
        var unikeIder = ider.Distinct().ToList();

        return await _db.Skills
            .Where(s => unikeIder.Contains(s.Id))
            .ToListAsync();
    }

    // ========================
    // PROSJEKTER
    // ========================

    [HttpPost("projects")]
    public async Task<IActionResult> CreateProject(ProjectInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest("Prosjektnavn mangler.");

        var ider = input.SkillIds ?? new List<int>();
        var ferdigheter = await HentFerdigheter(ider);

        if (ferdigheter.Count != ider.Distinct().Count())
            return BadRequest("Ugyldig ferdighets-ID.");

        var prosjekt = new Project();

        OppdaterProsjekt(prosjekt, input);
        prosjekt.Skills = ferdigheter;

        _db.Project.Add(prosjekt);
        await _db.SaveChangesAsync();

        return Ok(new { prosjekt.Id });
    }

    [HttpPut("projects/{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, ProjectInput input)
    {
        var prosjekt = await _db.Project
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prosjekt == null) return NotFound();

        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest("Prosjektnavn mangler.");

        var ider = input.SkillIds ?? new List<int>();
        var ferdigheter = await HentFerdigheter(ider);

        if (ferdigheter.Count != ider.Distinct().Count())
            return BadRequest("Ugyldig ferdighets-ID.");

        OppdaterProsjekt(prosjekt, input);

        prosjekt.Skills.Clear();

        foreach (var ferdighet in ferdigheter) {
            prosjekt.Skills.Add(ferdighet);
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("projects/{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var prosjekt = await _db.Project.FindAsync(id);

        if (prosjekt == null) return NotFound();

        _db.Project.Remove(prosjekt);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void OppdaterProsjekt(Project p, ProjectInput input)
    {
        p.Name = input.Name.Trim();
        p.NameEn = input.NameEn?.Trim() ?? "";

        p.ProjectType = input.ProjectType ?? "";
        p.ProjectTypeEn = input.ProjectTypeEn ?? "";

        p.Description = input.Description ?? "";
        p.DescriptionEn = input.DescriptionEn ?? "";

        p.DetailedDescription = input.DetailedDescription;
        p.DetailedDescriptionEn = input.DetailedDescriptionEn;

        p.MyRole = input.MyRole;
        p.MyRoleEn = input.MyRoleEn;

        p.LogoUrl = input.LogoUrl;
        p.GitHubLink = input.GitHubLink;
        p.DemoUrl = input.DemoUrl;

        p.SortOrder = input.SortOrder;
    }

    // ========================
    // FERDIGHETER
    // ========================

    [HttpPost("skills")]
    public async Task<IActionResult> CreateSkill(SkillInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Name) ||
            string.IsNullOrWhiteSpace(input.Slug))
            return BadRequest("Navn og slug er påkrevd.");

        var slug = input.Slug.Trim().ToLowerInvariant();

        if (!System.Text.RegularExpressions.Regex.IsMatch(
            slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$"))
            return BadRequest("Slug kan bare bruke små bokstaver, tall og bindestrek.");

        if (await _db.Skills.AnyAsync(s => s.Slug == slug))
            return Conflict("Slug finnes allerede.");

        var ferdighet = new Skill();
        OppdaterFerdighet(ferdighet, input);

        _db.Skills.Add(ferdighet);
        await _db.SaveChangesAsync();

        return Ok(new { ferdighet.Id });
    }

    [HttpPut("skills/{id:int}")]
    public async Task<IActionResult> UpdateSkill(int id, SkillInput input)
    {
        var ferdighet = await _db.Skills.FindAsync(id);

        if (ferdighet == null) return NotFound();

        if (string.IsNullOrWhiteSpace(input.Name) ||
            string.IsNullOrWhiteSpace(input.Slug))
            return BadRequest("Navn og slug er påkrevd.");

        var slug = input.Slug.Trim().ToLowerInvariant();

        if (!System.Text.RegularExpressions.Regex.IsMatch(
            slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$"))
            return BadRequest("Slug kan bare bruke små bokstaver, tall og bindestrek.");

        if (await _db.Skills.AnyAsync(s => s.Id != id && s.Slug == slug))
            return Conflict("Slug finnes allerede.");

        OppdaterFerdighet(ferdighet, input);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("skills/{id:int}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var ferdighet = await _db.Skills.FindAsync(id);

        if (ferdighet == null) return NotFound();

        _db.Skills.Remove(ferdighet);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void OppdaterFerdighet(Skill s, SkillInput input)
    {
        s.Name = input.Name.Trim();
        s.NameEn = input.NameEn?.Trim() ?? "";

        s.Slug = input.Slug.Trim().ToLowerInvariant();

        s.Category = input.Category?.Trim() ?? "";
        s.CategoryEn = input.CategoryEn?.Trim() ?? "";

        s.Description = input.Description ?? "";
        s.DescriptionEn = input.DescriptionEn ?? "";

        s.SortOrder = input.SortOrder;
    }

    // ========================
    // UTDANNING
    // ========================

    [HttpPost("educations")]
    public async Task<IActionResult> CreateEducation(EducationInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Degree))
            return BadRequest("Studieretning mangler.");

        var utdanning = new Education();
        OppdaterUtdanning(utdanning, input);

        _db.Educations.Add(utdanning);
        await _db.SaveChangesAsync();

        return Ok(new { utdanning.Id });
    }

    [HttpPut("educations/{id:int}")]
    public async Task<IActionResult> UpdateEducation(int id, EducationInput input)
    {
        var utdanning = await _db.Educations.FindAsync(id);

        if (utdanning == null) return NotFound();

        if (string.IsNullOrWhiteSpace(input.Degree))
            return BadRequest("Studieretning mangler.");

        OppdaterUtdanning(utdanning, input);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("educations/{id:int}")]
    public async Task<IActionResult> DeleteEducation(int id)
    {
        var utdanning = await _db.Educations.FindAsync(id);

        if (utdanning == null) return NotFound();

        _db.Educations.Remove(utdanning);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void OppdaterUtdanning(Education e, EducationInput input)
    {
        e.Institution = input.Institution?.Trim() ?? "";
        e.Degree = input.Degree.Trim();
        e.DegreeEn = input.DegreeEn?.Trim() ?? "";
        e.Period = input.Period?.Trim() ?? "";
        e.Ects = input.Ects;
        e.SortOrder = input.SortOrder;
    }

    // ========================
    // EMNER
    // ========================

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse(CourseInput input)
    {
        if (!await _db.Educations.AnyAsync(e => e.Id == input.EducationId))
            return BadRequest("Ugyldig utdanning.");

        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest("Emnenavn mangler.");

        var emne = new Course();
        OppdaterEmne(emne, input);

        _db.Courses.Add(emne);
        await _db.SaveChangesAsync();

        return Ok(new { emne.Id });
    }

    [HttpPut("courses/{id:int}")]
    public async Task<IActionResult> UpdateCourse(int id, CourseInput input)
    {
        var emne = await _db.Courses.FindAsync(id);

        if (emne == null) return NotFound();

        if (!await _db.Educations.AnyAsync(e => e.Id == input.EducationId))
            return BadRequest("Ugyldig utdanning.");

        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest("Emnenavn mangler.");

        OppdaterEmne(emne, input);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("courses/{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var emne = await _db.Courses.FindAsync(id);

        if (emne == null) return NotFound();

        _db.Courses.Remove(emne);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void OppdaterEmne(Course c, CourseInput input)
    {
        c.EducationId = input.EducationId;
        c.Name = input.Name.Trim();
        c.NameEn = input.NameEn?.Trim() ?? "";
        c.SortOrder = input.SortOrder;
    }
}
