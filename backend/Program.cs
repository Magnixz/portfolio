
using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using System.Net;

var bygger = WebApplication.CreateBuilder(args);

// API og PostgreSQL
bygger.Services.AddControllersWithViews();

bygger.Services.AddDbContext<AppDbContext>(valg =>
{
    valg.UseNpgsql(
        bygger.Configuration.GetConnectionString("DefaultConnection")
    );
});

// Innlogging til admin-panelet
bygger.Services
    .AddIdentity<IdentityUser, IdentityRole>(valg =>
    {
        valg.Password.RequiredLength = 14;
        valg.Password.RequireDigit = true;
        valg.Password.RequireUppercase = true;
        valg.Password.RequireLowercase = true;
        valg.Password.RequireNonAlphanumeric = true;

        valg.User.RequireUniqueEmail = true;

        valg.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        valg.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

bygger.Services.ConfigureApplicationCookie(valg =>
{
    valg.Cookie.Name = "PortfolioAuth";
    valg.Cookie.HttpOnly = true;

    // Localhost bruker HTTP under utvikling, produksjon bruker HTTPS
    valg.Cookie.SecurePolicy = bygger.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;

    valg.Cookie.SameSite = SameSiteMode.Strict;
    valg.ExpireTimeSpan = TimeSpan.FromHours(8);
    valg.SlidingExpiration = false;

    // Returner statuskode i stedet for å sende API-kall til innloggingsside
    valg.Events.OnRedirectToLogin = svar =>
    {
        svar.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    valg.Events.OnRedirectToAccessDenied = svar =>
    {
        svar.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

// Sikkerhetstoken for endringer gjennom API-et
bygger.Services.AddAntiforgery(valg =>
{
    valg.HeaderName = "X-CSRF-TOKEN";

    valg.Cookie.SecurePolicy = bygger.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
});

// Ved passordbytte skal gamle innloggingssesjoner slutte å virke
bygger.Services.Configure<SecurityStampValidatorOptions>(valg =>
{
    valg.ValidationInterval = TimeSpan.Zero;
});

bygger.Services.AddAuthorization();

// Begrenser antall innloggingsforsøk
bygger.Services.AddRateLimiter(valg =>
{
    valg.RejectionStatusCode = 429;

    valg.AddFixedWindowLimiter("login", begrensning =>
    {
        begrensning.PermitLimit = 5;
        begrensning.Window = TimeSpan.FromMinutes(1);
        begrensning.QueueLimit = 0;
    });
});

// Stoler bare på videresendt HTTPS-info fra proxy på samme maskin
bygger.Services.Configure<ForwardedHeadersOptions>(valg =>
{
    valg.ForwardedHeaders = ForwardedHeaders.XForwardedProto;
    valg.KnownProxies.Add(IPAddress.Loopback);
    valg.KnownProxies.Add(IPAddress.IPv6Loopback);
});

var app = bygger.Build();

app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment()) {
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Kommandoer som bare skal kjøre vedlikehold, ikke selve nettsiden
if (args.Contains("--diagnose"))
{
    await PortfolioDiagnostics.RunAsync(app.Services);
    return;
}

if (args.Contains("--reset-admin") || args.Contains("--reset-all-users"))
{
    await AdminBootstrap.ResetAdminAsync(
        app.Services,
        args.Contains("--reset-all-users")
    );
    return;
}

if (args.Contains("--import-legacy-skills"))
{
    await LegacySkillImporter.ImportAsync(app.Services);
    return;
}

// Lager første admin-bruker dersom databasen ikke har noen fra før
// Migreringer kjøres seperat
await AdminBootstrap.InitializeAsync(app.Services);

app.Run();
