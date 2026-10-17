
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { api } from "../api";
import type {
  Course,
  Education,
  PortfolioContent,
  Project,
  Skill
} from "../types";

// De forskjellige tingene man kan redigere i admin
type Omraade = "projects" | "skills" | "educations" | "courses";
type RedigerbartElement = Project | Skill | Education | Course;

// Feltene i skjemaet. Key må være likt som i API-et.
const felter: Record<Omraade, { key: string; label: string; kind?: string }[]> = {
  projects: [
    { key: "name", label: "Prosjektnavn (norsk)" },
    { key: "nameEn", label: "Project name (English)" },
    { key: "projectType", label: "Prosjekttype (norsk)" },
    { key: "projectTypeEn", label: "Project type (English)" },
    { key: "description", label: "Kort beskrivelse (norsk)", kind: "textarea" },
    { key: "descriptionEn", label: "Short description (English)", kind: "textarea" },
    { key: "detailedDescription", label: "Detaljert beskrivelse (norsk)", kind: "textarea" },
    { key: "detailedDescriptionEn", label: "Detailed description (English)", kind: "textarea" },
    { key: "myRole", label: "Mitt bidrag (norsk)", kind: "textarea" },
    { key: "myRoleEn", label: "My contribution (English)", kind: "textarea" },
    { key: "logoUrl", label: "Logo / bilde-URL (f.eks. /images/raywiz.png)", kind: "path" },
    { key: "gitHubLink", label: "GitHub-URL", kind: "url" },
    { key: "demoUrl", label: "Live demo-URL", kind: "url" },
    { key: "sortOrder", label: "Rekkefølge", kind: "number" }
  ],

  skills: [
    { key: "name", label: "Navn (norsk)" },
    { key: "nameEn", label: "Name (English)" },
    { key: "slug", label: "Slug (unik identifikator)" },
    { key: "category", label: "Kategori (norsk)" },
    { key: "categoryEn", label: "Category (English)" },
    { key: "description", label: "Beskrivelse (norsk)", kind: "textarea" },
    { key: "descriptionEn", label: "Description (English)", kind: "textarea" },
    { key: "sortOrder", label: "Rekkefølge", kind: "number" }
  ],

  educations: [
    { key: "institution", label: "Utdanningsinstitusjon" },
    { key: "degree", label: "Studieretning (norsk)" },
    { key: "degreeEn", label: "Degree (English)" },
    { key: "period", label: "Periode" },
    { key: "ects", label: "Studiepoeng", kind: "number" },
    { key: "sortOrder", label: "Rekkefølge", kind: "number" }
  ],

  courses: [
    { key: "educationId", label: "Utdanning", kind: "education" },
    { key: "name", label: "Emnenavn (norsk)" },
    { key: "nameEn", label: "Course name (English)" },
    { key: "sortOrder", label: "Rekkefølge", kind: "number" }
  ]
};

// Verdier man starter med når man lager noe nytt
const tommeVerdier: Record<Omraade, Record<string, unknown>> = {
  projects: {
    name: "", nameEn: "",
    projectType: "", projectTypeEn: "",
    description: "", descriptionEn: "",
    detailedDescription: "", detailedDescriptionEn: "",
    myRole: "", myRoleEn: "",
    logoUrl: "", gitHubLink: "", demoUrl: "",
    sortOrder: 0, skillIds: []
  },

  skills: {
    name: "", nameEn: "", slug: "",
    category: "", categoryEn: "",
    description: "", descriptionEn: "",
    sortOrder: 0
  },

  educations: {
    institution: "OsloMet",
    degree: "", degreeEn: "",
    period: "", ects: 0, sortOrder: 0
  },

  courses: {
    educationId: 0,
    name: "", nameEn: "", sortOrder: 0
  }
};

// Finner riktig liste basert på hvilken fane vi er på
function hentElementer(innhold: PortfolioContent, omraade: Omraade): RedigerbartElement[] {
  if (omraade === "projects") return innhold.projects;
  if (omraade === "skills") return innhold.skills;
  if (omraade === "educations") return innhold.educations;

  return innhold.educations.flatMap((utdanning) => utdanning.courses);
}

function elementNavn(element: RedigerbartElement): string {
  if ("degree" in element) return element.degree;
  return element.name;
}

