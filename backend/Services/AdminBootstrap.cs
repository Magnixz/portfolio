
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

// Oppsett og vedlikehold av administratorkonto
public static class AdminBootstrap
{
    public static async Task InitializeAsync(IServiceProvider tjenester)
    {
        using var scope = tjenester.CreateScope();

        var konfig = scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

        var brukerManager = scope.ServiceProvider
            .GetRequiredService<UserManager<IdentityUser>>();

        var epost = konfig["ADMIN_EMAIL"]?.Trim();
        var passord = konfig["ADMIN_PASSWORD"];

        if (string.IsNullOrWhiteSpace(epost) ||
            string.IsNullOrEmpty(passord))
        {
            return;
        }

        // Skal ikke overskrive passord eller lage flere administratorer
        if (await brukerManager.FindByEmailAsync(epost) != null ||
            brukerManager.Users.Any())
        {
            return;
        }

        var resultat = await brukerManager.CreateAsync(
            new IdentityUser
            {
                UserName = epost,
                Email = epost,
                EmailConfirmed = true
            },
            passord
        );

        SjekkResultat(resultat, "Kunne ikke opprette første administratorkonto");
    }

    // Brukes bare gjennom terminalkommando, ikke nettsiden
    public static async Task ResetAdminAsync(
        IServiceProvider tjenester,
        bool slettAlleBrukere)
    {
        if (slettAlleBrukere)
        {
            if (Console.IsInputRedirected)
            {
                throw new InvalidOperationException(
                    "Sletting krever en interaktiv terminal."
                );
            }

            Console.Write(
                "Dette vil slette ALLE innloggingsbrukere, " +
                "men ikke porteføljeinnhold. " +
                "Skriv SLETT ALLE BRUKERE: "
            );

            if (Console.ReadLine() != "SLETT ALLE BRUKERE")
            {
                Console.WriteLine("Avbrutt – ingen endringer ble gjort.");
                return;
            }
        }

        using var scope = tjenester.CreateScope();

        var konfig = scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

        var brukerManager = scope.ServiceProvider
            .GetRequiredService<UserManager<IdentityUser>>();

        Console.Write("E-post for admin (tomt = ADMIN_EMAIL): ");

        var skrevetEpost = Console.ReadLine()?.Trim();

        var epost = string.IsNullOrWhiteSpace(skrevetEpost)
            ? konfig["ADMIN_EMAIL"]?.Trim()
            : skrevetEpost;

        if (string.IsNullOrWhiteSpace(epost))
        {
            throw new InvalidOperationException(
                "Angi e-post eller sett ADMIN_EMAIL."
            );
        }

        Console.Write(
            "Nytt passord (minst 14 tegn, stor/liten " +
            "bokstav, tall og spesialtegn): "
        );

        var passord = LesPassord();

        if (string.IsNullOrWhiteSpace(passord))
        {
            throw new InvalidOperationException("Passord kan ikke være tomt.");
        }

        // Sjekker passordet før noe eventuelt blir slettet
        var bruker = new IdentityUser
        {
            UserName = epost,
            Email = epost,
            EmailConfirmed = true
        };

        foreach (var sjekk in brukerManager.PasswordValidators)
        {
            var resultat = await sjekk.ValidateAsync(
                brukerManager,
                bruker,
                passord
            );

            SjekkResultat(resultat, "Ugyldig passord");
        }

        try
        {
            if (new System.Net.Mail.MailAddress(epost).Address != epost)
            {
                throw new FormatException("E-postadressen er ugyldig.");
            }
        }
        catch (FormatException)
        {
            throw new InvalidOperationException(
                "Oppgi en gyldig e-postadresse."
            );
        }

        var db = scope.ServiceProvider
            .GetRequiredService<Backend.Data.AppDbContext>();

        await using var transaksjon = slettAlleBrukere
            ? await db.Database.BeginTransactionAsync()
            : null;

        if (slettAlleBrukere)
        {
            foreach (var eksisterendeBruker in brukerManager.Users.ToList())
            {
                SjekkResultat(
                    await brukerManager.DeleteAsync(eksisterendeBruker),
                    "Kunne ikke slette bruker"
                );
            }
        }

        var admin = await brukerManager.FindByEmailAsync(epost);

        if (admin == null)
        {
            if (brukerManager.Users.Any())
            {
                throw new InvalidOperationException(
                    "En annen bruker finnes allerede. " +
                    "Bruk samme e-post eller --reset-all-users."
                );
            }

            SjekkResultat(
                await brukerManager.CreateAsync(bruker, passord),
                "Kunne ikke opprette admin"
            );
        }
        else
        {
            // Bytter passordet og gjør gamle sesjoner ugyldige
            var token = await brukerManager.GeneratePasswordResetTokenAsync(admin);

            SjekkResultat(
                await brukerManager.ResetPasswordAsync(admin, token, passord),
                "Kunne ikke tilbakestille passord"
            );

            SjekkResultat(
                await brukerManager.SetLockoutEndDateAsync(admin, null),
                "Kunne ikke fjerne utestengning"
            );

            SjekkResultat(
                await brukerManager.ResetAccessFailedCountAsync(admin),
                "Kunne ikke nullstille feilforsøk"
            );

            SjekkResultat(
                await brukerManager.UpdateSecurityStampAsync(admin),
                "Kunne ikke oppdatere sikkerhetsstempel"
            );
        }

        if (transaksjon != null) {
            await transaksjon.CommitAsync();
        }

        Console.WriteLine(
            "Admin er oppdatert. " +
            "Tidligere innloggingssesjoner blir ugyldiggjort."
        );
    }

    // Leser passord uten å vise det på skjermen
    private static string LesPassord()
    {
        if (Console.IsInputRedirected) {
            return Console.ReadLine() ?? "";
        }

        var resultat = new System.Text.StringBuilder();

        while (true)
        {
            var tast = Console.ReadKey(intercept: true);

            if (tast.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                break;
            }

            if (tast.Key == ConsoleKey.Backspace)
            {
                if (resultat.Length > 0) resultat.Length--;
                continue;
            }

            if (!char.IsControl(tast.KeyChar))
                resultat.Append(tast.KeyChar);
        }

        return resultat.ToString();
    }

    // Sjekker at en Identity-operasjon ble utført riktig
    private static void SjekkResultat(IdentityResult resultat, string melding)
    {
        if (resultat.Succeeded) return;

        throw new InvalidOperationException(
            melding + ": " +
            string.Join(
                "; ",
                resultat.Errors.Select(feil => feil.Description)
            )
        );
    }
}
