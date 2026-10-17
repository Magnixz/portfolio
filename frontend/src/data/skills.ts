
export type Language = "no" | "en";

export interface Skill {
  slug: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
}

export const skills: Skill[] = [

  // ===================================
  // PROGRAMMERING OG DATABEHANDLING
  // ===================================

  {
    slug: "python",
    name: {
      no: "Python",
      en: "Python",
    },
    description: {
      no: "Programmering, automatisering, bildebehandling og databehandling.",
      en: "Programming, automation, image processing and data processing.",
    },
  },

  {
    slug: "lidar",
    name: {
      no: "LiDAR",
      en: "LiDAR",
    },
    description: {
      no: "Behandling og analyse av sensordata og tredimensjonale punktskyer.",
      en: "Processing and analysis of sensor data and 3D point clouds.",
    },
  },

  {
    slug: "ai",
    name: {
      no: "KI og maskinlæring",
      en: "AI and machine learning",
    },
    description: {
      no: "Utvikling, trening og evaluering av maskinlæringsmodeller.",
      en: "Development, training and evaluation of machine learning models.",
    },
  },

  {
    slug: "yolo",
    name: {
      no: "YOLO",
      en: "YOLO",
    },
    description: {
      no: "Objektdeteksjon, modelltrening og evaluering med Ultralytics YOLO.",
      en: "Object detection, model training and evaluation with Ultralytics YOLO.",
    },
  },

  {
    slug: "opencv",
    name: {
      no: "OpenCV",
      en: "OpenCV",
    },
    description: {
      no: "Bildebehandling, normalisering og konvertering av sensordata.",
      en: "Image processing, normalization and conversion of sensor data.",
    },
  },

  {
    slug: "numpy",
    name: {
      no: "NumPy",
      en: "NumPy",
    },
    description: {
      no: "Numeriske beregninger og behandling av datasett med Python.",
      en: "Numerical calculations and dataset processing with Python.",
    },
  },

  {
    slug: "roboflow",
    name: {
      no: "Roboflow",
      en: "Roboflow",
    },
    description: {
      no: "Annotering, organisering og klargjøring av datasett til maskinlæring.",
      en: "Annotation, organization and preparation of machine learning datasets.",
    },
  },

  {
    slug: "ouster-sdk",
    name: {
      no: "Ouster SDK",
      en: "Ouster SDK",
    },
    description: {
      no: "Innhenting, konvertering og behandling av LiDAR-data fra Ouster-sensorer.",
      en: "Reading, converting and processing LiDAR data from Ouster sensors.",
    },
  },

  {
    slug: "mqtt",
    name: {
      no: "MQTT",
      en: "MQTT",
    },
    description: {
      no: "Meldingsbasert kommunikasjon mellom sensorer, programmer og andre systemer.",
      en: "Message-based communication between sensors, applications and other systems.",
    },
  },

  // ===================================
  // FRONTEND
  // ===================================

  {
    slug: "html",
    name: {
      no: "HTML",
      en: "HTML",
    },
    description: {
      no: "Strukturering av nettsider med HTML5 og semantiske elementer.",
      en: "Structuring web pages with HTML5 and semantic elements.",
    },
  },

  {
    slug: "css",
    name: {
      no: "CSS",
      en: "CSS",
    },
    description: {
      no: "Styling, layout og responsivt design for ulike skjermstørrelser.",
      en: "Styling, layouts and responsive design for different screen sizes.",
    },
  },

  {
    slug: "javascript",
    name: {
      no: "JavaScript",
      en: "JavaScript",
    },
    description: {
      no: "Utvikling av interaktive og dynamiske funksjoner på nettsider.",
      en: "Development of interactive and dynamic website functionality.",
    },
  },

  {
    slug: "typescript",
    name: {
      no: "TypeScript",
      en: "TypeScript",
    },
    description: {
      no: "Typesikker utvikling av webapplikasjoner og komponenter.",
      en: "Type-safe development of web applications and components.",
    },
  },

  {
    slug: "react",
    name: {
      no: "React",
      en: "React",
    },
    description: {
      no: "Komponentbasert frontendutvikling med React, hooks og state.",
      en: "Component-based frontend development using React, hooks and state.",
    },
  },

  // ===================================
  // BACKEND OG DATABASER
  // ===================================

  {
    slug: "dotnet",
    name: {
      no: ".NET",
      en: ".NET",
    },
    description: {
      no: "Backendutvikling med C#, ASP.NET Core, REST API og Entity Framework Core.",
      en: "Backend development with C#, ASP.NET Core, REST APIs and Entity Framework Core.",
    },
  },

  {
    slug: "postgresql",
    name: {
      no: "PostgreSQL",
      en: "PostgreSQL",
    },
    description: {
      no: "Relasjonsdatabaser, SQL, datamodellering og databasemigrering.",
      en: "Relational databases, SQL, data modelling and database migrations.",
    },
  },

  {
    slug: "h2",
    name: {
      no: "H2 Database",
      en: "H2 Database",
    },
    description: {
      no: "Relasjonsdatabase brukt til lagring av priser, åpningstider og innhold i et Java-webprosjekt.",
      en: "Relational database used for storing prices, opening hours and content in a Java web project.",
    },
  },

  // ===================================
  // DESIGN OG TILGJENGELIGHET
  // ===================================

  {
    slug: "accessibility",
    name: {
      no: "Universell utforming",
      en: "Digital accessibility",
    },
    description: {
      no: "Utvikling av tilgjengelige digitale løsninger med semantisk HTML, WCAG og god brukeropplevelse.",
      en: "Developing accessible digital solutions using semantic HTML, WCAG and good user experience.",
    },
  },

];
