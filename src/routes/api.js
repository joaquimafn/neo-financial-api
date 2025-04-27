const express = require('express');
const router = express.Router();


const characterController = require('../controllers/characterController');
const battleController = require('../controllers/battleController');

/**
 * @swagger
 * tags:
 *   - name: Characters
 *     description: RPG character management
 *   - name: Battles
 *     description: RPG character battles
 *   - name: Health
 *     description: API health check
 */


router.get('/characters/jobs', characterController.getAvailableJobs);
router.get('/characters/job-details/:job', characterController.getJobDetails);
router.post('/characters', characterController.createCharacter);
router.get('/characters', characterController.getAllCharacters);
router.get('/characters/:id', characterController.getCharacterById);
router.put('/characters/:id', characterController.updateCharacter);
router.post('/characters/:id/level-up', characterController.levelUpCharacter);
router.delete('/characters/:id', characterController.deleteCharacter);


router.post('/battles', battleController.startBattle);
router.get('/battles', battleController.getAllBattles);
router.get('/battles/:id', battleController.getBattleById);

/**
 * @swagger
 * /api/battle/health:
 *   get:
 *     summary: Check Battle system health status
 *     tags: [Battles, Health]
 *     responses:
 *       200:
 *         description: Battle system is running correctly
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
 *                   example: Battle system is ready
 *                 battles:
 *                   type: integer
 *                   example: 0
 */
router.get('/battle/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Battle system is ready',
        battles: battleController.battles ? battleController.battles.length : 0,
        timestamp: new Date()
    });
});

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