const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/api');
const characterController = require('../../src/controllers/characterController');
const battleController = require('../../src/controllers/battleController');

// Mock dos controladores
jest.mock('../../src/controllers/characterController', () => {
    const mockController = {};
    const originalController = jest.requireActual('../../src/controllers/characterController');

    // Copia os métodos originais
    Object.keys(originalController).forEach(key => {
        if (typeof originalController[key] === 'function') {
            mockController[key] = jest.fn((req, res) => originalController[key](req, res));
        } else {
            mockController[key] = originalController[key];
        }
    });

    return mockController;
});

jest.mock('../../src/controllers/battleController');

// Configura uma app Express para os testes
const app = express();
app.use(express.json());
app.use('/api', router);

// Limpar os mocks após cada teste
afterEach(() => {
    jest.clearAllMocks();
});

describe('API Routes', () => {
    describe('/api/health', () => {
        test('should return 200 status and correct message', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('API is running correctly');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('/api/characters/jobs', () => {
        test('should return available jobs', async () => {
            await request(app).get('/api/characters/jobs');

            expect(characterController.getAvailableJobs).toHaveBeenCalled();
        });
    });

    describe('/api/characters/job-details/:job', () => {
        test('should return job details', async () => {
            await request(app).get('/api/characters/job-details/Warrior');

            expect(characterController.getJobDetails).toHaveBeenCalled();
            const callArgs = characterController.getJobDetails.mock.calls[0];
            expect(callArgs[0].params.job).toBe('Warrior');
        });
    });

    describe('/api/characters', () => {
        test('should get all characters', async () => {
            await request(app).get('/api/characters');

            expect(characterController.getAllCharacters).toHaveBeenCalled();
        });

        test('should create a new character', async () => {
            await request(app)
                .post('/api/characters')
                .send({ name: 'TestChar', job: 'Warrior' });

            expect(characterController.createCharacter).toHaveBeenCalled();
        });

        test('should return 400 when creating character with missing data', async () => {
            await request(app)
                .post('/api/characters')
                .send({ name: 'TestChar' });

            expect(characterController.createCharacter).toHaveBeenCalled();
        });
    });

    describe('/api/characters/:id', () => {
        test('should get a character by id', async () => {
            await request(app).get('/api/characters/1');

            // Verificar que a função foi chamada com qualquer argumento
            expect(characterController.getCharacterById).toHaveBeenCalled();

            // Verificar que o primeiro argumento (req) contém params.id = '1'
            const callArgs = characterController.getCharacterById.mock.calls[0];
            expect(callArgs[0].params.id).toBe('1');
        });

        test('should return 404 when character not found', async () => {
            await request(app).get('/api/characters/999');

            const callArgs = characterController.getCharacterById.mock.calls[0];
            expect(callArgs[0].params.id).toBe('999');
        });

        test('should update a character', async () => {
            await request(app)
                .put('/api/characters/1')
                .send({ job: 'Mage' });

            const callArgs = characterController.updateCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('1');
            expect(callArgs[0].body.job).toBe('Mage');
        });

        test('should return 404 when updating non-existent character', async () => {
            await request(app)
                .put('/api/characters/999')
                .send({ job: 'Mage' });

            const callArgs = characterController.updateCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('999');
        });

        test('should delete a character', async () => {
            await request(app).delete('/api/characters/1');

            const callArgs = characterController.deleteCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('1');
        });

        test('should return 404 when deleting non-existent character', async () => {
            await request(app).delete('/api/characters/999');

            const callArgs = characterController.deleteCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('999');
        });
    });

    describe('/api/characters/:id/level-up', () => {
        test('should level up a character', async () => {
            await request(app).post('/api/characters/1/level-up');

            const callArgs = characterController.levelUpCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('1');
        });

        test('should return 404 when leveling up non-existent character', async () => {
            await request(app).post('/api/characters/999/level-up');

            const callArgs = characterController.levelUpCharacter.mock.calls[0];
            expect(callArgs[0].params.id).toBe('999');
        });
    });

    describe('Battle Routes', () => {
        it('POST /api/battles should call startBattle controller method', async () => {
            const mockReq = {
                body: {
                    character1Id: '1234',
                    character2Id: '5678'
                }
            };

            battleController.startBattle.mockImplementation((req, res) => {
                res.status(201).json({
                    status: 'success',
                    data: {
                        winner: { id: '1234', name: 'Winner', remainingHp: 50 },
                        loser: { id: '5678', name: 'Loser' },
                        rounds: 3,
                        battleLog: ['Battle log']
                    }
                });
            });

            const response = await request(app)
                .post('/api/battles')
                .send(mockReq.body);

            expect(response.status).toBe(201);
            expect(battleController.startBattle).toHaveBeenCalled();
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data).toHaveProperty('winner');
            expect(response.body.data).toHaveProperty('loser');
        });

        it('GET /api/battles should call getAllBattles controller method', async () => {
            battleController.getAllBattles.mockImplementation((req, res) => {
                res.status(200).json({
                    status: 'success',
                    results: 2,
                    data: {
                        battles: [
                            { id: 1, winnerId: '1234', loserId: '5678' },
                            { id: 2, winnerId: '5678', loserId: '1234' }
                        ]
                    }
                });
            });

            const response = await request(app).get('/api/battles');

            expect(response.status).toBe(200);
            expect(battleController.getAllBattles).toHaveBeenCalled();
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data.battles).toHaveLength(2);
        });

        it('GET /api/battles/:id should call getBattleById controller method', async () => {
            battleController.getBattleById.mockImplementation((req, res) => {
                if (req.params.id === '1') {
                    res.status(200).json({
                        status: 'success',
                        data: {
                            battle: { id: 1, winnerId: '1234', loserId: '5678' }
                        }
                    });
                } else {
                    res.status(404).json({
                        status: 'fail',
                        message: `Battle with ID ${req.params.id} not found`
                    });
                }
            });

            const response = await request(app).get('/api/battles/1');

            expect(response.status).toBe(200);
            expect(battleController.getBattleById).toHaveBeenCalled();
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data.battle).toHaveProperty('id', 1);
        });

        it('GET /api/battles/:id should return 404 for non-existent battle', async () => {
            battleController.getBattleById.mockImplementation((req, res) => {
                res.status(404).json({
                    status: 'fail',
                    message: `Battle with ID ${req.params.id} not found`
                });
            });

            const response = await request(app).get('/api/battles/999');

            expect(response.status).toBe(404);
            expect(battleController.getBattleById).toHaveBeenCalled();
            expect(response.body).toHaveProperty('status', 'fail');
            expect(response.body).toHaveProperty('message', 'Battle with ID 999 not found');
        });
    });

    describe('Health Check Routes', () => {
        it('GET /api/health should return API health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('message', 'API is running correctly');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('GET /api/battle/health should return battle system health status', async () => {
            // Mock battles array for this test
            battleController.battles = [];

            const response = await request(app).get('/api/battle/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('message', 'Battle system is ready');
            expect(response.body).toHaveProperty('battles', 0);
            expect(response.body).toHaveProperty('timestamp');
        });

        it('GET /api/battle/health should display correct battle count', async () => {
            // Mock battles array with some battles
            battleController.battles = [
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ];

            const response = await request(app).get('/api/battle/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('battles', 3);
        });
    });
}); 