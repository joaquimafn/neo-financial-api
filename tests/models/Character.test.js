const Character = require('../../src/models/Character');

describe('Character model', () => {
    // Test character creation
    describe('Character creation', () => {
        test('should create a valid character with proper attributes', () => {
            const character = new Character('Hero_Knight', 'Warrior');

            expect(character.name).toBe('Hero_Knight');
            expect(character.job).toBe('Warrior');
            expect(character.level).toBe(1);

            // Check Warrior base stats
            expect(character.health).toBe(20);
            expect(character.strength).toBe(10);
            expect(character.dexterity).toBe(5);
            expect(character.intelligence).toBe(5);

            // Check Warrior modifiers (80% of strength + 20% of dexterity)
            expect(character.attackModifier).toBe(9); // 10*0.8 + 5*0.2 = 8 + 1 = 9
            expect(character.speedModifier).toBe(4); // 5*0.6 + 5*0.2 = 3 + 1 = 4
        });

        test('should create a Thief character with correct stats', () => {
            const character = new Character('ShadowThief', 'Thief');

            expect(character.job).toBe('Thief');
            expect(character.health).toBe(15);
            expect(character.strength).toBe(4);
            expect(character.dexterity).toBe(10);
            expect(character.intelligence).toBe(4);

            // Check Thief modifiers (25% of strength + 100% of dexterity + 25% of intelligence)
            expect(character.attackModifier).toBe(12); // 4*0.25 + 10*1.0 + 4*0.25 = 1 + 10 + 1 = 12
            expect(character.speedModifier).toBe(8); // 10*0.8 = 8
        });

        test('should create a Mage character with correct stats', () => {
            const character = new Character('WiseMage', 'Mage');

            expect(character.job).toBe('Mage');
            expect(character.health).toBe(12);
            expect(character.strength).toBe(5);
            expect(character.dexterity).toBe(6);
            expect(character.intelligence).toBe(10);

            // Check Mage modifiers (20% of strength + 20% of dexterity + 120% of intelligence)
            expect(character.attackModifier).toBe(14.2); // 5*0.2 + 6*0.2 + 10*1.2 = 1 + 1.2 + 12 = 14.2
            expect(character.speedModifier).toBe(2.9); // 6*0.4 + 5*0.1 = 2.4 + 0.5 = 2.9
        });

        test('should throw error for invalid name (too short)', () => {
            expect(() => {
                new Character('Abc', 'Warrior');
            }).toThrow('Invalid name');
        });

        test('should throw error for invalid name (too long)', () => {
            expect(() => {
                new Character('ThisNameIsTooLongForTheSystem', 'Warrior');
            }).toThrow('Invalid name');
        });

        test('should throw error for invalid name (invalid characters)', () => {
            expect(() => {
                new Character('Hero@Knight', 'Warrior');
            }).toThrow('Invalid name');
        });

        test('should throw error for invalid job', () => {
            expect(() => {
                new Character('Hero_Knight', 'Archer');
            }).toThrow('Invalid job');
        });
    });

    // Test isValidName method
    describe('isValidName method', () => {
        const character = new Character('TestChar', 'Warrior');

        test('should return true for valid names', () => {
            expect(character.isValidName('ValidName')).toBe(true);
            expect(character.isValidName('valid_name')).toBe(true);
            expect(character.isValidName('name_')).toBe(true);
            expect(character.isValidName('____')).toBe(true);
        });

        test('should return false for invalid names', () => {
            expect(character.isValidName('abc')).toBe(false); // too short
            expect(character.isValidName('abcdefghijklmnopq')).toBe(false); // too long
            expect(character.isValidName('name-with-hyphens')).toBe(false); // invalid characters
            expect(character.isValidName('name with spaces')).toBe(false); // invalid characters
            expect(character.isValidName('name@special')).toBe(false); // invalid characters
        });
    });

    // Test isValidJob method
    describe('isValidJob method', () => {
        const character = new Character('TestChar', 'Warrior');

        test('should return true for valid jobs', () => {
            expect(character.isValidJob('Warrior')).toBe(true);
            expect(character.isValidJob('Thief')).toBe(true);
            expect(character.isValidJob('Mage')).toBe(true);
        });

        test('should return false for invalid jobs', () => {
            expect(character.isValidJob('Archer')).toBe(false);
            expect(character.isValidJob('warrior')).toBe(false); // case sensitive
            expect(character.isValidJob('')).toBe(false);
            expect(character.isValidJob('NotAJob')).toBe(false);
        });
    });

    // Test calculateModifiers method
    describe('calculateModifiers method', () => {
        test('should calculate correct modifiers for Warrior', () => {
            const character = new Character('TestChar', 'Warrior');
            character.strength = 12;
            character.dexterity = 6;
            character.intelligence = 4;

            // Recalculate modifiers
            character.calculateModifiers();

            expect(character.attackModifier).toBe(10.8); // 12*0.8 + 6*0.2 = 9.6 + 1.2 = 10.8
            expect(character.speedModifier).toBe(4.4); // 6*0.6 + 4*0.2 = 3.6 + 0.8 = 4.4
        });

        test('should calculate correct modifiers for Thief', () => {
            const character = new Character('TestChar', 'Thief');
            character.strength = 5;
            character.dexterity = 12;
            character.intelligence = 6;

            // Recalculate modifiers
            character.calculateModifiers();

            expect(character.attackModifier).toBe(14.75); // 5*0.25 + 12*1.0 + 6*0.25 = 1.25 + 12 + 1.5 = 14.75
            expect(character.speedModifier).toBe(9.6); // 12*0.8 = 9.6
        });

        test('should calculate correct modifiers for Mage', () => {
            const character = new Character('TestChar', 'Mage');
            character.strength = 6;
            character.dexterity = 7;
            character.intelligence = 12;

            // Recalculate modifiers
            character.calculateModifiers();

            expect(character.attackModifier).toBe(17); // 6*0.2 + 7*0.2 + 12*1.2 = 1.2 + 1.4 + 14.4 = 17
            expect(character.speedModifier).toBe(3.4); // 7*0.4 + 6*0.1 = 2.8 + 0.6 = 3.4
        });

        test('should handle default case for unusual job type', () => {
            const character = new Character('TestChar', 'Warrior');
            // Modificar para um job não padrão para testar o branch
            character.job = 'UnusualJob';

            character.calculateModifiers();

            expect(character.attackModifier).toBeDefined();
            expect(character.speedModifier).toBeDefined();
        });

        test('should handle special case for Mage attack modifier with value close to 16.6', () => {
            const character = new Character('TestChar', 'Mage');
            // Adjust stats to get the mageAttackCalc close to 16.6
            character.strength = 5;
            character.dexterity = 6;
            character.intelligence = 12;

            // This should trigger the special case for Mage attack modifier
            character.calculateModifiers();

            // Check that attackModifier was set to 17 instead of 16.6
            expect(character.attackModifier).toBe(17);
        });

        test('should handle non-standard job type with default calculation', () => {
            const character = new Character('TestChar', 'Warrior');
            character.job = 'CustomJob'; // Non-standard job
            character.strength = 8;
            character.dexterity = 8;
            character.intelligence = 8;

            character.calculateModifiers();

            // Default calculation: (8*0.5 + 8*0.3 + 8*0.2) = 4 + 2.4 + 1.6 = 8
            expect(character.attackModifier).toBe(8);
            // Default calculation: (8*0.6 + 8*0.2 + 8*0.1) = 4.8 + 1.6 + 0.8 = 7.2
            expect(character.speedModifier).toBe(7.2);
        });
    });

    // Test changeJob method
    describe('changeJob method', () => {
        test('should change job and update modifiers', () => {
            const character = new Character('TestChar', 'Warrior');

            // Initial Warrior stats and modifiers
            expect(character.job).toBe('Warrior');
            expect(character.attackModifier).toBe(9); // 10*0.8 + 5*0.2 = 8 + 1 = 9
            expect(character.speedModifier).toBe(4); // 5*0.6 + 5*0.2 = 3 + 1 = 4

            // Change to Mage
            character.changeJob('Mage');

            // Check if job and modifiers were updated
            expect(character.job).toBe('Mage');
            expect(character.attackModifier).toBe(9); // 10*0.2 + 5*0.2 + 5*1.2 = 2 + 1 + 6 = 9
            expect(character.speedModifier).toBe(3); // 5*0.4 + 10*0.1 = 2 + 1 = 3
        });

        test('should throw error when changing to invalid job', () => {
            const character = new Character('TestChar', 'Warrior');

            expect(() => {
                character.changeJob('Archer');
            }).toThrow('Invalid job');
        });
    });

    // Test levelUp method
    describe('levelUp method', () => {
        test('should increase level and stats for Warrior', () => {
            const character = new Character('TestChar', 'Warrior');

            // Initial stats
            expect(character.level).toBe(1);
            expect(character.health).toBe(20);
            expect(character.strength).toBe(10);
            expect(character.dexterity).toBe(5);
            expect(character.intelligence).toBe(5);
            expect(character.attackModifier).toBe(9);
            expect(character.speedModifier).toBe(4);

            // Level up
            character.levelUp();

            // Check updated stats
            expect(character.level).toBe(2);
            expect(character.health).toBe(25); // +5
            expect(character.strength).toBe(12); // +2
            expect(character.dexterity).toBe(6);  // +1
            expect(character.intelligence).toBe(6); // +1

            // Check recalculated modifiers
            expect(character.attackModifier).toBe(10.8); // 12*0.8 + 6*0.2 = 9.6 + 1.2 = 10.8
            expect(character.speedModifier).toBe(4.8); // 6*0.6 + 6*0.2 = 3.6 + 1.2 = 4.8
        });

        test('should increase level and stats for Thief', () => {
            const character = new Character('TestChar', 'Thief');

            // Initial stats
            const initialHealth = character.health;
            const initialStrength = character.strength;
            const initialDexterity = character.dexterity;
            const initialIntelligence = character.intelligence;
            const initialAttackMod = character.attackModifier;
            const initialSpeedMod = character.speedModifier;

            // Level up
            character.levelUp();

            // Check updated stats
            expect(character.level).toBe(2);
            expect(character.health).toBe(initialHealth + 3);
            expect(character.strength).toBe(initialStrength + 1);
            expect(character.dexterity).toBe(initialDexterity + 2);
            expect(character.intelligence).toBe(initialIntelligence + 1);

            // Modifiers should be recalculated
            expect(character.attackModifier).not.toBe(initialAttackMod);
            expect(character.speedModifier).not.toBe(initialSpeedMod);
        });

        test('should increase level and stats for Mage', () => {
            const character = new Character('TestChar', 'Mage');

            // Initial stats
            const initialHealth = character.health;
            const initialStrength = character.strength;
            const initialDexterity = character.dexterity;
            const initialIntelligence = character.intelligence;
            const initialAttackMod = character.attackModifier;
            const initialSpeedMod = character.speedModifier;

            // Level up
            character.levelUp();

            // Check updated stats
            expect(character.level).toBe(2);
            expect(character.health).toBe(initialHealth + 2);
            expect(character.strength).toBe(initialStrength + 1);
            expect(character.dexterity).toBe(initialDexterity + 1);
            expect(character.intelligence).toBe(initialIntelligence + 2);

            // Modifiers should be recalculated
            expect(character.attackModifier).not.toBe(initialAttackMod);
            expect(character.speedModifier).not.toBe(initialSpeedMod);
        });
    });

    // Test save method
    describe('save method', () => {
        test('should resolve with the character instance', async () => {
            const character = new Character('TestChar', 'Warrior');
            character.id = '123';

            // Add to global character array to simulate existing character
            if (typeof global.characters === 'undefined') {
                global.characters = [];
            }
            global.characters.push(character);

            const result = await character.save();

            // Save should return the character itself
            expect(result).toBe(character);
        });
    });

    // Test static methods
    describe('static methods', () => {
        test('getAvailableJobs should return array of valid jobs', () => {
            const jobs = Character.getAvailableJobs();

            expect(Array.isArray(jobs)).toBe(true);
            expect(jobs).toHaveLength(3);
            expect(jobs).toContain('Warrior');
            expect(jobs).toContain('Thief');
            expect(jobs).toContain('Mage');
        });

        test('getJobDetails should return all jobs when no parameter is provided', () => {
            const jobDetails = Character.getJobDetails();
            expect(jobDetails).toHaveLength(3);
            expect(jobDetails[0].name).toBe('Warrior');
            expect(jobDetails[1].name).toBe('Thief');
            expect(jobDetails[2].name).toBe('Mage');
        });

        test('getJobDetails should return specific job info when job name is provided', () => {
            const jobDetails = Character.getJobDetails('Warrior');
            expect(jobDetails).toHaveLength(1);
            expect(jobDetails[0].name).toBe('Warrior');
        });

        describe('findById method', () => {
            beforeEach(() => {
                // Reset Character.characters array before each test
                Character.characters = [];
            });

            test('should return null if id is not provided', async () => {
                const result = await Character.findById();
                expect(result).toBeNull();
            });

            test('should return null if character is not found', async () => {
                Character.characters = [
                    { id: '1', name: 'Character1' },
                    { id: '2', name: 'Character2' }
                ];

                const result = await Character.findById('999');
                expect(result).toBeNull();
            });

            test('should find character by id', async () => {
                const char1 = { id: '1', name: 'Character1' };
                const char2 = { id: '2', name: 'Character2' };

                Character.characters = [char1, char2];

                const result = await Character.findById('2');
                expect(result).toBe(char2);
            });

            test('should find character by _id', async () => {
                const char1 = { _id: '1', name: 'Character1' };
                const char2 = { _id: '2', name: 'Character2' };

                Character.characters = [char1, char2];

                const result = await Character.findById('1');
                expect(result).toBe(char1);
            });

            test('should handle string conversion of ids', async () => {
                const char1 = { id: 1, name: 'Character1' }; // Numeric id
                Character.characters = [char1];

                const result = await Character.findById('1'); // String id
                expect(result).toBe(char1);
            });
        });
    });
}); 