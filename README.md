# 📊 GitHub Bar Charts

Visualisez les statistiques d'un profil GitHub en **graphiques en barres** : étoiles par dépôt, forks, et langages de programmation utilisés.

## ✨ Fonctionnalités

- 🔎 Recherche de n'importe quel utilisateur GitHub public
- ⭐ Top 10 des dépôts par nombre d'étoiles
- 🍴 Top 10 des dépôts par nombre de forks
- 💻 Répartition des langages (nombre de dépôts par langage)
- 🌙 Thème sombre inspiré de GitHub, responsive
- ⚡ 100 % front-end : HTML + CSS + JavaScript, avec [Chart.js](https://www.chartjs.org/)

## 🚀 Utilisation

Aucune installation nécessaire — ouvrez simplement [`index.html`](index.html) dans un navigateur, ou utilisez GitHub Pages :

1. `Settings` → `Pages` → `Deploy from a branch` → `main` / `root`
2. L'app est disponible sur `https://galaxiel.github.io/github-bar-charts/`

## 🛠️ Comment ça marche

- L'app interroge l'**API publique GitHub** (`/users/{user}` et `/users/{user}/repos`)
- Aucun jeton requis (limite : 60 requêtes/heure par IP)
- Les graphiques sont rendus avec **Chart.js 4** (chargé via CDN)

## 📁 Structure

```
github-bar-charts/
├── index.html   # Structure de la page
├── style.css    # Thème sombre style GitHub
├── app.js       # Logique : API GitHub + rendu Chart.js
└── README.md
```

## 📄 Licence

MIT
