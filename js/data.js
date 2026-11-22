/* Contenu du portfolio (repris du CV) : c'est le seul fichier à modifier pour changer les textes.
   La scène 3D (main.js) et la version texte pour lecteurs d'écran le lisent toutes les deux. */
window.PORTFOLIO = {
  nom: "Bienvenu Cedrick Bakary Yapo",
  github: "https://github.com/bakiyapo9-bot/",
  linkedin: "https://linkedin.com/in/bienvenu-cedrick-bakary",
  email: "bakiyapo9@gmail.com",
  telephone: "01 73 36 83 92",
  telephoneLien: "tel:+2250173368392",
  ville: "Grand-Bassam, Côte d’Ivoire",
  cv: "assets/docs/CV_Bienvenu_Cedrick_Bakary_Yapo.pdf",

  // Mur du fond (à côté du logo) : le nom en grand, puis l'accroche
  accroche: "Étudiant en Génie Logiciel / Informatique",
  // Mur de droite, au-dessus de la photo
  profil: "Étudiant en Licence 2 Génie Logiciel / Informatique, motivé et sérieux, je recherche un stage afin de mettre en pratique mes connaissances en programmation et en développement web et mobile, tout en développant mes compétences professionnelles en entreprise.",

  // [titre, description, technologies, lien, couleur claire, couleur foncée]
  // Lien : un nom de dépôt GitHub (« edu.ai ») ou l'adresse complète d'un site en ligne (https://…)
  perso: [
    ["edu.IA", "Tuteur IA pour lycéens ivoiriens : cours du programme, exercices et assistant vocal Akwaba. Vainqueur du Hackathon IIT 2026.", "HTML, CSS, JavaScript, Python", "edu.ai", "#f77f00", "#c45f00"],
    ["YBSHOPING", "Boutique en ligne de baskets et sneakers.", "HTML, CSS, JavaScript", "https://ybshopping.netlify.app/", "#009e60", "#006b40"],
    ["Campus360", "Gestion universitaire : étudiants, inscriptions, notes, emplois du temps et finances.", "HTML, CSS, Bootstrap, JavaScript", "Campus360", "#1f5fbf", "#123a78"],
    ["Calculatrice scientifique", "Calculatrice en ligne multi-mode : résolution d’équations, intégrales et statistiques.", "HTML, CSS, JavaScript", "https://calculatricescientifi.netlify.app/", "#0f7c8c", "#0a4f59"]
  ],
  acad: [
    ["Site Maserati", "Site vitrine multi-pages d’une concession fictive, avec formulaire de contact.", "HTML, CSS, Bootstrap, JavaScript", "https://maserati-site.netlify.app/", "#8a1c2b", "#4e0f19"],
    ["MCR Construction", "Site vitrine d’une entreprise de construction : bâtiment, infrastructures et génie civil.", "HTML, CSS, Bootstrap, JavaScript", "https://mcr-construction.netlify.app/", "#c9821b", "#7a4a0c"]
  ],

  // Compétences affichées sur l'écran du bureau : [rubrique, éléments, niveau (facultatif), couleur]
  competences: [
    ["Langages de programmation", ["C", "Python", "Java"], "Intermédiaire", "#f77f00"],
    ["Développement web", ["HTML", "CSS", "Bootstrap", "JavaScript"], "", "#1f5fbf"],
    ["Développement mobile", ["Dart", "Flutter"], "", "#0a7ea4"],
    ["Bases de données", ["SQL Server", "MySQL"], "Intermédiaire", "#8a1c2b"],
    ["Design UI/UX", ["User Research", "Wireframing", "Prototypage"], "", "#c2407a"],
    ["Outils et technologies", ["Git / GitHub", "VS Code", "Code::Blocks", "Figma"], "", "#24292f"],
    ["Outils bureautiques", ["Word", "PowerPoint", "Excel"], "Word, PowerPoint : intermédiaire · Excel : basique", "#2b7a3d"],
    ["Langues", ["Français", "Anglais"], "Français : courant · Anglais : intermédiaire", "#009e60"]
  ],

  // Télé, 1re partie : le projet (hackathon)
  projet: {
    titre: "Hackathon IIT 2026",
    resultat: "Vainqueur · 1re place",
    lieu: "Institut Ivoirien de Technologie, Grand-Bassam",
    points: [
      "Projet informatique conçu en équipe de 5 personnes",
      "Travail sous contrainte de temps, avec des objectifs précis",
      "Technologies : HTML, CSS, JavaScript, Python"
    ],
    role: "Rôle : développeur front-end",
    depot: "github.com/bakiyapo9-bot/edu.ai"
  },

  // Télé, 2e partie : [poste, type, période, lieu, durée]
  experiences: [
    ["Chroniqueur radio", "Stage d’immersion", "Juil. – août 2025", "Radio Bassam, Grand-Bassam", "2 mois"],
    ["Monteur vidéo", "Stage d’immersion", "Juil. – août 2024", "Conseil régional du Sud-Comoé, Grand-Bassam", "2 mois"]
  ],

  // [période, diplôme, établissement] (version texte uniquement)
  formation: [
    ["2026 – en cours", "Licence 2, Informatique / Génie logiciel", "Institut Ivoirien de Technologie, Grand-Bassam"],
    ["2025 – 2026", "Licence 1, Informatique / Génie logiciel", "Institut Ivoirien de Technologie, Grand-Bassam"],
    ["Sept. 2024 – juil. 2025", "Baccalauréat série C", "Lycée Moderne II de Grand-Bassam"]
  ]
};
