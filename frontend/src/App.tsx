import "./App.css";
import { useState } from "react";
import raywizLogo from "./assets/raywiz.png";
import bekkestuaKostholdOgLivsstil from "./assets/bekkestua-koli.png";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return(
    <>
    <header>
      <nav>
        <a href="/" className="magev">Magnus Evenstad</a> 


        <button 
        className="burger-menu" 
        type="button" 
        aria-expanded={menuOpen} 
        aria-controls="main-menu"
        aria-label={menuOpen ? "Lukk meny" : "Åpne meny"} 
        onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-icon"
          aria-hidden="true"
          ></span>
        </button>

        <ul id="main-menu"
        className={`menu-items ${menuOpen ? "menu-open" : ""}`}>
          <li><a href="#prosjekter">Prosjekter</a></li>
          <li><a href="#Utdanning">Utdanning</a></li>
        </ul>
      </nav>
    </header>
    
    <main>
      <section id="whoami">
        <h1>Magnus Evenstad</h1>
        <p id="personlig-tittel">IT Student og Junior Utvikler</p>

      <a className="button" href="https://www.linkedin.com/in/magnus-evenstad-322469290/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="button" href="https://github.com/Magnixz" target="_blank" rel="noopener noreferrer">GitHub</a>
      </section>

      <section id="om-meg">
        <h2>Hvem er jeg?</h2>
        <p>Jeg er en 23 år gammel junior utvikler og IT student med fokus på Universell Utforming</p>
      </section>

      <section id="utdanning">
        <h2>Utdanning</h2>
        <div className="utdanning-boks">
          <h3>Master - Universell Utforming av IKT</h3>
          <p>OsloMet</p>
          <p>2026 - Nåværende (forventet avsluttet 2028)</p>
        </div>

        <div className="utdanning-boks">
          <h3>Bachelor - Informasjonsteknologi</h3>
          <p>OsloMet</p>
          <p>2023 - 2026</p>
        </div>
        <a href="#utdanning">Les mer om utdanningen her</a>
      </section>


      <section id="prosjekter">
        <h2>Prosjekter</h2>
        <div className="prosjekt-boks">
          <h3>Elgviz - Bachelorprosjekt</h3>
          <img src={raywizLogo} alt="" className="prosjekt-bilde" />
          <p>Dette var mitt bachelorprosjekt som ble gjort i sammarbeid med Raywiz. I dette prosjektet trente jeg opp en YOLOv26-modell for å detektere elg i veibane ved hjelp av en LiDAR-sensor.</p>
          <a className="button" href="https://github.com/Magnixz/Moosedar/tree/main" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>


        <div className="prosjekt-boks">
          <h3>Nettside</h3>
          <img src={bekkestuaKostholdOgLivsstil} alt="" className="prosjekt-bilde" />
          <p>Dette er en nettside jeg har laget for Bekkestua Kosthold og Livsstil</p>
          </div>

        
        <div className="prosjekt-boks">
          <h3>Portefølje</h3>
          <p>Dette er min portefølje som jeg har laget for å vise frem mine prosjekter, utdanning og ferdigheter</p>
        </div>

        <a href="#prosjekter">Les mer om prosjektene her</a>
      </section>

      <footer>

      </footer>
    </main>
    </>
  )
}

export default App;