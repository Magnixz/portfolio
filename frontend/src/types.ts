
// Typene for innholdet som kommer fra API-et

export type Language = "no" | "en";

export interface Project {
  id: number;
  name: string;
  nameEn: string;
  projectType: string;
  projectTypeEn: string;
  description: string;
  descriptionEn: string;
  detailedDescription: string | null;
  detailedDescriptionEn: string | null;
  myRole: string | null;
  myRoleEn: string | null;
  logoUrl: string | null;
  gitHubLink: string | null;
  demoUrl: string | null;
  sortOrder: number;
  skillIds: number[];
}

export interface Skill {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  sortOrder: number;
  projectIds: number[];
}

export interface Course {
  id: number;
  educationId: number;
  name: string;
  nameEn: string;
  sortOrder: number;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  degreeEn: string;
  period: string;
  ects: number;
  sortOrder: number;
  courses: Course[];
}

// Dette er oppsettet på dataene vi får fra /api/content
export interface PortfolioContent {
  projects: Project[];
  skills: Skill[];
  educations: Education[];
}

// Bruker engelsk tekst hvis den finnes, ellers norsk
export function translated(
  norsk: string | null | undefined,
  engelsk: string | null | undefined,
  sprak: Language
): string {
  if (sprak === "en") {
    return engelsk?.trim() || norsk || "";
  }

  return norsk || "";
}