export function Admin() {
  const [innlogget, setInnlogget] = useState<boolean | null>(null);
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");

  const [innhold, setInnhold] = useState<PortfolioContent | null>(null);
  const [omraade, setOmraade] = useState<Omraade>("projects");

  const [redigererId, setRedigererId] = useState<number | null>(null);
  const [skjema, setSkjema] = useState<Record<string, unknown>>({
    ...tommeVerdier.projects
  });

  const [feil, setFeil] = useState("");
  const [melding, setMelding] = useState("");
  const [lagrer, setLagrer] = useState(false);

  // Henter oppdatert innhold etter at vi har gjort en endring
  async function hentInnhold() {
    const data = await api.content();
    setInnhold(data);
  }

  // Sjekker om vi allerede er innlogget
  useEffect(() => {
    let aktiv = true;

    api.me().then(async (svar) => {
      if (!aktiv) return;

      setInnlogget(svar.authenticated);

      if (svar.authenticated) {
        try {
          await hentInnhold();
        } catch (error) {
          if (aktiv) {
            setFeil(error instanceof Error ? error.message : "Kunne ikke hente innhold.");
          }
        }
      }
    }).catch((error: unknown) => {
      if (aktiv) {
        setInnlogget(false);
        setFeil(error instanceof Error ? error.message : "Kunne ikke kontakte API-et.");
      }
    });

    return () => { aktiv = false; };
  }, []);

  async function loggInn(event: React.FormEvent) {
    event.preventDefault();
    setFeil("");

    try {
      await api.login(epost.trim(), passord);

      setPassord("");
      setInnlogget(true);

      try {
        await hentInnhold();
      } catch (error) {
        setFeil(error instanceof Error ? error.message : "Innlogget, men kunne ikke hente innhold.");
      }
    } catch (error) {
      setFeil(error instanceof Error ? error.message : "Innloggingen mislyktes.");
    }
  }

  async function loggUt() {
    try {
      await api.logout();
      setInnlogget(false);
      setInnhold(null);
    } catch {
      setFeil("Kunne ikke logge ut.");
    }
  }

  function velgOmraade(nyttOmraade: Omraade) {
    setOmraade(nyttOmraade);
    setRedigererId(null);
    setSkjema({ ...tommeVerdier[nyttOmraade] });
    setFeil("");
    setMelding("");
  }

  function nyttElement() {
    setRedigererId(null);
    setSkjema({ ...tommeVerdier[omraade] });
    setFeil("");
    setMelding("");
  }

  function rediger(element: RedigerbartElement) {
    setRedigererId(element.id);

    setSkjema({
      ...element,
      ...("skillIds" in element
        ? { skillIds: [...element.skillIds] }
        : {})
    });

    setFeil("");
    setMelding("");
  }

  function oppdaterSkjema(nokkel: string, verdi: unknown) {
    setSkjema((forrige) => ({
      ...forrige,
      [nokkel]: verdi
    }));
  }

  // Lagrer enten et nytt element eller endringer på et som finnes
  async function lagre(event: React.FormEvent) {
    event.preventDefault();
    if (lagrer) return;

    setLagrer(true);
    setFeil("");
    setMelding("");

    try {
      if (redigererId === null) {
        await api.create(omraade, skjema);
      } else {
        await api.update(omraade, redigererId, skjema);
      }

      await hentInnhold();

      setMelding("Endringene er lagret.");
      setRedigererId(null);
      setSkjema({ ...tommeVerdier[omraade] });

    } catch (error) {
      setFeil(error instanceof Error ? error.message : "Kunne ikke lagre.");
    } finally {
      setLagrer(false);
    }
  }

  async function slett(element: RedigerbartElement) {
    if (!window.confirm(`Vil du virkelig slette "${elementNavn(element)}"?`)) return;

    setLagrer(true);
    setFeil("");
    setMelding("");

    try {
      await api.remove(omraade, element.id);
      await hentInnhold();

      nyttElement();
      setMelding("Elementet er slettet.");
    } catch (error) {
      setFeil(error instanceof Error ? error.message : "Kunne ikke slette.");
    } finally {
      setLagrer(false);
    }
  }

  // Mens vi sjekker innloggingen
  if (innlogget === null) {
    return (
      <main className="admin-page">
        <p role="status">Kontrollerer innlogging …</p>
      </main>
    );
  }

  // Innloggingssiden
  if (!innlogget) {
    return (
      <main className="admin-login">
        <div className="content-card login-card">
          <h1>Administrasjon</h1>
          <p>Logg inn for å redigere porteføljen.</p>

          <form onSubmit={loggInn}>
            <label htmlFor="login-email">E-postadresse</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={epost}
              required
              onChange={(e) => setEpost(e.target.value)}
            />

            <label htmlFor="login-password">Passord</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={passord}
              required
              onChange={(e) => setPassord(e.target.value)}
            />

            {feil && <p role="alert" className="error-message">{feil}</p>}

            <button className="primary-button" type="submit">Logg inn</button>
          </form>

          <Link to="/">Tilbake til porteføljen</Link>
        </div>
      </main>
    );
  }

  const elementer = innhold ? hentElementer(innhold, omraade) : [];

  // Administrasjon etter innlogging
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Portefølje – administrasjon</h1>
          <p>Administrer innholdet på nettsiden.</p>
        </div>

        <div className="admin-header-actions">
          <Link to="/">Vis nettsiden</Link>
          <button className="secondary-button" onClick={loggUt} type="button">Logg ut</button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Administrasjonsområder">
        {([
          ["projects", "Prosjekter"],
          ["skills", "Ferdigheter"],
          ["educations", "Utdanning"],
          ["courses", "Emner"]
        ] as const).map(([id, navn]) => (
          <button
            key={id}
            type="button"
            className={omraade === id ? "active" : ""}
            aria-current={omraade === id ? "page" : undefined}
            onClick={() => velgOmraade(id)}
          >
            {navn}
          </button>
        ))}
      </nav>

      {feil && <p role="alert" className="error-message">{feil}</p>}
      {melding && <p role="status" className="success-message">{melding}</p>}

      <div className="admin-layout">
        <section className="content-card admin-list">
          <div className="admin-list-header">
            <h2>Eksisterende innhold</h2>
            <button type="button" className="primary-button" onClick={nyttElement}>+ Ny</button>
          </div>

          {!innhold ? (
            <p>Laster innhold …</p>
          ) : (
            <ul>
              {elementer.length === 0 && <li>Ingen elementer funnet i databasen.</li>}

              {elementer.map((element) => (
                <li key={element.id}>
                  <button
                    type="button"
                    className={redigererId === element.id ? "admin-item selected" : "admin-item"}
                    onClick={() => rediger(element)}
                  >
                    {elementNavn(element)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="content-card admin-editor">
          <h2>{redigererId === null ? "Legg til nytt innhold" : "Rediger innhold"}</h2>

          <form onSubmit={lagre}>
            {felter[omraade].map((felt) => {
              const verdi = skjema[felt.key] ?? "";

              return (
                <div className="form-field" key={felt.key}>
                  <label htmlFor={`edit-${felt.key}`}>{felt.label}</label>

                  {felt.kind === "textarea" ? (
                    <textarea
                      id={`edit-${felt.key}`}
                      rows={5}
                      value={String(verdi)}
                      onChange={(e) => oppdaterSkjema(felt.key, e.target.value)}
                    />
                  ) : felt.kind === "education" ? (
                    <select
                      id={`edit-${felt.key}`}
                      value={Number(verdi)}
                      required
                      onChange={(e) => oppdaterSkjema(felt.key, Number(e.target.value))}
                    >
                      <option value={0}>Velg utdanning</option>

                      {innhold?.educations.map((utdanning) => (
                        <option key={utdanning.id} value={utdanning.id}>
                          {utdanning.degree}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`edit-${felt.key}`}
                      type={
                        felt.kind === "number"
                          ? "number"
                          : felt.kind === "url"
                            ? "url"
                            : "text"
                      }
                      value={String(verdi)}
                      onChange={(e) =>
                        oppdaterSkjema(
                          felt.key,
                          felt.kind === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                    />
                  )}
                </div>
              );
            })}

            {/* Ferdighetene som kobles til et prosjekt */}
            {omraade === "projects" && innhold && (
              <fieldset className="admin-skill-selector">
                <legend>Ferdigheter brukt i prosjektet</legend>

                {innhold.skills.map((skill) => {
                  const valgte = (skjema.skillIds as number[] | undefined) ?? [];
                  const valgt = valgte.includes(skill.id);

                  return (
                    <label key={skill.id}>
                      <input
                        type="checkbox"
                        checked={valgt}
                        onChange={(e) => {
                          const neste = e.target.checked
                            ? [...valgte, skill.id]
                            : valgte.filter((id) => id !== skill.id);

                          oppdaterSkjema("skillIds", neste);
                        }}
                      />
                      {skill.name}
                    </label>
                  );
                })}
              </fieldset>
            )}

            <div className="admin-form-actions">
              <button className="primary-button" type="submit" disabled={lagrer}>
                {lagrer ? "Lagrer …" : "Lagre"}
              </button>

              {redigererId !== null && (
                <button
                  type="button"
                  className="danger-button"
                  disabled={lagrer}
                  onClick={() => {
                    const element = elementer.find((e) => e.id === redigererId);
                    if (element) void slett(element);
                  }}
                >
                  Slett
                </button>
              )}

              <button className="secondary-button" type="button" onClick={nyttElement}>
                Avbryt
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
