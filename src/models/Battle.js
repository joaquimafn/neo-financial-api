/**
 * Battle model for handling RPG character battles
 */
class Battle {
    /**
     * Create a new battle between two characters
     * @param {Object} character1 - First character in the battle
     * @param {Object} character2 - Second character in the battle
     * @throws {Error} If characters are invalid or missing required properties
     */
    constructor(character1, character2) {
        // Validate input
        if (!character1 || !character2) {
            throw new Error('Two valid characters are required for a battle');
        }

        // Validate character properties
        this.validateCharacter(character1, 'Character 1');
        this.validateCharacter(character2, 'Character 2');

        this.character1 = character1;
        this.character2 = character2;
        this.battleLog = [];
        this.rounds = [];
        this.winner = null;
        this.loser = null;
    }

    /**
     * Validate character has required properties
     * @param {Object} character - Character to validate
     * @param {string} label - Label for error messages
     * @throws {Error} If character is missing required properties
     */
    validateCharacter(character, label) {
        if (typeof character !== 'object') {
            throw new Error(`${label} must be an object`);
        }

        // Check for _id or id property (MongoDB models may use either)
        if (!character._id && !character.id) {
            throw new Error(`${label} must have an id or _id property`);
        }

        if (!character.name || typeof character.name !== 'string') {
            throw new Error(`${label} must have a valid name`);
        }

        if (!character.job || typeof character.job !== 'string') {
            throw new Error(`${label} must have a valid job`);
        }

        // Check for hp property (could be hp or health depending on implementation)
        const healthValue = character.hp || character.health;
        if (typeof healthValue !== 'number' || healthValue <= 0) {
            throw new Error(`${label} must have a positive hp/health value`);
        }

        // Ensure the character has modifiers or create them
        if (!character.modifiers) {
            // If no modifiers object exists, create one with default values
            character.modifiers = {
                attack: character.attackModifier || 5, // Use attackModifier or default
                defense: 5, // Default defense 
                speed: character.speedModifier || 5 // Use speedModifier or default
            };
        } else {
            // Ensure all required modifiers exist
            const requiredModifiers = ['attack', 'defense', 'speed'];
            for (const modifier of requiredModifiers) {
                if (typeof character.modifiers[modifier] !== 'number') {
                    // If a modifier is missing, set a default value
                    if (modifier === 'attack' && character.attackModifier) {
                        character.modifiers.attack = character.attackModifier;
                    } else if (modifier === 'speed' && character.speedModifier) {
                        character.modifiers.speed = character.speedModifier;
                    } else {
                        character.modifiers[modifier] = 5; // Default value
                    }
                }
            }
        }
    }

    /**
     * Add an entry to the battle log
     * @param {string} entry - Log entry to add
     */
    addToBattleLog(entry) {
        this.battleLog.push(entry);
    }

    /**
     * Execute the battle between characters
     * @returns {Object} Battle results
     */
    executeBattle() {
        // Initialize starting HP (clone to avoid changing the original)
        const fighter1 = {
            ...this.character1,
            _id: this.character1._id || this.character1.id,
            currentHP: this.character1.hp || this.character1.health
        };

        const fighter2 = {
            ...this.character2,
            _id: this.character2._id || this.character2.id,
            currentHP: this.character2.hp || this.character2.health
        };

        // Add battle start to log
        this.addToBattleLog(`Battle between ${fighter1.name} (${fighter1.job}) - ${fighter1.currentHP} HP and ${fighter2.name} (${fighter2.job}) - ${fighter2.currentHP} HP begins!`);

        let roundNumber = 1;

        // Battle continues until one character has no HP
        while (fighter1.currentHP > 0 && fighter2.currentHP > 0) {
            // Add round header to log
            this.addToBattleLog(`Round ${roundNumber}:`);

            // Determine initiative (who attacks first this round)
            const fighter1Initiative = Math.random() * fighter1.modifiers.speed;
            const fighter2Initiative = Math.random() * fighter2.modifiers.speed;

            let firstAttacker, secondAttacker;

            if (fighter1Initiative >= fighter2Initiative) {
                firstAttacker = fighter1;
                secondAttacker = fighter2;
                this.addToBattleLog(`${fighter1.name} ${fighter1Initiative.toFixed(1)} speed was faster than ${fighter2.name} ${fighter2Initiative.toFixed(1)} speed and will begin this round.`);
            } else {
                firstAttacker = fighter2;
                secondAttacker = fighter1;
                this.addToBattleLog(`${fighter2.name} ${fighter2Initiative.toFixed(1)} speed was faster than ${fighter1.name} ${fighter1Initiative.toFixed(1)} speed and will begin this round.`);
            }

            // First attack
            this.processTurn(firstAttacker, secondAttacker);

            // Check if second attacker is still alive
            if (secondAttacker.currentHP <= 0) {
                this.addToBattleLog(`${secondAttacker.name} has been defeated!`);
                break;
            }

            // Second attack
            this.processTurn(secondAttacker, firstAttacker);

            // Check if first attacker is still alive
            if (firstAttacker.currentHP <= 0) {
                this.addToBattleLog(`${firstAttacker.name} has been defeated!`);
                break;
            }

            // Safety check - limit rounds to prevent infinite loops
            if (roundNumber >= 100) {
                this.addToBattleLog("Battle reached 100 rounds - ending in a draw!");
                break;
            }

            roundNumber++;
        }

        // Determine winner and loser
        if (fighter1.currentHP > 0 && fighter2.currentHP > 0) {
            // Draw (should only happen if round limit is reached)
            this.winner = fighter1.currentHP >= fighter2.currentHP ? fighter1 : fighter2;
            this.loser = this.winner === fighter1 ? fighter2 : fighter1;
            this.addToBattleLog(`Battle ended in a technical draw! ${this.winner.name} had more HP remaining and is declared the winner.`);
        } else if (fighter1.currentHP > 0) {
            this.winner = fighter1;
            this.loser = fighter2;
        } else {
            this.winner = fighter2;
            this.loser = fighter1;
        }

        // Add battle end to log
        this.addToBattleLog(`${this.winner.name} wins the battle! ${this.winner.name} still has ${this.winner.currentHP} HP remaining!`);

        return this.getBattleResults();
    }

    /**
     * Process a single turn in battle
     * @param {Object} attacker - Character performing the attack
     * @param {Object} defender - Character defending against the attack
     */
    processTurn(attacker, defender) {
        // Calculate raw damage (random value from 0 to attack modifier)
        const rawDamage = Math.floor(Math.random() * attacker.modifiers.attack);

        // Calculate mitigated damage (defense reduces damage)
        const mitigatedDamage = Math.max(1, rawDamage - Math.floor(defender.modifiers.defense / 3));

        // Update defender's HP
        defender.currentHP = Math.max(0, defender.currentHP - mitigatedDamage);

        // Log the attack
        this.addToBattleLog(`${attacker.name} attacks ${defender.name} for ${mitigatedDamage}, ${defender.name} has ${defender.currentHP} HP remaining.`);
    }

    /**
     * Get the battle results
     * @returns {Object} Battle results
     */
    getBattleResults() {
        return {
            winner: this.winner,
            loser: this.loser,
            battleLog: this.battleLog
        };
    }
}

module.exports = Battle; 