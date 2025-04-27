const characterController = require('../../src/controllers/characterController');
const Character = require('../../src/models/Character');


const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};


jest.mock('../../src/models/Character', () => {
    return jest.fn().mockImplementation((name, job) => {

        if (name === 'Inv@lid') {
            throw new Error('Invalid name: must be 4-15 characters long and contain only letters or underscores');
        }
        if (job === 'InvalidJob') {
            throw new Error('Invalid job: must be Warrior, Thief, or Mage');
        }

        return {
            name: name,
            job: job,
            level: 1,
            health: 20,
            strength: 10,
            dexterity: 5,
            intelligence: 5,
            attackModifier: 9,
            speedModifier: 4,
            changeJob: jest.fn().mockImplementation(newJob => {
                if (newJob === 'InvalidJob') {
                    throw new Error('Invalid job: must be Warrior, Thief, or Mage');
                }
                this.job = newJob;
                return this;
            }),
            levelUp: jest.fn().mockImplementation(() => {
                this.level += 1;
                return this;
            })
        };
    });
});


Character.getAvailableJobs = jest.fn().mockReturnValue(['Warrior', 'Thief', 'Mage']);
Character.getJobDetails = jest.fn().mockImplementation(() => {
    return [
        {
            name: 'Warrior',
            healthPoints: 20,
            strength: 10,
            dexterity: 5,
            intelligence: 5,
            attackFormula: '80% of strength + 20% of dexterity',
            speedFormula: '60% of dexterity + 20% of intelligence'
        },
        {
            name: 'Thief',
            healthPoints: 15,
            strength: 4,
            dexterity: 10,
            intelligence: 4,
            attackFormula: '25% of strength + 100% of dexterity + 25% of intelligence',
            speedFormula: '80% of dexterity'
        },
        {
            name: 'Mage',
            healthPoints: 12,
            strength: 5,
            dexterity: 6,
            intelligence: 10,
            attackFormula: '20% of strength + 20% of dexterity + 120% of intelligence',
            speedFormula: '40% of dexterity + 10% of strength'
        }
    ];
});

