const taches = [
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
    btnSuppr.addEventListener("click", () => {
        supprimerTache(tache.id);
    });

    li.append(spanTexte, btnSuppr);
    return li;
}

function afficherTaches() {
    liste.innerHTML = "";
    taches.forEach((tache) => {
        liste.append(creerElementTache(tache));
    });
    mettreAJourCompteur();
}

function supprimerTache(id) {
    const index = taches.findIndex((tache) => tache.id === id)
    if (index >= 0) {
        taches.splice(index, 1);
    }
    afficherTaches();
}

function mettreAJourCompteur() {
    const terminees = taches.filter((tache) => tache.terminee).length;
    const enCours = taches.length - terminees;
    compteur.textContent = `${terminees} terminée(s), ${enCours} en cours`;
}

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
