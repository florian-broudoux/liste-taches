const CLE_STOCKAGE = "liste-taches";

// Définit les tâches affichées lors du premier lancement.
const tachesDeDepart = [
    {
        id: 1,
        texte: "Faire les courses",
        terminee: false,
        date: Date.now() - 3000,
    },
    {
        id: 2,
        texte: "Réviser JavaScript",
        terminee: true,
        date: Date.now() - 2000,
    },
    {
        id: 3,
        texte: "Ranger le bureau",
        terminee: false,
        date: Date.now() - 1000,
    },
];

// Récupère les éléments HTML nécessaires.
const liste = document.querySelector(".liste-taches");
const compteur = document.querySelector(".compteur");
const formAjout = document.getElementById("form-ajout");
const champTache = document.getElementById("nouvelle-tache");
const erreurTache = document.getElementById("erreur-tache");
const groupeFiltres = document.querySelector(".filtres");
const boutonsFiltre = document.querySelectorAll(".btn-filtre");
const champRecherche = document.querySelector("#recherche");
const listeTri = document.querySelector("#tri");
const statsTexte = document.querySelector("#stats-texte");
const barreRemplissage = document.querySelector(".barre-remplissage");

// Charge les tâches enregistrées.
const taches = chargerTaches();

// Définit le filtre actif par défaut.
let filtreActuel = "toutes";

// Récupère les tâches depuis le stockage local.
function chargerTaches() {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    if (donnees === null) {
        return tachesDeDepart;
    }
    return JSON.parse(donnees);
}

// Enregistre les tâches dans le stockage local.
function sauvegarderTaches() {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(taches));
}

// Crée un élément HTML pour une tâche.
function creerElementTache(tache) {
    const li = document.createElement("li");
    li.classList.add("tache");
    li.dataset.id = tache.id;

    // Ajoute la classe si la tâche est terminée.
    if (tache.terminee) {
        li.classList.add("done");
    }

    // Crée le texte de la tâche.
    const spanTexte = document.createElement("span");
    spanTexte.classList.add("tache-texte");
    spanTexte.textContent = tache.texte;

    // Crée le bouton de suppression.
    const btnSuppr = document.createElement("button");
    btnSuppr.classList.add("btn-supprimer");
    btnSuppr.textContent = "Supprimer";
    btnSuppr.setAttribute("aria-label", `Supprimer : ${tache.texte}`);

    // Crée le bouton de changement de statut.
    const btnTerminer = document.createElement("button");
    btnTerminer.classList.add("btn-terminer");
    btnTerminer.textContent = tache.terminee ? "Réactiver" : "Terminer";
    btnTerminer.setAttribute(
        "aria-label",
        `${btnTerminer.textContent} : ${tache.texte}`,
    );

    // Ajoute les éléments dans la liste.
    li.append(spanTexte, btnTerminer, btnSuppr);
    return li;
}

// Filtre, recherche et trie les tâches.
function tachesAAfficher() {
    const recherche = champRecherche.value.trim().toLowerCase();

    // Filtre les tâches selon leur statut.
    let resultat = taches.filter((tache) => {
        if (filtreActuel === "en-cours") {
            return !tache.terminee;
        }
        if (filtreActuel === "terminees") {
            return tache.terminee;
        }
        return true;
    });

    // Filtre les tâches selon le texte recherché.
    resultat = resultat.filter((tache) =>
        tache.texte.toLowerCase().includes(recherche),
    );

    // Trie les tâches par nom ou par date.
    if (listeTri.value === "nom") {
        resultat = [...resultat].sort((a, b) => a.texte.localeCompare(b.texte));
    } else {
        resultat = [...resultat].sort((a, b) => a.date - b.date);
    }

    return resultat;
}

// Affiche les tâches correspondant aux critères.
function afficherTaches() {
    const visibles = tachesAAfficher();
    liste.innerHTML = "";

    // Affiche un message si aucune tâche ne correspond.
    if (visibles.length === 0) {
        const vide = document.createElement("li");
        vide.textContent = "Aucune tâche à afficher";
        vide.classList.add("liste-vide");
        liste.append(vide);
    } else {
        // Crée et ajoute les tâches visibles.
        const elements = visibles.map(creerElementTache);
        liste.append(...elements);
    }

    // Actualise les compteurs et statistiques.
    mettreAJourCompteur();
    mettreAJourStatistiques();
}

// Supprime une tâche grâce à son identifiant.
function supprimerTache(id) {
    const index = taches.findIndex((tache) => tache.id === id);

    // Supprime la tâche si elle existe.
    if (index >= 0) {
        taches.splice(index, 1);
    }

    sauvegarderTaches();
    afficherTaches();
}