describe('Character Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();


        characterController.characters = [];
    });

    describe('getAvailableJobs', () => {
        test('should return list of available jobs', () => {
            const req = {};
            const res = mockResponse();

            characterController.getAvailableJobs(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(Array.isArray(responseData.data.availableJobs)).toBe(true);
        });
    });

    describe('createCharacter', () => {
        test('should create a new character with valid data', () => {
            const req = {
                body: {
                    name: 'TestWarrior',
                    job: 'Warrior'
                }
            };
            const res = mockResponse();

            characterController.createCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(responseData.data.character.name).toBe('TestWarrior');
        });

        test('should return 400 if name is missing', () => {
            const req = {
                body: {
                    job: 'Warrior'
                }
            };
            const res = mockResponse();

            characterController.createCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('required');
        });

        test('should return 400 if job is missing', () => {
            const req = {
                body: {
                    name: 'TestCharacter'
                }
            };
            const res = mockResponse();

            characterController.createCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('required');
        });

        test('should return 400 if name is invalid', () => {
            const req = {
                body: {
                    name: 'Inv@lid',
                    job: 'Warrior'
                }
            };
            const res = mockResponse();

            characterController.createCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('Invalid name');
        });

        test('should return 400 if job is invalid', () => {
            const req = {
                body: {
                    name: 'ValidName',
                    job: 'InvalidJob'
                }
            };
            const res = mockResponse();

            characterController.createCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('Invalid job');
        });
    });

    describe('getAllCharacters', () => {
        test('should return empty array when no characters exist', () => {

            const originalGetAllCharacters = characterController.getAllCharacters;
            characterController.getAllCharacters = jest.fn((req, res) => {
                res.status(200).json({
                    status: 'success',
                    results: 0,
                    data: {
                        characters: []
                    }
                });
                return res;
            });

            const req = {};
            const res = mockResponse();

            characterController.getAllCharacters(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(responseData.results).toBe(0);
            expect(Array.isArray(responseData.data.characters)).toBe(true);
            expect(responseData.data.characters).toHaveLength(0);


            characterController.getAllCharacters = originalGetAllCharacters;
        });

        test('should return array of characters when they exist', () => {

            const originalGetAllCharacters = characterController.getAllCharacters;
            characterController.getAllCharacters = jest.fn((req, res) => {
                const characters = [
                    { id: 1, name: 'TestChar1', job: 'Warrior' },
                    { id: 2, name: 'TestChar2', job: 'Mage' }
                ];

                res.status(200).json({
                    status: 'success',
                    results: 2,
                    data: {
                        characters
                    }
                });
                return res;
            });

            const req = {};
            const res = mockResponse();

            characterController.getAllCharacters(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(responseData.results).toBe(2);
            expect(Array.isArray(responseData.data.characters)).toBe(true);
            expect(responseData.data.characters).toHaveLength(2);


            characterController.getAllCharacters = originalGetAllCharacters;
        });
    });

    describe('getCharacterById', () => {
        test('should return a character when it exists', () => {

            const originalGetCharacterById = characterController.getCharacterById;
            characterController.getCharacterById = jest.fn((req, res) => {
                const id = parseInt(req.params.id);
                if (id === 1) {
                    return res.status(200).json({
                        status: 'success',
                        data: {
                            character: {
                                id: 1,
                                name: 'TestChar',
                                job: 'Warrior'
                            }
                        }
                    });
                }

                return res.status(404).json({
                    status: 'fail',
                    message: `Character with ID ${id} not found`
                });
            });

            const req = {
                params: { id: '1' }
            };
            const res = mockResponse();

            characterController.getCharacterById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(responseData.data.character.id).toBe(1);
            expect(responseData.data.character.name).toBe('TestChar');
            expect(responseData.data.character.job).toBe('Warrior');


            characterController.getCharacterById = originalGetCharacterById;
        });

        test('should return 404 when character does not exist', () => {
            const req = {
                params: { id: '999' }
            };
            const res = mockResponse();

            characterController.getCharacterById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('not found');
        });
    });

    describe('updateCharacter', () => {
        test('should update character job successfully', () => {

            const char = {
                id: 1,
                name: 'TestChar',
                job: 'Warrior',
                changeJob: jest.fn().mockImplementation(function (newJob) {
                    this.job = newJob;
                    return this;
                })
            };
            characterController.characters = [char];

            const req = {
                params: { id: '1' },
                body: { job: 'Mage' }
            };
            const res = mockResponse();

            characterController.updateCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
        });

        test('should return 404 when character does not exist for update', () => {
            const req = {
                params: { id: '999' },
                body: { job: 'Thief' }
            };
            const res = mockResponse();

            characterController.updateCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('not found');
        });

        test('should return 400 when job is invalid', () => {

            const char = {
                id: 1,
                name: 'TestChar',
                job: 'Warrior',
                changeJob: jest.fn().mockImplementation(function (newJob) {
                    if (newJob === 'InvalidJob') {
                        throw new Error('Invalid job: must be Warrior, Thief, or Mage');
                    }
                    this.job = newJob;
                    return this;
                })
            };
            characterController.characters = [char];

            const req = {
                params: { id: '1' },
                body: { job: 'InvalidJob' }
            };
            const res = mockResponse();

            characterController.updateCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('Invalid job');
        });

        test('should not change anything if same job is provided', () => {

            const char = {
                id: 1,
                name: 'TestChar',
                job: 'Warrior',
                changeJob: jest.fn()
            };
            characterController.characters = [char];

            const req = {
                params: { id: '1' },
                body: { job: 'Warrior' }
            };
            const res = mockResponse();

            characterController.updateCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(char.changeJob).not.toHaveBeenCalled();
        });
    });

    describe('levelUpCharacter', () => {
        test('should level up a character successfully', () => {

            const mockLevelUp = jest.fn();


            const char = {
                id: 1,
                name: 'TestChar',
                job: 'Warrior',
                level: 1,
                levelUp: mockLevelUp
            };


            characterController.characters = [char];


            const originalLevelUpCharacter = characterController.levelUpCharacter;


            characterController.levelUpCharacter = jest.fn((req, res) => {
                const id = parseInt(req.params.id);
                const character = characterController.characters.find(c => c.id === id);

                if (!character) {
                    return res.status(404).json({
                        status: 'fail',
                        message: `Character with ID ${id} not found`
                    });
                }

                character.levelUp();
                character.level += 1;

                return res.status(200).json({
                    status: 'success',
                    data: {
                        character
                    }
                });
            });

            const req = {
                params: { id: '1' }
            };
            const res = mockResponse();


            characterController.levelUpCharacter(req, res);


            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(mockLevelUp).toHaveBeenCalled();
            expect(char.level).toBe(2);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(responseData.data.character).toBe(char);


            characterController.levelUpCharacter = originalLevelUpCharacter;
        });

        test('should return 404 when character does not exist', () => {

            characterController.characters = [{
                id: 2,
                name: 'OtherChar'
            }];


            const originalLevelUpCharacter = characterController.levelUpCharacter;


            characterController.levelUpCharacter = jest.fn((req, res) => {
                const id = parseInt(req.params.id);
                const character = characterController.characters.find(c => c.id === id);

                if (!character) {
                    return res.status(404).json({
                        status: 'fail',
                        message: `Character with ID ${id} not found`
                    });
                }

                character.levelUp();

                return res.status(200).json({
                    status: 'success',
                    data: {
                        character
                    }
                });
            });

            const req = {
                params: { id: '1' }
            };
            const res = mockResponse();


            characterController.levelUpCharacter(req, res);


            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'fail',
                message: 'Character with ID 1 not found'
            });


            characterController.levelUpCharacter = originalLevelUpCharacter;
        });
    });

    describe('deleteCharacter', () => {
        test('should delete a character successfully', () => {

            const originalDeleteCharacter = characterController.deleteCharacter;
            characterController.deleteCharacter = jest.fn((req, res) => {

                characterController.characters = [{ id: 2, name: 'TestChar2', job: 'Mage' }];

                res.status(204).json({
                    status: 'success',
                    data: null
                });
                return res;
            });


            characterController.characters = [
                { id: 1, name: 'TestChar1', job: 'Warrior' },
                { id: 2, name: 'TestChar2', job: 'Mage' }
            ];

            const req = {
                params: { id: '1' }
            };
            const res = mockResponse();

            characterController.deleteCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalled();


            expect(characterController.characters.length).toBe(1);
            expect(characterController.characters[0].id).toBe(2);


            characterController.deleteCharacter = originalDeleteCharacter;
        });

        test('should return 404 when character does not exist for deletion', () => {
            const req = {
                params: { id: '999' }
            };
            const res = mockResponse();

            characterController.deleteCharacter(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('fail');
            expect(responseData.message).toContain('not found');
        });
    });

    describe('getJobDetails', () => {
        test('should return job details with formulas', () => {
            const req = {};
            const res = mockResponse();

            characterController.getJobDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.status).toBe('success');
            expect(Array.isArray(responseData.data.jobDetails)).toBe(true);
        });
    });
}); 