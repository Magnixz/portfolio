
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Henter innhold til den offentlige delen av porteføljen
[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContentController(AppDbContext db) {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        // Hent prosjektene og hvilke ferdigheter de bruker
        var prosjekter = await _db.Project
            .AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.Id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.NameEn,
                p.ProjectType,
                p.ProjectTypeEn,
                p.Description,
                p.DescriptionEn,
                p.DetailedDescription,
                p.DetailedDescriptionEn,
                p.MyRole,
                p.MyRoleEn,
                p.LogoUrl,
                p.GitHubLink,
                p.DemoUrl,
                p.SortOrder,

                SkillIds = p.Skills.Select(s => s.Id).ToList()
            })
            .ToListAsync();

        // Ferdigheter med prosjektene de er brukt i
        var ferdigheter = await _db.Skills
            .AsNoTracking()
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Name)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.NameEn,
                s.Slug,
                s.Category,
                s.CategoryEn,
                s.Description,
                s.DescriptionEn,
                s.SortOrder,

                ProjectIds = s.Projects.Select(p => p.Id).ToList()
            })
            .ToListAsync();

        // Utdanning og tilhørende emner
        var utdanninger = await _db.Educations
            .AsNoTracking()
            .OrderBy(e => e.SortOrder)
            .Select(e => new
            {
                e.Id,
                e.Institution,
                e.Degree,
                e.DegreeEn,
                e.Period,
                e.Ects,
                e.SortOrder,

                Courses = e.Courses
                    .OrderBy(c => c.SortOrder)
                    .Select(c => new
                    {
                        c.Id,
                        c.EducationId,
                        c.Name,
                        c.NameEn,
                        c.SortOrder
                    })
                    .ToList()
            })
            .ToListAsync();

        Response.Headers.CacheControl = "no-cache";

        return Ok(new
        {
            projects = prosjekter,
            skills = ferdigheter,
            educations = utdanninger
        });
    }
}