// Inverse le statut d'une tâche.
function basculerTache(id) {
    const tache = taches.find((element) => element.id === id);

    // Modifie le statut si la tâche existe.
    if (tache !== undefined) {
        tache.terminee = !tache.terminee;
    }

    sauvegarderTaches();
    afficherTaches();
}

// Actualise le nombre de tâches terminées et en cours.
function mettreAJourCompteur() {
    const terminees = taches.filter((tache) => tache.terminee).length;
    const enCours = taches.length - terminees;
    compteur.textContent = `${terminees} terminée(s), ${enCours} en cours`;
}

// Calcule et affiche le pourcentage de tâches terminées.
function mettreAJourStatistiques() {
    const total = taches.length;
    const terminees = taches.filter((tache) => tache.terminee).length;
    const pourcentage = total === 0 ? 0 : Math.round((terminees / total) * 100);

    // Actualise le texte et la barre de progression.
    statsTexte.textContent = `${terminees} / ${total} terminée(s) · ${pourcentage} %`;
    barreRemplissage.style.width = `${pourcentage}%`;
}

// Ajoute une nouvelle tâche à la liste.
function ajouterTache(texte) {
    const maintenant = Date.now();

    // Crée un objet représentant la nouvelle tâche.
    taches.push({
        id: maintenant,
        texte: texte,
        terminee: false,
        date: maintenant,
    });

    sauvegarderTaches();
    afficherTaches();
}

// Affiche un message d'erreur sous le champ.
function afficherErreur(message) {
    erreurTache.textContent = message;
    champTache.classList.add("invalide");
    champTache.setAttribute("aria-invalid", "true");
    champTache.focus();
}

// Efface le message et le style d'erreur.
function effacerErreur() {
    erreurTache.textContent = "";
    champTache.classList.remove("invalide");
    champTache.setAttribute("aria-invalid", "false");
}

// Gère la soumission du formulaire d'ajout.
formAjout.addEventListener("submit", function (event) {
    event.preventDefault();

    // Récupère le texte sans espaces inutiles.
    const texte = champTache.value.trim();

    // Vérifie que le champ n'est pas vide.
    if (texte === "") {
        afficherErreur("Veuillez saisir une tâche.");
        return;
    } else if (texte.length < 3) {
        // Vérifie que le texte contient au moins 3 caractères.
        afficherErreur("La tâche doit contenir au moins 3 caractères.");
        return;
    } else {
        // Ajoute la tâche et réinitialise le formulaire.
        ajouterTache(texte);
        effacerErreur();
        champTache.value = "";
        champTache.focus();
    }
});

// Efface les erreurs pendant la saisie.
champTache.addEventListener("input", effacerErreur);

// Gère les clics sur les boutons de chaque tâche.
liste.addEventListener("click", (event) => {
    // Récupère le bouton cliqué.
    const bouton = event.target.closest("button");
    if (bouton === null) {
        return;
    }

    // Récupère l'identifiant de la tâche concernée.
    const li = bouton.closest(".tache");
    const id = Number(li.dataset.id);

    // Détermine l'action selon le bouton cliqué.
    if (bouton.classList.contains("btn-supprimer")) {
        supprimerTache(id);
    } else if (bouton.classList.contains("btn-terminer")) {
        basculerTache(id);
    }
});

// Gère les clics sur les boutons de filtre.
groupeFiltres.addEventListener("click", (event) => {
    const bouton = event.target.closest(".btn-filtre");
    if (bouton === null) {
        return;
    }

    // Un seul bouton actif à la fois.
    boutonsFiltre.forEach((element) => {
        element.classList.remove("actif");
        element.setAttribute("aria-pressed", "false");
    });
    bouton.classList.add("actif");
    bouton.setAttribute("aria-pressed", "true");

    // Met à jour le filtre et réaffiche les tâches.
    filtreActuel = bouton.dataset.filtre;
    afficherTaches();
});

// Actualise la liste à chaque recherche.
champRecherche.addEventListener("input", afficherTaches);

// Actualise la liste à chaque changement de tri.
listeTri.addEventListener("change", afficherTaches);

// Affiche les tâches dès le chargement de la page.
afficherTaches();

/* CONTENU AVANT FICHE 4
const titre = document.querySelector("h1");
titre.textContent = "Mes tâches du jour";

const taches = document.querySelectorAll(".tache");
console.log(`Nombres de tâches : ${taches.length}`);

const compteur = document.querySelector(".compteur");
compteur.textContent = `${taches.length} tâches en cours`;

taches.forEach((tache) => {
    tache.textContent = `📌 ${tache.textContent}`;
    console.log(tache.textContent);
});

taches[0].classList.add("done");
taches[0].dataset.status ="done";

let terminees = 0;
let enCours = 0;

taches.forEach((tache) => {
    if (tache.dataset.status === "done") {
        terminees ++;
    } else {
        enCours ++
    }
});

compteur.textContent = `${terminees} terminée(s), ${enCours} en cours`;
*/
