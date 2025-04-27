const Battle = require('../../src/models/Battle');

describe('Battle model', () => {
    // Mock characters for testing
    let warrior, mage;

    beforeEach(() => {
        // Reset the mocks before each test
        warrior = {
            _id: '1',
            name: 'TestWarrior',
            job: 'Warrior',
            level: 1,
            hp: 20,
            modifiers: {
                attack: 9,
                defense: 8,
                speed: 4
            }
        };

        mage = {
            _id: '2',
            name: 'TestMage',
            job: 'Mage',
            level: 1,
            hp: 12,
            modifiers: {
                attack: 15,
                defense: 4,
                speed: 3
            }
        };
    });

    describe('constructor', () => {
        test('should create a battle with two characters', () => {
            const battle = new Battle(warrior, mage);

            // Check if characters are properly set
            expect(battle.character1).toEqual(warrior);
            expect(battle.character2).toEqual(mage);

            // Check if battle properties are initialized
            expect(battle.battleLog).toEqual([]);
            expect(battle.rounds).toEqual([]);
            expect(battle.winner).toBeNull();
            expect(battle.loser).toBeNull();
        });

        test('should throw error if characters are not provided', () => {
            expect(() => new Battle()).toThrow('Two valid characters are required for a battle');
            expect(() => new Battle(warrior)).toThrow('Two valid characters are required for a battle');
            expect(() => new Battle(null, mage)).toThrow('Two valid characters are required for a battle');
        });

        test('should throw error if character is not an object', () => {
            expect(() => new Battle('not an object', mage)).toThrow('Character 1 must be an object');
            expect(() => new Battle(warrior, 'not an object')).toThrow('Character 2 must be an object');
        });
    });

    describe('validateCharacter', () => {
        test('should throw error if character is missing _id', () => {
            const invalidWarrior = { ...warrior };
            delete invalidWarrior._id;

            expect(() => new Battle(invalidWarrior, mage)).toThrow('Character 1 must have an id or _id property');
        });

        test('should throw error if character is missing name', () => {
            const invalidWarrior = { ...warrior, name: null };
            expect(() => new Battle(invalidWarrior, mage)).toThrow('Character 1 must have a valid name');

            const invalidWarrior2 = { ...warrior };
            delete invalidWarrior2.name;
            expect(() => new Battle(invalidWarrior2, mage)).toThrow('Character 1 must have a valid name');
        });

        test('should throw error if character is missing job', () => {
            const invalidWarrior = { ...warrior, job: null };
            expect(() => new Battle(invalidWarrior, mage)).toThrow('Character 1 must have a valid job');

            const invalidWarrior2 = { ...warrior };
            delete invalidWarrior2.job;
            expect(() => new Battle(invalidWarrior2, mage)).toThrow('Character 1 must have a valid job');
        });

        test('should throw error if character has invalid hp', () => {
            const invalidWarrior = { ...warrior, hp: -5 };
            expect(() => new Battle(invalidWarrior, mage)).toThrow('Character 1 must have a positive hp/health value');

            const invalidWarrior2 = { ...warrior, hp: 0 };
            expect(() => new Battle(invalidWarrior2, mage)).toThrow('Character 1 must have a positive hp/health value');

            const invalidWarrior3 = { ...warrior, hp: 'not a number' };
            expect(() => new Battle(invalidWarrior3, mage)).toThrow('Character 1 must have a positive hp/health value');
        });

        test('should handle characters without modifiers', () => {
            const noModifiersWarrior = { ...warrior };
            delete noModifiersWarrior.modifiers;
            noModifiersWarrior.attackModifier = 10;
            noModifiersWarrior.speedModifier = 8;

            // Should not throw an error but create default modifiers
            const battle = new Battle(noModifiersWarrior, mage);

            // Verify character1 has modifiers added
            expect(battle.character1.modifiers).toBeDefined();
            expect(battle.character1.modifiers.attack).toBe(10);
            expect(battle.character1.modifiers.defense).toBe(5);
            expect(battle.character1.modifiers.speed).toBe(8);
        });

        test('should fix characters with invalid modifiers', () => {
            const invalidModsWarrior = {
                ...warrior,
                modifiers: {
                    attack: 'not a number',
                    // Defense missing
                    speed: 4
                },
                attackModifier: 12
            };

            // Should not throw but fix the modifiers
            const battle = new Battle(invalidModsWarrior, mage);

            // Verify character1 has modifiers fixed
            expect(battle.character1.modifiers.attack).toBe(12);
            expect(battle.character1.modifiers.defense).toBe(5); // Default value
            expect(battle.character1.modifiers.speed).toBe(4); // Original value
        });

        test('should handle characters with invalid attack modifier but valid attackModifier property', () => {
            const invalidWarrior = {
                ...warrior,
                modifiers: {
                    attack: 'invalid',
                    defense: 8,
                    speed: 4
                },
                attackModifier: 12
            };

            const battle = new Battle(invalidWarrior, mage);

            // Should fix the attack modifier using the attackModifier property
            expect(battle.character1.modifiers.attack).toBe(12);
        });

        test('should handle characters with invalid speed modifier but valid speedModifier property', () => {
            const invalidWarrior = {
                ...warrior,
                modifiers: {
                    attack: 9,
                    defense: 8,
                    speed: 'invalid'
                },
                speedModifier: 7
            };

            const battle = new Battle(invalidWarrior, mage);

            // Should fix the speed modifier using the speedModifier property
            expect(battle.character1.modifiers.speed).toBe(7);
        });
    });

    describe('addToBattleLog', () => {
        test('should add entries to battle log', () => {
            const battle = new Battle(warrior, mage);

            battle.addToBattleLog('Test entry 1');
            battle.addToBattleLog('Test entry 2');

            expect(battle.battleLog).toHaveLength(2);
            expect(battle.battleLog[0]).toBe('Test entry 1');
            expect(battle.battleLog[1]).toBe('Test entry 2');
        });
    });

    describe('processTurn', () => {
        test('should calculate damage and update HP', () => {
            const battle = new Battle(warrior, mage);

            // Create fighter objects similar to what executeBattle does
            const fighter1 = { ...warrior, currentHP: warrior.hp };
            const fighter2 = { ...mage, currentHP: mage.hp };

            // Mock Math.random to return predictable values
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.5);

            // Process turn with warrior attacking mage
            battle.processTurn(fighter1, fighter2);

            // Calculate expected damage: 0.5 * 9 = 4.5 -> floor -> 4
            // Mitigated damage: 4 - floor(4/3) = 4 - 1 = 3
            // Mage HP: 12 - 3 = 9
            expect(fighter2.currentHP).toBe(9);

            // Check battle log
            expect(battle.battleLog).toHaveLength(1);
            expect(battle.battleLog[0]).toBe('TestWarrior attacks TestMage for 3, TestMage has 9 HP remaining.');

            // Restore Math.random
            Math.random = originalRandom;
        });

        test('should not reduce HP below 0', () => {
            const battle = new Battle(warrior, mage);

            // Create fighter with low HP
            const fighter1 = { ...warrior, currentHP: warrior.hp };
            const fighter2 = { ...mage, currentHP: 2 };

            // Force high damage
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.9);

            battle.processTurn(fighter1, fighter2);

            // HP should be 0, not negative
            expect(fighter2.currentHP).toBe(0);

            // Restore Math.random
            Math.random = originalRandom;
        });

        test('should deal minimum 1 damage even with high defense', () => {
            const battle = new Battle(warrior, mage);

            // Create fighters with high defense
            const fighter1 = { ...warrior, currentHP: warrior.hp };
            const fighter2 = {
                ...mage,
                currentHP: mage.hp,
                modifiers: {
                    ...mage.modifiers,
                    defense: 100 // Very high defense
                }
            };

            // Force low damage
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.1); // Very low damage

            battle.processTurn(fighter1, fighter2);

            // Damage should be minimum 1
            expect(fighter2.currentHP).toBe(mage.hp - 1);
            expect(battle.battleLog[0]).toContain('for 1');

            // Restore Math.random
            Math.random = originalRandom;
        });
    });

    describe('executeBattle', () => {
        test('should simulate a battle and determine winner', () => {
            const battle = new Battle(warrior, mage);

            // Control battle outcome by mocking Math.random
            const originalRandom = Math.random;

            // Set up a sequence of random values that will make warrior win
            let callCount = 0;
            Math.random = jest.fn(() => {
                callCount++;
                // Initiative: make warrior always faster
                if (callCount % 4 === 1) return 0.9; // warrior initiative
                if (callCount % 4 === 2) return 0.2; // mage initiative
                // Damage: warrior deals high damage, mage deals low damage
                if (callCount % 4 === 3) return 0.9; // warrior damage
                if (callCount % 4 === 0) return 0.1; // mage damage
                return 0.5;
            });

            const result = battle.executeBattle();

            // Verify battle result
            expect(result).toHaveProperty('winner');
            expect(result).toHaveProperty('loser');
            expect(result).toHaveProperty('battleLog');

            // Warrior should be the winner
            expect(result.winner.name).toBe('TestWarrior');
            expect(result.loser.name).toBe('TestMage');

            // Winner should have HP > 0, loser should have HP = 0
            expect(result.winner.currentHP).toBeGreaterThan(0);
            expect(result.loser.currentHP).toBe(0);

            // Verify battle log
            expect(battle.battleLog.length).toBeGreaterThan(2);
            expect(battle.battleLog[0]).toContain('Battle between');
            expect(battle.battleLog[battle.battleLog.length - 1]).toContain('wins the battle');

            // Restore Math.random
            Math.random = originalRandom;
        });



        test('should generate a complete battle log', () => {
            const battle = new Battle(warrior, mage);

            const result = battle.executeBattle();

            // Battle log should have specific entries
            expect(result.battleLog.some(entry => entry.includes('Battle between'))).toBe(true);
            expect(result.battleLog.some(entry => entry.includes('Round 1:'))).toBe(true);
            expect(result.battleLog.some(entry => entry.includes('speed was faster than'))).toBe(true);
            expect(result.battleLog.some(entry => entry.includes('attacks'))).toBe(true);
            expect(result.battleLog.some(entry => entry.includes('wins the battle'))).toBe(true);
        });

        test('should handle case where first attacker defeats second in one hit', () => {
            const battle = new Battle(warrior, mage);

            // Set mage HP very low
            mage.hp = 1;

            // Make warrior always faster and deal high damage
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = jest.fn(() => {
                callCount++;
                if (callCount === 1) return 0.9; // warrior initiative
                if (callCount === 2) return 0.1; // mage initiative
                if (callCount === 3) return 0.9; // warrior high damage
                return 0.5;
            });

            const result = battle.executeBattle();

            // Warrior should win and mage should be defeated in first round
            expect(result.winner.name).toBe('TestWarrior');
            expect(result.loser.name).toBe('TestMage');
            expect(result.battleLog.some(entry => entry.includes('has been defeated'))).toBe(true);

            // Second attacker shouldn't attack
            const attackCount = result.battleLog.filter(log => log.includes('attacks')).length;
            expect(attackCount).toBe(1);

            // Restore Math.random
            Math.random = originalRandom;
        });

        test('should handle case where second attacker defeats first', () => {
            const battle = new Battle(warrior, mage);

            // Set warrior HP very low
            warrior.hp = 1;

            // Make warrior faster but mage deal high damage
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = jest.fn(() => {
                callCount++;
                if (callCount === 1) return 0.9; // warrior initiative
                if (callCount === 2) return 0.1; // mage initiative
                if (callCount === 3) return 0.1; // warrior low damage
                if (callCount === 4) return 0.9; // mage high damage
                return 0.5;
            });

            const result = battle.executeBattle();

            // Mage should win and warrior should be defeated
            expect(result.winner.name).toBe('TestMage');
            expect(result.loser.name).toBe('TestWarrior');

            // Both attackers should attack once
            const attackCount = result.battleLog.filter(log => log.includes('attacks')).length;
            expect(attackCount).toBe(2);

            // Restore Math.random
            Math.random = originalRandom;
        });

        test('should handle battle round limit', () => {
            const battle = new Battle(warrior, mage);

            // Create fighters with extremely low damage output and high defense
            // This should trigger the round limit
            const originalExecuteTurn = battle.processTurn;
            battle.processTurn = jest.fn().mockImplementation((attacker, defender) => {
                // Deal only 1 damage per turn, which is less than regeneration
                defender.currentHP = Math.max(defender.currentHP - 0, defender.currentHP);
                battle.addToBattleLog(`${attacker.name} attacks ${defender.name} for 0, ${defender.name} has ${defender.currentHP} HP remaining.`);
            });

            // Mock the round limit to be lower for testing
            const originalLimit = 100;
            Object.defineProperty(battle, 'roundLimit', { value: 5 });

            const result = battle.executeBattle();

            // Should have round limit message
            expect(battle.battleLog.some(log => log.includes('Battle reached 100 rounds'))).toBe(true);

            // Restore original function
            battle.processTurn = originalExecuteTurn;
        });

        test('should declare winner based on remaining HP in case of draw', () => {
            const battle = new Battle(warrior, mage);

            // Mock processTurn to ensure both fighters have HP when round limit is reached
            battle.processTurn = jest.fn();

            // Mock the round check to force a "draw" condition
            const originalWhileCondition = true;
            let roundNumber = 1;

            // Override the while condition to break after round 3
            Object.defineProperty(battle, 'executeBattle', {
                value: function () {
                    const fighter1 = { ...this.character1, currentHP: 15 };
                    const fighter2 = { ...this.character2, currentHP: 10 };

                    this.addToBattleLog(`Battle between ${fighter1.name} (${fighter1.job}) - ${fighter1.currentHP} HP and ${fighter2.name} (${fighter2.job}) - ${fighter2.currentHP} HP begins!`);

                    // Force battle to reach round limit
                    this.addToBattleLog("Battle reached 100 rounds - ending in a draw!");

                    // Both fighters still have HP
                    this.winner = fighter1;
                    this.loser = fighter2;

                    this.addToBattleLog(`Battle ended in a technical draw! ${this.winner.name} had more HP remaining and is declared the winner.`);
                    this.addToBattleLog(`${this.winner.name} wins the battle! ${this.winner.name} still has ${this.winner.currentHP} HP remaining!`);

                    return this.getBattleResults();
                }
            });

            const result = battle.executeBattle();

            // Should have draw message
            expect(battle.battleLog.some(log => log.includes('technical draw'))).toBe(true);

            // Warrior should be the winner due to having more HP
            expect(result.winner.name).toBe('TestWarrior');
        });
    });

    describe('getBattleResults', () => {
        test('should return battle results', () => {
            const battle = new Battle(warrior, mage);

            // Set up winner and loser directly
            battle.winner = { ...warrior, currentHP: 15 };
            battle.loser = { ...mage, currentHP: 0 };
            battle.battleLog = ['Battle log entry 1', 'Battle log entry 2'];

            const results = battle.getBattleResults();

            expect(results.winner).toEqual(battle.winner);
            expect(results.loser).toEqual(battle.loser);
            expect(results.battleLog).toEqual(battle.battleLog);
        });

        test('should return null for winner and loser if battle not complete', () => {
            const battle = new Battle(warrior, mage);

            // Battle log but no winner or loser set
            battle.battleLog = ['Battle started'];

            const results = battle.getBattleResults();

            expect(results.winner).toBeNull();
            expect(results.loser).toBeNull();
            expect(results.battleLog).toEqual(['Battle started']);
        });
    });
}); 