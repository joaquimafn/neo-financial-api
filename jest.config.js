module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    bail: false,
    passWithNoTests: true,
}; 