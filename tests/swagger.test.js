const swaggerSpecs = require('../src/swagger');

describe('Swagger Specification', () => {
    test('should have correct openapi version', () => {
        expect(swaggerSpecs.openapi).toBe('3.0.0');
    });

    test('should have correct API info', () => {
        expect(swaggerSpecs.info).toBeDefined();
        expect(swaggerSpecs.info.title).toBe('Neo Financial API');
        expect(swaggerSpecs.info.version).toBe('1.0.0');
        expect(swaggerSpecs.info.description).toContain('REST API');
    });

    test('should have servers defined', () => {
        expect(swaggerSpecs.servers).toBeDefined();
        expect(swaggerSpecs.servers.length).toBeGreaterThan(0);
        expect(swaggerSpecs.servers[0].url).toBe('http://localhost:3000');
    });

    test('should have components schemas defined', () => {
        expect(swaggerSpecs.components).toBeDefined();
        expect(swaggerSpecs.components.schemas).toBeDefined();

        // Verifica schema de Character
        expect(swaggerSpecs.components.schemas.Character).toBeDefined();
        expect(swaggerSpecs.components.schemas.Character.properties).toHaveProperty('name');
        expect(swaggerSpecs.components.schemas.Character.properties).toHaveProperty('job');
        expect(swaggerSpecs.components.schemas.Character.properties).toHaveProperty('level');

        // Verifica schema de Error
        expect(swaggerSpecs.components.schemas.Error).toBeDefined();

        // Verifica outros schemas
        expect(swaggerSpecs.components.schemas.User).toBeDefined();
        expect(swaggerSpecs.components.schemas.Transaction).toBeDefined();
    });

    test('should have paths defined from routes and controllers', () => {
        expect(swaggerSpecs.paths).toBeDefined();
    });
}); 