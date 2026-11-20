const CLE_STOCKAGE = "liste-taches";

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
const taches = chargerTaches();

let filtreActuel = "toutes";

function chargerTaches() {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    if (donnees === null) {
        return tachesDeDepart;
    }
    return JSON.parse(donnees);
}

function sauvegarderTaches() {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(taches));
}

function creerElementTache(tache) {
    const li = document.createElement("li");
    li.classList.add("tache");
    li.dataset.id = tache.id;
    if (tache.terminee) {
        li.classList.add("done");
    }
    const spanTexte = document.createElement("span");
    spanTexte.classList.add("tache-texte");
    spanTexte.textContent = tache.texte;

    const btnSuppr = document.createElement("button");
    btnSuppr.classList.add("btn-supprimer");
    btnSuppr.textContent = "Supprimer";
    btnSuppr.setAttribute("aria-label", `Supprimer : ${tache.texte}`);

    const btnTerminer = document.createElement("button");
    btnTerminer.classList.add("btn-terminer");
    btnTerminer.textContent = tache.terminee ? "Réactiver" : "Terminer";
    btnTerminer.setAttribute(
        "aria-label",
        `${btnTerminer.textContent} : ${tache.texte}`,
    );

    li.append(spanTexte, btnTerminer, btnSuppr);
    return li;
}

function tachesAAfficher() {
    const recherche = champRecherche.value.trim().toLowerCase();

    let resultat = taches.filter((tache) => {

    if (filtreActuel === "en-cours") {
        return !tache.terminee;
    }
    if (filtreActuel === "terminees") {
        return tache.terminee
    }
    return true;
    });

    resultat = resultat.filter((tache) => tache.texte.toLowerCase().includes(recherche));

    if (listeTri.value === "nom") {
        resultat = [...resultat].sort((a, b) => a.texte.localeCompare(b.texte));
    } else {
        resultat = [...resultat].sort((a, b) => a.date - b.date);
    }

    return resultat;
}

function afficherTaches() {
    const visibles = tachesAAfficher()
    liste.innerHTML = "";
    if (visibles.length === 0) {
        const vide = document.createElement("li");
        vide.textContent = "Aucune tâche à afficher";
        vide.classList.add("liste-vide");
        liste.append(vide);
    } else {
        const elements = visibles.map(creerElementTache);
        liste.append(...elements);
    }
    mettreAJourCompteur();
    mettreAJourStatistiques();
}

function supprimerTache(id) {
    const index = taches.findIndex((tache) => tache.id === id);
    if (index >= 0) {
        taches.splice(index, 1);
    }
    sauvegarderTaches()
    afficherTaches();
}

function basculerTache(id) {
    const tache = taches.find((element) => element.id === id);
    if (tache !== undefined) {
        tache.terminee = !tache.terminee;
    }
    sauvegarderTaches()
    afficherTaches();
}

function mettreAJourCompteur() {
    const terminees = taches.filter((tache) => tache.terminee).length;
    const enCours = taches.length - terminees;
    compteur.textContent = `${terminees} terminée(s), ${enCours} en cours`;
}

function mettreAJourStatistiques() {
    const total = taches.length;
    const terminees = taches.filter((tache) => tache.terminee).length;
    const pourcentage = total === 0 ? 0 : Math.round((terminees / total) * 100);

    statsTexte.textContent = `${terminees} / ${total} terminée(s) · ${pourcentage} %`;
    barreRemplissage.style.width = `${pourcentage}%`;
}

function ajouterTache(texte) {
    const maintenant = Date.now();
    taches.push({
        id: maintenant,
        texte: texte,
        terminee: false,
        date: maintenant,
    });
    sauvegarderTaches()
    afficherTaches();
}

function afficherErreur(message) {
    erreurTache.textContent = message;
    champTache.classList.add("invalide");
    champTache.setAttribute("aria-invalid", "true");
    champTache.focus();
}

function effacerErreur() {
    erreurTache.textContent = "";
    champTache.classList.remove("invalide");
    champTache.setAttribute("aria-invalid", "false");
}

formAjout.addEventListener("submit", function(event) {
    event.preventDefault();

    const texte = champTache.value.trim();
    if (texte === "") {
        afficherErreur("Veuillez saisir une tâche.");
        return;
    } else if (texte.length < 3) {
        afficherErreur("La tâche doit contenir au moins 3 caractères.");
        return;
    } else {
        ajouterTache(texte);
        effacerErreur();
        champTache.value = "";
        champTache.focus();
    }
});

champTache.addEventListener("input", effacerErreur);

liste.addEventListener("click", (event) => {
    const bouton = event.target.closest("button");
    if (bouton === null) {
        return;
    }

    const li = bouton.closest(".tache");
    const id = Number(li.dataset.id);

    if (bouton.classList.contains("btn-supprimer")) {
        supprimerTache(id);
    } else if (bouton.classList.contains("btn-terminer")) {
        basculerTache(id);
    }
});

groupeFiltres.addEventListener("click", (event) => {
    const bouton = event.target.closest(".btn-filtre");
    if (bouton === null) {
        return;
    }

    // Un seul bouton actif à la fois
    boutonsFiltre.forEach((element) => {
        element.classList.remove("actif");
        element.setAttribute("aria-pressed", "false");
    });
    bouton.classList.add("actif");
    bouton.setAttribute("aria-pressed", "true");

    filtreActuel = bouton.dataset.filtre;
    afficherTaches();
});

champRecherche.addEventListener("input", afficherTaches);

listeTri.addEventListener("change", afficherTaches);

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
