import { AlyriaRaces } from "../data/AlyriaRace.js";
import { AlyriaVoies } from "../data/AlyriaVoies.js";

export default class AlyriaActorSheet extends ActorSheet {
    get template() {
        console.log(`Alyria | Chargement du template de la fiche d'objet ${this.actor.type}-sheet`);
        // Assurez-vous que ce chemin est correct pour votre template de feuille d'acteur
        return `systems/alyria/templates/sheet/${this.actor.type}-sheet.html`;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Gestion de la navigation par onglets
        html.find('.sheet-navigation .item').click(ev => {
            const li = $(ev.currentTarget);
            const tab = li.data("tab"); // Récupère la valeur de data-tab

            html.find('.sheet-navigation .item').removeClass('active');
            html.find('.sheet-content .tab').removeClass('active');

            li.addClass('active');
            html.find(`.sheet-content .tab[data-tab="${tab}"]`).addClass('active');
        });

        // Gestion des lancers de dés (caractéristiques majeures et mineures)
        html.find('.rollable-dice').click(this._onRollCharacteristic.bind(this));
    
        // Gestion de la sélection des sorts
        html.find('input[name="sortsChoisis"]').on('change', ev => {
            const checked = html.find('input[name="sortsChoisis"]:checked')
            .map((i, el) => el.value).get();

            const nbMax = this.actor.system.nbSortsAChoisir;
            if (checked.length > nbMax) {
                ui.notifications.warn(`Vous ne pouvez choisir que ${nbMax} sorts.`);
                ev.target.checked = false;
            return;
            }

            this.actor.update({ "system.sortsChoisis": checked });
        });

        // Gestion des changements de ressources (PV/Psy actuels)
        html.find('input[name="system.pointsDeVie.actuels"]').on('change', this._onResourceChange.bind(this));
        html.find('input[name="system.pointsPsyque.actuels"]').on('change', this._onResourceChange.bind(this));

        // NOUVEAU : Gestion des bulles de biographie (Race et Voie)
        html.find('.biography-bubble .bubble-title').click(ev => {
            const titleElement = $(ev.currentTarget);
            const bubbleContent = titleElement.next('.bubble-content');
            const toggleIcon = titleElement.find('.toggle-icon');

            bubbleContent.toggleClass('hidden'); // Cache ou montre le contenu
            toggleIcon.toggleClass('fa-chevron-down fa-chevron-up'); // Change l'icône de la flèche
        });
    }

    // Nouvelle méthode pour gérer les changements de ressources (PV/Psy actuels)
    async _onResourceChange(event) {
        const field = event.currentTarget;
        const value = parseInt(field.value) || 0;
        const updatePath = field.name;

        // Mettre à jour l'acteur avec la nouvelle valeur
        await this.actor.update({ [updatePath]: value });
    }

    async _onRollCharacteristic(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        
        // Récupère la valeur de la caractéristique à partir de l'input associé
        // Pour les majeures, data-dice est la touche, pour les mineures c'est la valeur brute
        const targetValue = parseInt($(element).next('input').val(), 10); 
        const characteristicName = dataset.label;

        const actorData = this.actor.system;
        const toucheCritique = this.actor.system.toucheChance; // Utilise toucheChance pour la critique

        const roll = await new Roll("1d100").evaluate({async: true});
        const rollTotal = roll.total;

        let chatContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <div class="dice-formula">1d100</div>
                    <h4 class="dice-total">${rollTotal}</h4>
                    <div class="dice-tooltip">
                        <section class="tooltip-part">
                            <div class="dice">
                                <header class="part-header flexrow">
                                    <span class="part-formula">1d100</span>
                                    <span class="part-total">${rollTotal}</span>
                                </header>
                                <ol class="dice-rolls">
                                    <li class="roll die d100">${rollTotal}</li>
                                </ol>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <p><strong>Jet de ${characteristicName} :</strong> ${rollTotal} (cible: ${targetValue}%, critique à ${this.actor.system.toucheChance}%)</p>
        `;

        const echecCritiqueSeuil = 96; // Seuil pour l'échec critique

        if (rollTotal <= toucheCritique && rollTotal < targetValue) { // Réussite critique si jet <= toucheCritique ET jet <= targetValue
            chatContent += `<p style="color: green;">**SUCCÈS CRITIQUE !**</p>`;
        } else if (rollTotal >= echecCritiqueSeuil) { // Échec critique si jet >= seuil échec critique
            chatContent += `<p style="color: red;">**ÉCHEC CRITIQUE !**</p>`;
        } else if (rollTotal <= targetValue) { // Réussite normale si jet <= targetValue
            chatContent += `<p style="color: lightgreen;">**SUCCÈS !**</p>`;
        } else { // Échec normal
            chatContent += `<p style="color: orange;">**ÉCHEC !**</p>`;
        }

        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: this.actor}),
            content: chatContent,
            rolls: [roll]
        });
    }

    async getData(options) {
        const data = await super.getData(options);
        data.races = AlyriaRaces;
        data.voies = AlyriaVoies;
        data.system = this.actor.system;
        console.log("AlyriaActorSheet data:", data); 
        return data;
    }

    async _updateObject(event, formData) {
        const expanded = foundry.utils.expandObject(formData);
        console.log("FormData expanded object :", expanded);
        // Important: Mettre à jour l'objet actor avec les données développées
        await this.object.update(expanded);
    }
}

