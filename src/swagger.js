const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Neo Financial API',
            version: '1.0.0',
            description: 'A REST API built with Node.js and Express for managing financial data and RPG game characters',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                // Character Schema
                Character: {
                    type: 'object',
                    required: ['name', 'job'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Character ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Character name (4-15 characters, letters and underscores only)'
                        },
                        job: {
                            type: 'string',
                            enum: ['Warrior', 'Thief', 'Mage'],
                            description: 'Character job'
                        },
                        level: {
                            type: 'integer',
                            description: 'Character level'
                        },
                        health: {
                            type: 'number',
                            description: 'Character health points'
                        },
                        strength: {
                            type: 'number',
                            description: 'Character strength attribute'
                        },
                        dexterity: {
                            type: 'number',
                            description: 'Character dexterity attribute'
                        },
                        intelligence: {
                            type: 'number',
                            description: 'Character intelligence attribute'
                        },
                        attackModifier: {
                            type: 'number',
                            description: 'Attack modifier based on job'
                        },
                        speedModifier: {
                            type: 'number',
                            description: 'Speed modifier based on job'
                        }
                    }
                },
                // Error Schema
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'fail'
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                // User Schema (for existing endpoints)
                User: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        name: {
                            type: 'string',
                            description: 'User name'
                        },
                        email: {
                            type: 'string',
                            description: 'User email'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation date'
                        }
                    }
                },
                // Transaction Schema (for existing endpoints)
                Transaction: {
                    type: 'object',
                    required: ['userId', 'amount', 'type'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Transaction ID'
                        },
                        userId: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        amount: {
                            type: 'number',
                            description: 'Transaction amount'
                        },
                        type: {
                            type: 'string',
                            enum: ['deposit', 'withdrawal'],
                            description: 'Transaction type'
                        },
                        description: {
                            type: 'string',
                            description: 'Transaction description'
                        },
                        date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Transaction date'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 