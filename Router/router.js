import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);

// Fonction pour récupérer la route correspondant à une URL donnée
const getRouteByUrl = (url) => {
  let currentRoute = null;

  // Parcours de toutes les routes pour trouver la correspondance
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });

  // Si aucune correspondance n'est trouvée, on retourne la route 404
  if (currentRoute != null) {
    return currentRoute;
  } else {
    return route404;
  }
};

// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
  // Affiche le loader
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";

  const path = window.location.pathname;

  // Récupération de l'URL actuelle
  const actualRoute = getRouteByUrl(path);
  if (!actualRoute) {
    console.error("Route introuvable pour le chemin :", path);
    return;
  }

  // Vérification des droits d'accès à la page
  const allRolesArray = actualRoute.authorize;

  if (allRolesArray.length > 0) {
    if (allRolesArray.includes("disconnected")) {
      if (isConnected()) {
        window.location.replace("/");
      }
    } else {
      const roleUser = getRole();
      if (!allRolesArray.includes(roleUser)) {
        window.location.replace("/"); // L'utilisateur n'a pas le droit d'accéder à la page
      }
    }
  }

  // Récupération du contenu HTML de la route
  try {
    const html = await fetch(actualRoute.pathHTML).then((data) => data.text());
    const mainPage = document.getElementById("main-page");

    if (mainPage) {
      // Remplace uniquement le contenu de la section <main>
      mainPage.innerHTML = html;
    } else {
      console.error("Élément avec l'ID 'main-page' introuvable.");
    }
  } catch (error) {
    console.error("Erreur lors du chargement du contenu HTML :", error);
  }

  // Ajout du contenu JavaScript
  if (actualRoute.pathJS !== "") {
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS);
    document.querySelector("body").appendChild(scriptTag);
  }

  // Changement du titre de la page
  document.title = actualRoute.title + " - " + websiteName;

  // Afficher et masquer les éléments en fonction du rôle de l'utilisateur
  showAndHideElementForRoles();

  // Masque le loader après le chargement du contenu
  if (loader) loader.style.display = "none";
};

// Fonction pour gérer les événements de routage (clic sur les liens)
const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  // Mise à jour de l'URL dans l'historique du navigateur
  window.history.pushState({}, "", event.target.href);
  // Chargement du contenu de la nouvelle page
  LoadContentPage();
};
// Gestion de l'événement de retour en arrière dans l'historique du navigateur
window.onpopstate = LoadContentPage;
// Assignation de la fonction routeEvent à la propriété route de la fenêtre
window.route = routeEvent;
// Chargement du contenu de la page au chargement initial
LoadContentPage();
