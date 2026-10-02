import "./App.css";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
  projectType: string;
  description: string;
  logoUrl: string;
  gitHubLink: string;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState(0);
  const [carouselActive, setCarouselActive] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunne ikke hente prosjekter");
        }

        return response.json();
      })
      .then((data) => {
        setProjects(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);


  useEffect(() => {
  if (!carouselActive || projects.length <= 1) {
    return;
  }

  const interval = window.setInterval(() => {
    setCurrentProject((previous) =>
      (previous + 1) % projects.length
    );
  }, 10000);

  return () => {
    window.clearInterval(interval);
  };
}, [carouselActive, projects.length, currentProject]);


const previousProject = () => {
  setCurrentProject((previous) =>
    previous === 0
      ? projects.length - 1
      : previous - 1
  );
};

const nextProject = () => {
  setCurrentProject((previous) =>
    (previous + 1) % projects.length
  );
};


  return (
    <>
      <header>
        <nav>
          <a href="/" className="magev">
            Magnus Evenstad
          </a>

          <button
            className="burger-menu"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className="menu-icon"
              aria-hidden="true"
            ></span>
          </button>

          <ul
            id="main-menu"
            className={`menu-items ${menuOpen ? "menu-open" : ""}`}
          >
            <li>
              <a href="#prosjekter">Prosjekter</a>
            </li>

            <li>
              <a href="#utdanning">Utdanning</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="whoami">
          <div className="whoami-content">
            <h1>Magnus Evenstad</h1>

            <p id="personlig-tittel">
              IT Student og Junior Utvikler
            </p>

            <p>
              Jeg er en 23 år gammel junior-utvikler og IT-student
              med fokus på Universell Utforming.
            </p>

            <div id="whoami-buttons">
              <a
                className="button"
                href="https://www.linkedin.com/in/magnus-evenstad-322469290/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>

              <a
                className="button"
                href="https://github.com/Magnixz"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>

          <img
            src="/images/whoami.jpeg"
            alt=""
            id="bilde-i-whoami"
          />
        </section>

        <section id="utdanning">
          <h2>Utdanning</h2>

          <div className="utdanning-boks1">
            <h3>Master - Universell Utforming av IKT</h3>
            <p>OsloMet</p>
            <p>2026 - Nåværende (forventet avsluttet 2028)</p>
          </div>

          <div className="utdanning-boks2">
            <h3>Bachelor - Informasjonsteknologi</h3>
            <p>OsloMet</p>
            <p>2023 - 2026</p>
          </div>

          <a href="#utdanning">
            Les mer om utdanningen her
          </a>
        </section>

        <section id="prosjekter">
  <div className="prosjekter-header">
    <h2>Prosjekter</h2>

    <div className="carousel-toggle-container">
      <span id="carousel-toggle-label">
        Automatisk karusell
      </span>

      <button
        className={`toggle-switch ${
          carouselActive ? "active" : ""
        }`}
        type="button"
        role="switch"
        aria-checked={carouselActive}
        aria-labelledby="carousel-toggle-label"
        onClick={() =>
          setCarouselActive(!carouselActive)
        }
      >
        <span className="toggle-circle"></span>
      </button>
    </div>
  </div>

  <div className="carousel-container">
    <button
      type="button"
      className="carousel-arrow carousel-arrow-left"
      onClick={previousProject}
      aria-label="Vis forrige prosjekt"
      disabled={projects.length <= 1}
    >
      ‹
    </button>

    <div
      className="carousel-window"
      aria-live={carouselActive ? "off" : "polite"}
    >
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentProject * 100}%)`,
        }}
      >
        {projects.map((project) => (
          <div
            className="carousel-slide"
            key={project.id}
          >
            <article className="prosjekt-boks">
              <h3>{project.name}</h3>

              <p>{project.projectType}</p>

              <img
                src={project.logoUrl}
                alt=""
                className="prosjekt-bilde"
              />

              <p>{project.description}</p>

              <a
                className="button"
                href={project.gitHubLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </article>
          </div>
        ))}
      </div>
    </div>

    <button
      type="button"
      className="carousel-arrow carousel-arrow-right"
      onClick={nextProject}
      aria-label="Vis neste prosjekt"
      disabled={projects.length <= 1}
    >
      ›
    </button>
  </div>

  <div
    className="carousel-indicators"
    aria-label="Velg prosjekt"
  >
    {projects.map((project, index) => (
      <button
        key={project.id}
        type="button"
        className={`carousel-dot ${
          index === currentProject ? "active" : ""
        }`}
        onClick={() => setCurrentProject(index)}
        aria-label={`Vis ${project.name}`}
        aria-current={
          index === currentProject ? "true" : undefined
        }
      />
    ))}
  </div>
</section>
      </main>

      <footer>
      </footer>
    </>
  );
}

export default App;