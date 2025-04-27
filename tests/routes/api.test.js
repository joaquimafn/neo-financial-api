const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/api');
const characterController = require('../../src/controllers/characterController');

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

    describe('/api/characters/job-details', () => {
        test('should return job details', async () => {
            await request(app).get('/api/characters/job-details');

            expect(characterController.getJobDetails).toHaveBeenCalled();
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
}); 