
import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router";
import { api } from "./api";
import { Admin } from "./components/Admin";
import { translated } from "./types";
import type { Education, Language, PortfolioContent, Project, Skill } from "./types";
import "./App.css";

// Data som vises før vi får svar fra databasen
const tomtInnhold: PortfolioContent = { projects: [], skills: [], educations: [] };

const lenker = {
  github: "https://github.com/Magnixz",
  linkedin: "https://www.linkedin.com/in/magnus-evenstad-322469290/"
};

// Tekstene på norsk og engelsk. Prosjekter og ferdigheter hentes fra databasen.
const tekst = {
  no: {
    home: "Forside", education: "Utdanning", projects: "Prosjekter", skills: "Ferdigheter",
    contact: "Kontakt", menu: "Meny", role: "IT-utvikler",
    intro: "Jeg er utdannet innen informasjonsteknologi og studerer nå universell utforming av IKT ved OsloMet. Jeg liker å lære om nye teknologier, utvikle løsninger som er enkle å forstå og bruke, og få praktisk erfaring gjennom egne prosjekter. Jeg er spesielt interessert i tilgjengelige digitale tjenester, maskinlæring og systemutvikling.",
    educationHome: "Jeg tar for tiden en master i universell utforming av IKT og forventer å være ferdig i 2028.",
    educationPage: "Utdanningen min og emnene jeg har gjennomført.",
    projectsHome: "Her finner du noen av prosjektene jeg har utviklet eller vært med på å utvikle.",
    projectsPage: "Her finner du prosjekter jeg har utviklet eller bidratt til.",
    skillsIntro: "Her finner du teknologier og fagområder jeg har erfaring med.",
    educationMore: "Se mer om utdanningen min", projectsMore: "Se alle prosjektene mine",
    skillsMore: "Se alle ferdighetene mine", courses: "Emner", ects: "studiepoeng",
    noCourses: "Pågående studieløp. Emner blir lagt til etter hvert som de er bestått.",
    auto: "Automatisk bytting av prosjekter", on: "På", off: "Av",
    prev: "Forrige prosjekt", next: "Neste prosjekt", details: "Les mer om prosjektet",
    hideDetails: "Skjul detaljer", contribution: "Mitt bidrag", github: "GitHub", demo: "Besøk nettsiden",
    projectsUsing: "Prosjekter der jeg har brukt", noProjectsForSkill: "Ingen prosjekter er koblet til denne ferdigheten ennå.",
    contactText: "Du finner meg på GitHub og LinkedIn.",
    loading: "Laster innhold …", error: "Kunne ikke hente innholdet.", retry: "Prøv igjen",
    emptyEducation: "Ingen utdanning er registrert ennå.",
    emptyProjects: "Ingen prosjekter er registrert ennå.",
    emptySkills: "Ingen ferdigheter er registrert ennå.",
    skip: "Hopp til hovedinnhold", projectSingular: "prosjekt", projectPlural: "prosjekter",
    current: "Pågående", done: "Fullført"
  },
  en: {
    home: "Home", education: "Education", projects: "Projects", skills: "Skills",
    contact: "Contact", menu: "Menu", role: "IT Developer",
    intro: "I have a bachelor's degree in Information Technology and am currently studying Universal Design of ICT at OsloMet. I enjoy learning new technologies, building solutions that are easy to understand and use, and gaining hands-on experience through personal projects. I am particularly interested in accessible digital services, machine learning and software development.",
    educationHome: "I am currently pursuing a master's degree in Universal Design of ICT and expect to graduate in 2028.",
    educationPage: "My education and the courses I have completed.",
    projectsHome: "Here are some of the projects I have developed or contributed to.",
    projectsPage: "Here you can explore projects I have developed or contributed to.",
    skillsIntro: "Here you can explore the technologies and areas I have experience with.",
    educationMore: "Explore my education", projectsMore: "Explore all my projects",
    skillsMore: "Explore all my skills", courses: "Courses", ects: "ECTS",
    noCourses: "Ongoing degree. Courses will be added as I complete them.",
    auto: "Automatically switch projects", on: "On", off: "Off",
    prev: "Previous project", next: "Next project", details: "Read more about the project",
    hideDetails: "Hide details", contribution: "My contribution", github: "GitHub", demo: "Visit website",
    projectsUsing: "Projects where I used", noProjectsForSkill: "No projects are linked to this skill yet.",
    contactText: "You can find me on GitHub and LinkedIn.",
    loading: "Loading content …", error: "Could not load the content.", retry: "Try again",
    emptyEducation: "No education entries have been added yet.",
    emptyProjects: "No projects have been added yet.",
    emptySkills: "No skills have been added yet.",
    skip: "Skip to main content", projectSingular: "project", projectPlural: "projects",
    current: "In progress", done: "Completed"
  }
} as const;

