
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

public record LoginRequest(string Email, string Password);

// Innloggingen som brukes på /administrasjon
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<IdentityUser> _innlogging;
    private readonly IAntiforgery _csrf;

    public AuthController(
        SignInManager<IdentityUser> signIn,
        IAntiforgery antiforgery)
    {
        _innlogging = signIn;
        _csrf = antiforgery;
    }

    // Lager CSRF-token som sendes med når vi endrer noe
    [HttpGet("csrf")]
    public IActionResult Csrf()
    {
        var token = _csrf.GetAndStoreTokens(HttpContext);

        Response.Headers.CacheControl = "no-store";

        return Ok(new { token = token.RequestToken });
    }

    // Sjekker om brukeren er logget inn
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            authenticated = User.Identity?.IsAuthenticated == true
        });
    }

    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest foresporsel)
    {
        var resultat = await _innlogging.PasswordSignInAsync(
            foresporsel.Email,
            foresporsel.Password,
            isPersistent: false,
            lockoutOnFailure: true
        );

        if (!resultat.Succeeded)
        {
            return Unauthorized(new { message = "Ugyldig innlogging." });
        }

        return Ok(new { authenticated = true });
    }

    [HttpPost("logout")]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _innlogging.SignOutAsync();
        return NoContent();
    }
}
