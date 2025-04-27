const express = require('express');
const router = express.Router();

// Import controllers
const characterController = require('../controllers/characterController');

/**
 * @swagger
 * tags:
 *   - name: Characters
 *     description: RPG character management
 *   - name: Health
 *     description: API health check
 */

// Character routes
router.get('/characters/jobs', characterController.getAvailableJobs);
router.get('/characters/job-details', characterController.getJobDetails);
router.get('/characters', characterController.getAllCharacters);
router.get('/characters/:id', characterController.getCharacterById);
router.post('/characters', characterController.createCharacter);
router.put('/characters/:id', characterController.updateCharacter);
router.post('/characters/:id/level-up', characterController.levelUpCharacter);
router.delete('/characters/:id', characterController.deleteCharacter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: API is running correctly
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running correctly',
        timestamp: new Date()
    });
});

module.exports = router; 