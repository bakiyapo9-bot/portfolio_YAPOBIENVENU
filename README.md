# Portfolio 3D · Bienvenu Cedrick Bakary Yapo

Portfolio interactif en 3D : on visite un salon en faisant défiler la page. Chaque écran de défilement déplace la caméra vers un nouvel endroit de la pièce.


## Technologies

- HTML5, CSS3, [Bootstrap 5.3](https://getbootstrap.com/)
- JavaScript (sans framework, sans étape de compilation)
- [Three.js r128](https://threejs.org/) pour la 3D (chargé depuis un CDN)
- Textures dessinées en Canvas 2D (écrans, cadres, télé, iPhone)

## Structure

```
portfolio-simple/
├── index.html            Page unique : sections de défilement et version texte accessible
├── css/
│   └── style.css         Mise en page, navigation, icônes sociales
├── js/
│   ├── data.js           Contenu : projets, parcours, compétences, liens (à modifier ici)
│   ├── main.js           Scène 3D, parcours de la caméra, interactions
│   └── photo.js          Photo encodée en base64 (voir plus bas)
├── assets/
│   ├── images/
│   │   └── photo.jpg     Photo d'origine
│   └── docs/
│       └── CV_Bienvenu_Cedrick_Bakary_Yapo.pdf
├── .editorconfig
├── .gitignore
└── README.md
```

## Mettre en ligne sur GitHub Pages



## Accessibilité

- Tout le contenu est aussi présent en texte dans la page, pour les lecteurs d'écran.
- Les animations sont réduites si le système demande `prefers-reduced-motion`.
- Les points de navigation à droite permettent d'aller directement à chaque étape.

## Auteur

**Bienvenu Cedrick Bakary Yapo**, étudiant en génie logiciel à l'Institut Ivoirien de Technologie (Grand-Bassam).