// Menyen på toppen. Bruker fremdeles NavLink slik at aktiv side blir markert.
function Navigasjon({ lang, byttSprak }: { lang: Language, byttSprak: (sprak: Language) => void }) {
  const t = tekst[lang];
  const [menyApen, setMenyApen] = useState(false);
  const menyLenker = [["/", t.home], ["/utdanning", t.education], ["/prosjekter", t.projects], ["/ferdigheter", t.skills]];

  return (
    <header className="hovedmeny">
      <nav className="nav_innhold" aria-label={lang === "no" ? "Hovedmeny" : "Main navigation"}>
        <Link className="nav_navn" to="/" onClick={() => setMenyApen(false)}>Magnus Evenstad</Link>

        <button className="mobil_meny" type="button" aria-controls="primary-navigation"
          aria-expanded={menyApen} onClick={() => setMenyApen(!menyApen)}>{t.menu}</button>

        <div id="primary-navigation" className={`navigasjon ${menyApen ? "open" : ""}`}>
          {menyLenker.map(([sti, navn]) => (
            <NavLink key={sti} to={sti} end={sti === "/"} onClick={() => setMenyApen(false)}>{navn}</NavLink>
          ))}
          <div className="sprak_valg" role="group" aria-label={lang === "no" ? "Velg språk" : "Choose language"}>
            <button type="button" lang="nb" aria-pressed={lang === "no"} onClick={() => byttSprak("no")}>NO</button>
            <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => byttSprak("en")}>EN</button>
          </div>
        </div>
      </nav>
    </header>
  );
}

// Første del av forsiden
function OmMeg({ lang }: { lang: Language }) {
  const t = tekst[lang];
  return (
    <section id="home" className="hvem_er_jeg">
      <div className="om_meg_tekst">
        <h1>Magnus Evenstad</h1>
        <p className="personlig_tittel">{t.role}</p>
        <p>{t.intro}</p>
        <div className="om_meg_knapper"><Link className="primary-button" to="/#contact">{t.contact}</Link></div>
      </div>
      <div className="profil_bilde">
        <img src="/images/whoami.jpeg" alt={lang === "no" ? "Portrett av Magnus Evenstad" : "Portrait of Magnus Evenstad"} />
      </div>
    </section>
  );
}

// Overskrift + lenke som er lik på flere av sidene
function SeksjonsOverskrift({ tittel, intro, til, lenkeTekst }: {
  tittel: string, intro: string, til?: string, lenkeTekst?: string
}) {
  return (
    <header className="seksjon_overskrift">
      <h2>{tittel}</h2>
      <p>{intro}</p>
      {til && lenkeTekst && <Link className="se_mer" to={til}>{lenkeTekst} →</Link>}
    </header>
  );
}

