import { AlyriaRaces } from "./AlyriaRace.js"; 
import { AlyriaVoies } from "./AlyriaVoies.js"; 
import { AlyriaArcanes } from "./AlyriaArcanes.js"; 

/**
 * Une boîte de dialogue personnalisée pour sélectionner la Race et la Voie lors de la création d'un Acteur Joueur.
 */
export class AlyriaCreationDialog extends Dialog {
    constructor(actor, dialogData = {}, options = {}) {
        // Passe l'acteur à la boîte de dialogue pour que nous puissions le mettre à jour
        super(dialogData, options);
        this.actor = actor;
    }

    /**
     * Définit les options par défaut pour la boîte de dialogue.
     * @returns {object}
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            // Le template HTML de la boîte de dialogue DOIT être à cet emplacement
            template: "systems/alyria/templates/sheet/creation-dialog.html", 
            classes: ["alyria-dialog", "alyria-creation"],
            width: 400,
            height: "auto",
            resizable: false,
            title: "Création de Personnage Joueur", // Titre de la fenêtre de dialogue
        });
    }

    /**
     * Prépare les données pour le template Handlebars de la boîte de dialogue.
     * @returns {object}
     */
    async getData() {
        const data = await super.getData();
        data.races = AlyriaRaces; // Fournit toutes les races disponibles
        data.voies = AlyriaVoies; // Fournit toutes les voies disponibles
        data.arcanes = AlyriaArcanes; 
        // Pré-sélectionne les valeurs actuelles si elles existent (par exemple, si la boîte de dialogue est réouverte)
        data.selectedRace = this.actor.system.race || "";
        data.selectedVoie = this.actor.system.voie || "";
        data.selectedArcanes = this.actor.system.arcanes || "";
        return data;
    }

    /**
     * Ajoute des écouteurs d'événements au HTML de la boîte de dialogue.
     * @param {jQuery} html Le contenu HTML de la boîte de dialogue
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Gère la soumission du formulaire (bouton "Créer le Personnage")
        html.find('.confirm-button').click(async (ev) => {
            ev.preventDefault();
            const form = html.find('form')[0];
            const formData = new FormData(form);
            const expandedData = foundry.utils.expandObject(Object.fromEntries(formData));

            const selectedRace = expandedData.race;
            const selectedVoie = expandedData.voie;
            const selectedArcane = expandedData.arcanes;

            // Validation simple
            if (!selectedRace) { // Race est obligatoire
                ui.notifications.warn("Veuillez sélectionner une Race.");
                return;
            }
            if (!selectedVoie) { // Voie est obligatoire
                ui.notifications.warn("Veuillez sélectionner une Voie.");
                return;
            }
            if (!selectedVoie) { // arcane est obligatoire
                ui.notifications.warn("Veuillez sélectionner une Voie.");
                return;
            }
            // Met à jour les données système de l'acteur
            await this.actor.update({
                "system.race": selectedRace,
                "system.voie": selectedVoie,
                "system.arcane": selectedArcane,
                // Les calculs des statistiques majeures et mineures seront gérés par AlyriaActor.js prepareData
            });

            this.close(); // Ferme la boîte de dialogue
            this.actor.sheet.render(true); // Ouvre la feuille de l'acteur
        });

        // Gère le clic sur le bouton "Annuler"
        html.find('.cancel-button').click(async (ev) => {
            ev.preventDefault();
            // Si l'utilisateur annule, supprime l'acteur qui vient d'être créé
            await this.actor.delete();
            this.close(); // Ferme la boîte de dialogue
        });
    }
}
