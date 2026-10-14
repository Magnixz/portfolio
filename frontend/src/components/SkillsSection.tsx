import { useState } from "react";
import "./SkillsSection.css";

export type SkillCategory = "Programmering" | "Rammeverk og biblioteker" | "Infrastruktur og verktøy" | "AI og data";
export interface Skill {
  name: string;
  category: SkillCategory;
  projectIds: string[];
}
export interface PortfolioProject {
  id: string;
  name: string;
  href?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  { id: "elgviz", name: "Elgviz", href: "#prosjekter" },
  { id: "bekkestua", name: "Bekkestua Kosthold og Livsstil", href: "#prosjekter" },
  { id: "portfolio", name: "Portefølje", href: "#prosjekter" },
  { id: "self-hosting", name: "Self-hosted infrastruktur", href: "#prosjekter" },
];

export const skills: Skill[] = [
  { name: "Python", category: "Programmering", projectIds: ["elgviz"] },
  { name: "Java", category: "Programmering", projectIds: ["bekkestua"] },
  { name: "C#", category: "Programmering", projectIds: ["portfolio"] },
  { name: "TypeScript", category: "Programmering", projectIds: ["portfolio"] },
  { name: "JavaScript", category: "Programmering", projectIds: ["bekkestua"] },
  { name: "HTML og CSS", category: "Programmering", projectIds: ["bekkestua", "portfolio"] },
  { name: "React", category: "Rammeverk og biblioteker", projectIds: ["portfolio"] },
  { name: ".NET", category: "Rammeverk og biblioteker", projectIds: ["portfolio"] },
  { name: "Spring Boot", category: "Rammeverk og biblioteker", projectIds: ["bekkestua"] },
  { name: "NumPy", category: "Rammeverk og biblioteker", projectIds: ["elgviz"] },
  { name: "Ouster SDK", category: "Rammeverk og biblioteker", projectIds: ["elgviz"] },
  { name: "YOLO", category: "AI og data", projectIds: ["elgviz"] },
  { name: "Roboflow", category: "AI og data", projectIds: ["elgviz"] },
  { name: "LiDAR", category: "AI og data", projectIds: ["elgviz"] },
  { name: "PostgreSQL", category: "Infrastruktur og verktøy", projectIds: ["bekkestua", "portfolio"] },
  { name: "Linux Server", category: "Infrastruktur og verktøy", projectIds: ["bekkestua", "self-hosting"] },
  { name: "Nginx", category: "Infrastruktur og verktøy", projectIds: ["bekkestua"] },
  { name: "SSH", category: "Infrastruktur og verktøy", projectIds: ["bekkestua", "self-hosting"] },
  { name: "Cloudflare Tunnel", category: "Infrastruktur og verktøy", projectIds: ["self-hosting"] },
  { name: "Palo Alto Networks", category: "Infrastruktur og verktøy", projectIds: [] },
];

const categories: SkillCategory[] = [
  "Programmering", "Rammeverk og biblioteker", "AI og data", "Infrastruktur og verktøy",
];

/** Accessible, keyboard-operable skill selector. Does not imply that each skill needs a project. */
export default function SkillsSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = skills.find((skill) => skill.name === selected);
  const related = portfolioProjects.filter((project) => chosen?.projectIds.includes(project.id));

  return (
    <section id="ferdigheter" className="skills-section" aria-labelledby="skills-heading">
      <h2 id="skills-heading">Ferdigheter</h2>
      <p>Velg en ferdighet for å se hvilke prosjekter jeg har brukt den i.</p>
      <div className="skill-groups">
        {categories.map((category) => (
          <div className="skill-group" key={category}>
            <h3>{category}</h3>
            <div className="skill-buttons">
              {skills.filter((skill) => skill.category === category).map((skill) => (
                <button
                  type="button"
                  key={skill.name}
                  className="skill-button"
                  aria-pressed={selected === skill.name}
                  onClick={() => setSelected(selected === skill.name ? null : skill.name)}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {chosen && (
        <div className="skill-detail" role="region" aria-label={`Prosjekter for ${chosen.name}`}>
          <h3>{chosen.name}</h3>
          {related.length ? (
            <ul>
              {related.map((project) => (
                <li key={project.id}>
                  {project.href ? <a href={project.href}>{project.name}</a> : project.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>Praktisk erfaring – ikke knyttet til et publisert prosjekt ennå.</p>
          )}
        </div>
      )}
    </section>
  );
}