// Utdanning blir hentet fra databasen, men emnene vises bare på den egne siden
function UtdanningSeksjon({ lang, educations, forside }: {
  lang: Language, educations: Education[], forside: boolean
}) {
  const t = tekst[lang];
  return (
    <section id="education" className="innhold_seksjon">
      <SeksjonsOverskrift tittel={t.education} intro={forside ? t.educationHome : t.educationPage}
        til={forside ? "/utdanning" : undefined} lenkeTekst={t.educationMore} />
      {educations.length === 0 && <p className="tom_liste">{t.emptyEducation}</p>}
      <div className={`utdanning_bokser ${forside ? "utdanning_forside" : "utdanning_side"}`}>
        {educations.map((utdanning) => (
          <article key={utdanning.id} className="utdanning_boks">
            <div className="utdanning_topp">
              <span className="studie_periode">{utdanning.period}</span>
              <span className="studie_status">{utdanning.period.includes("2028") ? t.current : t.done}</span>
            </div>
            <h3>{translated(utdanning.degree, utdanning.degreeEn, lang)}</h3>
            <p className="studiested">{utdanning.institution}</p>
            <p className="studiepoeng">{utdanning.ects} {t.ects}</p>
            {!forside && (
              <div className="emner_innhold">
                <h4>{t.courses}</h4>
                {utdanning.courses.length === 0 ? (
                  <p className="ikke_emner">{t.noCourses}</p>
                ) : (
                  <ul className="emne_liste">
                    {utdanning.courses.map((emne) => <li key={emne.id}>{translated(emne.name, emne.nameEn, lang)}</li>)}
                  </ul>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// Boksen som brukes både i karusellen og på prosjektsiden
function ProsjektBoks({ project, skills, lang }: { project: Project, skills: Skill[], lang: Language }) {
  const t = tekst[lang];
  const [visDetaljer, setVisDetaljer] = useState(false);
  const navn = translated(project.name, project.nameEn, lang);
  const type = translated(project.projectType, project.projectTypeEn, lang);
  const beskrivelse = translated(project.description, project.descriptionEn, lang);
  const merTekst = translated(project.detailedDescription, project.detailedDescriptionEn, lang);
  const mittBidrag = translated(project.myRole, project.myRoleEn, lang);
  const brukt = skills.filter((skill) => project.skillIds.includes(skill.id));

  return (
    <article className="prosjekt_boks" id={`project-${project.id}`}>
      <div className="prosjekt_bilde">
        {project.logoUrl ? (
          <img src={project.logoUrl} alt="" loading="lazy" />
        ) : (
          <div className="prosjekt_mangler_bilde" aria-hidden="true">
            {project.name.toLowerCase().includes("linux") ? "LINUX" : "</>"}
          </div>
        )}
      </div>
      <div className="prosjekt_innhold">
        <p className="prosjekt_type">{type}</p>
        <h3>{navn}</h3>
        <p>{beskrivelse}</p>

        <ul className="ferdighet_liste" aria-label={lang === "no" ? "Ferdigheter brukt i prosjektet" : "Skills used in this project"}>
          {brukt.map((skill) => (
            <li key={skill.id}>
              <Link className="ferdighet_tag ferdighet_lenke" to={`/ferdigheter#skill-${skill.slug}`}>
                {translated(skill.name, skill.nameEn, lang)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="prosjekt_knapper">
          {(merTekst || mittBidrag) && (
            <button type="button" className="primary-button" aria-expanded={visDetaljer}
              aria-controls={`project-details-${project.id}`} onClick={() => setVisDetaljer(!visDetaljer)}>
              {visDetaljer ? t.hideDetails : t.details}
            </button>
          )}
          {project.gitHubLink && (
            <a className="secondary-button" href={project.gitHubLink} target="_blank" rel="noopener noreferrer"
              aria-label={lang === "no" ? `Se ${navn} på GitHub (ny fane)` : `View ${navn} on GitHub (new tab)`}>{t.github}</a>
          )}
          {project.demoUrl && (
            <a className="secondary-button" href={project.demoUrl} target="_blank" rel="noopener noreferrer">{t.demo}</a>
          )}
        </div>

        <div id={`project-details-${project.id}`} className="prosjekt_detaljer" hidden={!visDetaljer}>
          {merTekst && <><h4>{t.details}</h4><p className="behold_linjeskift">{merTekst}</p></>}
          {mittBidrag && <><h4>{t.contribution}</h4><p className="behold_linjeskift">{mittBidrag}</p></>}
        </div>
      </div>
    </article>
  );
}

// På forsiden bruker vi karrusell. På prosjektsiden vises alle samtidig.
function ProsjekterSeksjon({ projects, skills, lang, forside }: {
  projects: Project[], skills: Skill[], lang: Language, forside: boolean
}) {
  const t = tekst[lang];
  const [prosjektIndex, setProsjektIndex] = useState(0);
  const [autoBytte, setAutoBytte] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const valgtProsjekt = projects.length ? Math.min(prosjektIndex, projects.length - 1) : 0;

  useEffect(() => {
    if (!forside || !autoBytte || projects.length < 2) return;
    const intervall = window.setInterval(() => {
      setProsjektIndex((forrige) => (forrige + 1) % projects.length);
    }, 8000);
    return () => window.clearInterval(intervall);
  }, [forside, autoBytte, projects.length]);

  function flyttProsjekt(retning: number) {
    setProsjektIndex((forrige) => (forrige + retning + projects.length) % projects.length);
  }

  return (
    <section id="projects" className="innhold_seksjon">
      <SeksjonsOverskrift tittel={t.projects} intro={forside ? t.projectsHome : t.projectsPage}
        til={forside ? "/prosjekter" : undefined} lenkeTekst={t.projectsMore} />

      {projects.length === 0 ? <p className="tom_liste">{t.emptyProjects}</p> : forside ? (
        <>
          {/* Brukeren skal kunne stoppe automatisk bytting */}
          <div className="karrusell_valg">
            <span id="autoplay-label">{t.auto}</span>
            <button type="button" className={`auto_bytte ${autoBytte ? "active" : ""}`}
              role="switch" aria-checked={autoBytte} aria-labelledby="autoplay-label"
              onClick={() => setAutoBytte(!autoBytte)}>
              <span className="auto_bytte_sirkel" aria-hidden="true" />
            </button>
            <span className="auto_status" role="status" aria-live="polite">{autoBytte ? t.on : t.off}</span>
          </div>

          <div role="region" aria-roledescription={lang === "no" ? "karusell" : "carousel"}
            aria-label={t.projects} aria-live={autoBytte ? "off" : "polite"}>
            <ProsjektBoks key={projects[valgtProsjekt].id} project={projects[valgtProsjekt]} skills={skills} lang={lang} />
          </div>

          {projects.length > 1 && (
            <div className="karrusell_kontroller">
              <button type="button" aria-label={t.prev} onClick={() => flyttProsjekt(-1)}>←</button>
              <span aria-label={`${valgtProsjekt + 1} / ${projects.length}`}>
                {valgtProsjekt + 1} / {projects.length}
              </span>
              <button type="button" aria-label={t.next} onClick={() => flyttProsjekt(1)}>→</button>
            </div>
          )}
        </>
      ) : (
        <div className="prosjekter_grid">
          {projects.map((prosjekt) => <ProsjektBoks key={prosjekt.id} project={prosjekt} skills={skills} lang={lang} />)}
        </div>
      )}
    </section>
  );
}

// Disse åpnes i samme boks, så man slipper å bla helt nederst for å lese om ferdigheten
function FerdighetBoks({ skill, projects, lang }: { skill: Skill, projects: Project[], lang: Language }) {
  const t = tekst[lang];
  const prosjekter = projects.filter((p) => skill.projectIds.includes(p.id));
  const antall = prosjekter.length;

  return (
    <details className="ferdighet_boks" id={`skill-${skill.slug}`}>
      <summary className="ferdighet_overskrift">
        <span className="ferdighet_tittel">{translated(skill.name, skill.nameEn, lang)}</span>
        <span className="ferdighet_bunn">
          <span>{antall} {antall === 1 ? t.projectSingular : t.projectPlural}</span>
          <span className="mer_ikon" aria-hidden="true">+</span>
        </span>
      </summary>
      <div className="ferdighet_detaljer">
        <p>{translated(skill.description, skill.descriptionEn, lang)}</p>
        <h4>{t.projectsUsing} {translated(skill.name, skill.nameEn, lang)}</h4>
        {antall ? (
          <ul>
            {prosjekter.map((prosjekt) => (
              <li key={prosjekt.id}>
                <Link to={`/prosjekter#project-${prosjekt.id}`}>
                  {translated(prosjekt.name, prosjekt.nameEn, lang)}
                </Link>
              </li>
            ))}
          </ul>
        ) : <p>{t.noProjectsForSkill}</p>}
      </div>
    </details>
  );
}

const KATEGORIER = [
  "Språk og webteknologi", "Rammeverk og biblioteker", "Databaser",
  "Design og tilgjengelighet", "KI og sensordata", "Nettverk og serverdrift", "Utviklingsverktøy"
];

// Forsiden har 9 ferdigheter, mens den egne siden viser alle i kategorier
function FerdigheterSeksjon({ skills, projects, lang, forside }: {
  skills: Skill[], projects: Project[], lang: Language, forside: boolean
}) {
  const t = tekst[lang];
  const { hash } = useLocation();
  const sortert = [...skills].sort((a,b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "nb"));
  const kategorier = Array.from(new Set(sortert.map((s) => s.category))).sort((a,b) => {
    const aNr = KATEGORIER.indexOf(a), bNr = KATEGORIER.indexOf(b);
    return (aNr < 0 ? 999 : aNr) - (bNr < 0 ? 999 : bNr);
  });

  // Åpner boksen automatisk når man kommer fra en prosjekt-tag
  useEffect(() => {
    if (forside || !hash.startsWith("#skill-")) return;
    const boks = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (boks instanceof HTMLDetailsElement) {
      boks.open = true;
      boks.scrollIntoView({ block: "start" });
    }
  }, [forside, hash, skills.length]);

  return (
    <section id="skills" className="innhold_seksjon">
      <SeksjonsOverskrift tittel={t.skills} intro={t.skillsIntro}
        til={forside ? "/ferdigheter" : undefined} lenkeTekst={t.skillsMore} />
      {skills.length === 0 && <p className="tom_liste">{t.emptySkills}</p>}

      {forside ? (
        <div className="ferdigheter_grid">
          {sortert.slice(0, 9).map((skill) => <FerdighetBoks key={skill.id} skill={skill} projects={projects} lang={lang} />)}
        </div>
      ) : (
        <div className="ferdigheter_kategorier">
          {kategorier.map((kategori) => {
            const innhold = sortert.filter((s) => s.category === kategori);
            return (
              <section className="ferdighet_kategori" key={kategori}>
                <h3>{lang === "en" ? innhold[0].categoryEn || kategori : kategori}</h3>
                <div className="ferdigheter_grid">
                  {innhold.map((skill) => <FerdighetBoks key={skill.id} skill={skill} projects={projects} lang={lang} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Kontaktinfo ligger i footeren isteden for på en egen del av forsiden
function Bunntekst({ lang }: { lang: Language }) {
  const t = tekst[lang];
  return (
    <footer id="contact" className="bunntekst">
      <div className="footer_innhold">
        <div className="footer_tekst">
          <h2>{t.contact}</h2>
          <p>{t.contactText}</p>
        </div>
        <nav className="footer_lenker" aria-label={t.contact}>
          <a href={lenker.github} target="_blank" rel="noopener noreferrer"
            aria-label={lang === "no" ? "Besøk GitHub-profilen min (åpnes i ny fane)" : "Visit my GitHub profile (opens in a new tab)"}>GitHub</a>
          <a href={lenker.linkedin} target="_blank" rel="noopener noreferrer"
            aria-label={lang === "no" ? "Besøk LinkedIn-profilen min (åpnes i ny fane)" : "Visit my LinkedIn profile (opens in a new tab)"}>LinkedIn</a>
        </nav>
      </div>
      <div className="footer_bunn"><p>Magnus Evenstad</p></div>
    </footer>
  );
}

type Side = "home" | "education" | "projects" | "skills";

// Henter data fra API-et. Dette blir brukt på alle de offentlige sidene.
function Portefolje({ lang, byttSprak, page }: {
  lang: Language, byttSprak: (sprak: Language) => void, page: Side
}) {
  const t = tekst[lang];
  const [innhold, setInnhold] = useState<PortfolioContent>(tomtInnhold);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState("");
  const [forsok, setForsok] = useState(0);
  const { hash } = useLocation();

  useEffect(() => {
    let aktiv = true;
    api.content().then((data) => {
      if (aktiv) { setInnhold(data); setFeil(""); }
    }).catch((error: unknown) => {
      if (aktiv) setFeil(error instanceof Error ? error.message : "Ukjent feil");
    }).finally(() => {
      if (aktiv) setLaster(false);
    });
    return () => { aktiv = false; };
  }, [forsok]);

  // For kontaktknappen og lenker til spesifikke prosjekter
  useEffect(() => {
    if (laster || !hash) return;
    const element = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (element && !(element instanceof HTMLDetailsElement)) element.scrollIntoView();
  }, [laster, hash, page]);

  return (
    <>
      <a className="hopp_til_innhold" href="#main-content">{t.skip}</a>
      <Navigasjon lang={lang} byttSprak={byttSprak} />

      <main id="main-content" tabIndex={-1} className={page === "home" ? "forside" : "underside"}>
        {page === "home" && <OmMeg lang={lang} />}
        {laster ? (
          <p className="status_melding" role="status">{t.loading}</p>
        ) : feil ? (
          <div role="alert" className="status_melding">
            <p>{t.error} ({feil})</p>
            <button type="button" className="secondary-button" onClick={() => { setLaster(true); setForsok((x) => x + 1); }}>
              {t.retry}
            </button>
          </div>
        ) : (
          <>
            {(page === "home" || page === "education") &&
              <UtdanningSeksjon lang={lang} educations={innhold.educations} forside={page === "home"} />}
            {(page === "home" || page === "projects") &&
              <ProsjekterSeksjon lang={lang} projects={innhold.projects} skills={innhold.skills} forside={page === "home"} />}
            {(page === "home" || page === "skills") &&
              <FerdigheterSeksjon lang={lang} skills={innhold.skills} projects={innhold.projects} forside={page === "home"} />}
          </>
        )}
      </main>
      <Bunntekst lang={lang} />
    </>
  );
}

// Selve rutene. Admin er ikke synlig i menyen men virker på /administrasjon
export default function App() {
  const { pathname, hash } = useLocation();
  const [lang, setLang] = useState<Language>(() => localStorage.getItem("portfolio-language") === "en" ? "en" : "no");

  useEffect(() => {
    document.documentElement.lang = lang === "no" ? "nb" : "en";
    localStorage.setItem("portfolio-language", lang);
    const side = pathname === "/" ? "" : ` | ${pathname.replace("/", "")}`;
    document.title = `Magnus Evenstad${side}`;
  }, [lang, pathname]);

  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);

  return (
    <Routes>
      <Route path="/" element={<Portefolje lang={lang} byttSprak={setLang} page="home" />} />
      <Route path="/utdanning" element={<Portefolje lang={lang} byttSprak={setLang} page="education" />} />
      <Route path="/prosjekter" element={<Portefolje lang={lang} byttSprak={setLang} page="projects" />} />
      <Route path="/ferdigheter" element={<Portefolje lang={lang} byttSprak={setLang} page="skills" />} />
      <Route path="/administrasjon/*" element={<Admin />} />
      <Route path="*" element={
        <main className="status_melding"><h1>404</h1>
          <Link to="/">{lang === "no" ? "Til forsiden" : "Go home"}</Link>
        </main>
      } />
    </Routes>
  );
}
