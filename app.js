"use strict";

const API = "https://api.github.com";

const els = {
  form: document.getElementById("search-form"),
  input: document.getElementById("username-input"),
  status: document.getElementById("status"),
  profile: document.getElementById("profile"),
  avatar: document.getElementById("avatar"),
  displayName: document.getElementById("display-name"),
  login: document.getElementById("login"),
  bio: document.getElementById("bio"),
  statRepos: document.getElementById("stat-repos"),
  statFollowers: document.getElementById("stat-followers"),
  statStars: document.getElementById("stat-stars"),
  statForks: document.getElementById("stat-forks"),
  charts: document.getElementById("charts"),
};

// Palette style GitHub pour les barres
const COLORS = [
  "#58a6ff", "#3fb950", "#f78166", "#bc8cff", "#f85149",
  "#39c5cf", "#d29922", "#8b949e", "#db61a2", "#7ee787",
];

let charts = { stars: null, forks: null, langs: null };

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Utilisateur « ${usernameFromUrl(url)} » introuvable.`);
    if (res.status === 403) throw new Error("Limite de l'API GitHub atteinte (60 requêtes/heure sans jeton). Réessaie plus tard.");
    throw new Error(`Erreur API GitHub : ${res.status}`);
  }
  return res.json();
}

function usernameFromUrl(url) {
  const parts = url.replace(API, "").split("/").filter(Boolean);
  return parts[0] || "";
}

function showStatus(message, isError) {
  els.status.textContent = message;
  els.status.classList.toggle("error", Boolean(isError));
  els.status.classList.remove("hidden");
  els.profile.classList.add("hidden");
  els.charts.classList.add("hidden");
}

function fmt(n) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function renderProfile(user, repos) {
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  els.avatar.src = user.avatar_url;
  els.displayName.textContent = user.name || user.login;
  els.login.textContent = "@" + user.login;
  els.login.href = user.html_url;
  els.bio.textContent = user.bio || "";
  els.bio.classList.toggle("hidden", !user.bio);
  els.statRepos.textContent = fmt(user.public_repos);
  els.statFollowers.textContent = fmt(user.followers);
  els.statStars.textContent = fmt(stars);
  els.statForks.textContent = fmt(forks);

  els.status.classList.add("hidden");
  els.profile.classList.remove("hidden");
  els.charts.classList.remove("hidden");
}

function topRepos(repos, key) {
  return [...repos]
    .sort((a, b) => b[key] - a[key])
    .slice(0, 10)
    .filter((r) => r[key] > 0);
}

function languageCounts(repos) {
  const counts = {};
  for (const r of repos) {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function renderChart(canvasId, key, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (charts[key]) charts[key].destroy();

  charts[key] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: key === "langs" ? "dépôts" : key,
        data,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
        maxBarThickness: 42,
      }],
    },
    options: {
      indexAxis: key === "langs" ? "x" : "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#21262d" }, ticks: { color: "#8b949e" }, beginAtZero: true },
        y: { grid: { color: "#21262d" }, ticks: { color: "#8b949e" } },
      },
    },
  });
}

async function loadProfile(username) {
  showStatus(`Chargement du profil @${username}…`, false);
  try {
    const [user, repos] = await Promise.all([
      fetchJSON(`${API}/users/${encodeURIComponent(username)}`),
      fetchJSON(`${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`),
    ]);

    renderProfile(user, repos);

    const topStars = topRepos(repos, "stargazers_count");
    renderChart("chart-stars", "stars", topStars.map((r) => r.name), topStars.map((r) => r.stargazers_count));

    const topForks = topRepos(repos, "forks_count");
    renderChart("chart-forks", "forks", topForks.map((r) => r.name), topForks.map((r) => r.forks_count));

    const langs = languageCounts(repos);
    renderChart("chart-langs", "langs", langs.map(([l]) => l), langs.map(([, n]) => n));

    if (repos.length === 0) {
      showStatus(`@${username} n'a aucun dépôt public à afficher.`, true);
    }
  } catch (err) {
    showStatus(err.message, true);
  }
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = els.input.value.trim();
  if (username) loadProfile(username);
});

loadProfile(els.input.value.trim() || "galaxiel");
