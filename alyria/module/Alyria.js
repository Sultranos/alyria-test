import AlyriaItemSheet from "./sheet/AlyriaItemSheet.js";
import AlyriaActorSheet from "./sheet/AlyriaActorSheet.js";
import AlyriaActor from "./AlyriaActor.js";
import { AlyriaCreationDialog } from "./data/AlyriaCreationDialog.js";



// Enregistre les feuilles d'acteur et d'objet du système
Hooks.once("init", async function() {
    console.log("Alyria | Initialisation du Système Alyria");

    // Définit les classes de document personnalisées
    CONFIG.Actor.documentClass = AlyriaActor;
    // CONFIG.Item.documentClass = AlyriaItem; // Si vous avez une classe Item personnalisée

    // Enregistre les feuilles d'acteur
    Actors.unregisterSheet("core", ActorSheet); // Désenregistre la feuille par défaut
    Actors.registerSheet("alyria", AlyriaActorSheet, {
        types: ["Joueur", "PNJ"], // Applique cette feuille à ces types d'acteurs
        makeDefault: true,
        label: "Alyria: Feuille d'Acteur Standard"
    });

    // Enregistre les chemins des templates pour Handlebars (important pour les Dialogues)
    // Les chemins des templates sont toujours relatifs au dossier racine du système (systems/alyria/)
    loadTemplates([
        "systems/alyria/templates/sheet/creation-dialog.html", // Le template HTML de la boîte de dialogue
        "systems/alyria/templates/sheet/Joueur-sheet.html" // Assurez-vous que ce chemin est correct
    ]);
});

// Intercepte la création d'acteur pour afficher la boîte de dialogue personnalisée pour les acteurs "Joueur"
Hooks.on("preCreateActor", async (document, data, options, userId) => {
    // Vérifie si l'acteur en cours de création est de type "Joueur"
    if (data.type === "Joueur") {
        // Empêche l'ouverture immédiate de la feuille par défaut
        options.renderSheet = false;

        // Crée une nouvelle instance de notre boîte de dialogue personnalisée
        // Passe l'acteur 'document' à la boîte de dialogue pour qu'elle puisse le modifier
        const dialog = new AlyriaCreationDialog(document, {
            title: "Création de Personnage Joueur",
            content: "" // Le contenu sera chargé depuis le template
        });

        // Ouvre la boîte de dialogue
        dialog.render(true);

        // La boîte de dialogue gère la mise à jour de l'acteur et l'ouverture de la feuille après confirmation.
        // Si la boîte de dialogue est annulée, l'acteur est supprimé dans la logique de la boîte de dialogue.
    }
});

Hooks.once("init", () => {
    console.log("Alyria | Initialisation du système Alyria");

    // Register the AlyriaItemSheet
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("alyria", AlyriaItemSheet, { makeDefault: true });

    // Register the AlyriaActorSheet
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("alyria", AlyriaActorSheet, { makeDefault: true });

    // Enregistre la classe d'acteur personnalisée pour le type "Joueur"
    CONFIG.Actor.documentClass = AlyriaActor; 
    
    CONFIG.Actor.Joueur = CONFIG.Actor.Joueur || {};
    CONFIG.Actor.Joueur.documentClass = AlyriaActor;

    console.log("Alyria | Fiches d'acteurs et d'objets enregistrées");
});
Handlebars.registerHelper('capitalize', function(value) {
        if (typeof value !== 'string') {
            return value;}
        return value.charAt(0).toUpperCase() + value.slice(1);
    })
Handlebars.registerHelper('includes', function(array, value) {
  return Array.isArray(array) && array.includes(value);
});