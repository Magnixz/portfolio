
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

// Sjekker om API-et får kontakt med databasen.
// Viser ikke passord, adresser eller annen tilkoblingsinfo.
[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _konfigurasjon;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        AppDbContext db,
        IConfiguration configuration,
        ILogger<HealthController> logger)
    {
        _db = db;
        _konfigurasjon = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken avbrytToken)
    {
        Response.Headers.CacheControl = "no-store";

        if (string.IsNullOrWhiteSpace(
            _konfigurasjon.GetConnectionString("DefaultConnection")))
        {
            return StatusCode(503, new
            {
                status = "not-ready",
                reason = "database-not-configured",
                hint = "Configure ConnectionStrings__DefaultConnection on the backend."
            });
        }

        try
        {
            // Avbryter sjekken hvis databasen ikke svarer innen 8 sekunder
            using var tidsfrist = CancellationTokenSource.CreateLinkedTokenSource(avbrytToken);
            tidsfrist.CancelAfter(TimeSpan.FromSeconds(8));

            if (!await _db.Database.CanConnectAsync(tidsfrist.Token))
            {
                return StatusCode(503, new
                {
                    status = "not-ready",
                    reason = "database-unreachable"
                });
            }

            var manglendeMigreringer = (
                await _db.Database.GetPendingMigrationsAsync(tidsfrist.Token)
            ).ToList();

            if (manglendeMigreringer.Count != 0)
            {
                return StatusCode(503, new
                {
                    status = "not-ready",
                    reason = "pending-migrations",
                    pendingCount = manglendeMigreringer.Count,
                    hint = "Back up the database, then run: dotnet ef database update"
                });
            }

            return Ok(new
            {
                status = "ok",
                database = "connected",
                migrations = "up-to-date"
            });
        }
        catch (Exception feil) when (
            feil is not OperationCanceledException ||
            !avbrytToken.IsCancellationRequested)
        {
            _logger.LogWarning(feil, "Portfolio database readiness check failed");

            return StatusCode(503, new
            {
                status = "not-ready",
                reason = "database-check-failed",
                hint = "Read backend terminal logs (do not share passwords or connection strings)."
            });
        }
    }
}
