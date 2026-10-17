
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Eldre endepunkt for å hente prosjekter.
// Den nye nettsiden henter alt fra /api/content.
[ApiController]
[Route("api/projects")]
public sealed class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProjectsController(AppDbContext db) {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
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

        Response.Headers.CacheControl = "no-cache";
        return Ok(prosjekter);
    }
}
