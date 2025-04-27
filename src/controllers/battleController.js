const Character = require('../models/Character');
const Battle = require('../models/Battle');

/**
 * Battle controller for handling battle-related operations
 */
const battleController = {
    /**
     * @swagger
     * /api/battles:
     *   post:
     *     summary: Start a new battle between two characters
     *     description: Simulates a battle between two characters, determining a winner based on attributes, and saving the winner's remaining HP.
     *     tags: [Battles]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [character1Id, character2Id]
     *             properties:
     *               character1Id:
     *                 type: string
     *                 description: ID of the first character
     *                 example: "60d21b4667d0d8992e610c85"
     *               character2Id:
     *                 type: string
     *                 description: ID of the second character
     *                 example: "60d21b4667d0d8992e610c86"
     *     responses:
     *       200:
     *         description: Battle completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 winner:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: ID of the winning character
     *                       example: "60d21b4667d0d8992e610c85"
     *                     name:
     *                       type: string
     *                       description: Name of the winning character
     *                       example: "Warrior1"
     *                     job:
     *                       type: string
     *                       description: Job of the winning character
     *                       example: "Warrior"
     *                     remainingHp:
     *                       type: number
     *                       description: Remaining HP of the winner after battle
     *                       example: 15
     *                 loser:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: ID of the losing character
     *                       example: "60d21b4667d0d8992e610c86"
     *                     name:
     *                       type: string
     *                       description: Name of the losing character
     *                       example: "Mage1"
     *                     job:
     *                       type: string
     *                       description: Job of the losing character
     *                       example: "Mage"
     *                 rounds:
     *                   type: number
     *                   description: Number of rounds the battle lasted
     *                   example: 3
     *                 battleLog:
     *                   type: array
     *                   description: Log of battle events
     *                   items:
     *                     type: string
     *                   example:
     *                     - "Battle between Warrior1 (Warrior) - 100 HP and Mage1 (Mage) - 70 HP begins!"
     *                     - "Round 1:"
     *                     - "Warrior1 8.0 speed was faster than Mage1 6.0 speed and will begin this round."
     *                     - "Warrior1 attacks Mage1 for 15, Mage1 has 55 HP remaining."
     *                     - "Mage1 attacks Warrior1 for 10, Warrior1 has 90 HP remaining."
     *       400:
     *         description: Invalid request (missing IDs or same character)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Both character IDs are required"
     *       404:
     *         description: Character not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Character with ID 60d21b4667d0d8992e610c85 not found"
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Server error during battle"
     */
    startBattle: async (req, res) => {
        try {
            console.log('[BattleController] Starting battle with body:', JSON.stringify(req.body));
            const { character1Id, character2Id } = req.body;


            if (!character1Id || !character2Id) {
                console.log('[BattleController] Missing character IDs');
                return res.status(400).json({
                    success: false,
                    message: 'Both character IDs are required'
                });
            }


            if (character1Id === character2Id) {
                console.log('[BattleController] Same character IDs used');
                return res.status(400).json({
                    success: false,
                    message: 'A character cannot battle itself'
                });
            }


            console.log('[BattleController] Finding character1 with ID:', character1Id);
            const character1 = await Character.findById(character1Id);
            console.log('[BattleController] Character1 found:', character1 ? 'Yes' : 'No');

            console.log('[BattleController] Finding character2 with ID:', character2Id);
            const character2 = await Character.findById(character2Id);
            console.log('[BattleController] Character2 found:', character2 ? 'Yes' : 'No');


            if (!character1) {
                return res.status(404).json({
                    success: false,
                    message: `Character with ID ${character1Id} not found`
                });
            }

            if (!character2) {
                return res.status(404).json({
                    success: false,
                    message: `Character with ID ${character2Id} not found`
                });
            }


            const formattedCharacter1 = prepareBattleCharacter(character1);
            const formattedCharacter2 = prepareBattleCharacter(character2);


            console.log('[BattleController] Character1 details:', {
                id: formattedCharacter1.id || formattedCharacter1._id,
                name: formattedCharacter1.name,
                job: formattedCharacter1.job,
                hp: formattedCharacter1.hp,
                modifiers: formattedCharacter1.modifiers
            });

            console.log('[BattleController] Character2 details:', {
                id: formattedCharacter2.id || formattedCharacter2._id,
                name: formattedCharacter2.name,
                job: formattedCharacter2.job,
                hp: formattedCharacter2.hp,
                modifiers: formattedCharacter2.modifiers
            });


            console.log('[BattleController] Creating battle instance');
            const battle = new Battle(formattedCharacter1, formattedCharacter2);


            console.log('[BattleController] Executing battle');
            const battleResult = battle.executeBattle();
            console.log('[BattleController] Battle completed');


            if (!battleResult || !battleResult.winner || !battleResult.loser) {
                console.error('[BattleController] Invalid battle result:', battleResult);
                return res.status(500).json({
                    error: 'Battle simulation failed',
                    details: 'Invalid battle result returned'
                });
            }


            const winningCharacterId = (battleResult.winner._id || battleResult.winner.id).toString();
            const character1IdStr = (character1._id || character1.id).toString();

            console.log('[BattleController] Winner ID:', winningCharacterId);
            console.log('[BattleController] Character1 ID:', character1IdStr);


            const winningCharacter = winningCharacterId === character1IdStr
                ? character1
                : character2;

            console.log('[BattleController] Updating winner HP:', battleResult.winner.currentHP);


            if (battleResult.winner.currentHP !== undefined) {
                if ('health' in winningCharacter) {
                    winningCharacter.health = battleResult.winner.currentHP;
                }
                if ('hp' in winningCharacter) {
                    winningCharacter.hp = battleResult.winner.currentHP;
                }


                await winningCharacter.save();
                console.log('[BattleController] Winner HP updated and saved');
            }


            const battleId = battleController.battles.length + 1;
            const battleRecord = {
                id: battleId,
                character1Id: (character1._id || character1.id).toString(),
                character2Id: (character2._id || character2.id).toString(),
                winnerId: winningCharacterId,
                loserId: (battleResult.loser._id || battleResult.loser.id).toString(),
                battleLog: battleResult.battleLog,
                date: new Date()
            };


            battleController.battles.push(battleRecord);
            console.log('[BattleController] Battle record created, ID:', battleRecord.id);


            const battleResults = {
                winner: {
                    id: battleResult.winner._id || battleResult.winner.id,
                    name: battleResult.winner.name,
                    job: battleResult.winner.job,
                    remainingHp: battleResult.winner.currentHP
                },
                loser: {
                    id: battleResult.loser._id || battleResult.loser.id,
                    name: battleResult.loser.name,
                    job: battleResult.loser.job
                },
                rounds: battleResult.battleLog.filter(log => log.startsWith('Round')).length,
                battleLog: battleResult.battleLog
            };

            console.log('[BattleController] Returning battle results');
            return res.status(200).json(battleResults);
        } catch (error) {
            console.error('[BattleController] Error in battle controller:', error);
            return res.status(500).json({
                error: 'Server error during battle',
                details: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    },

    /**
     * @swagger
     * /api/battles:
     *   get:
     *     summary: Get all battles
     *     description: Retrieves a list of all battles that have occurred.
     *     tags: [Battles]
     *     responses:
     *       200:
     *         description: A list of all battles
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 results:
     *                   type: integer
     *                   description: Number of battles retrieved
     *                   example: 2
     *                 data:
     *                   type: object
     *                   properties:
     *                     battles:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                             description: Battle ID
     *                             example: 1
     *                           character1Id:
     *                             type: string
     *                             description: ID of the first character
     *                             example: "60d21b4667d0d8992e610c85"
     *                           character2Id:
     *                             type: string
     *                             description: ID of the second character
     *                             example: "60d21b4667d0d8992e610c86"
     *                           winnerId:
     *                             type: string
     *                             description: ID of the winning character
     *                             example: "60d21b4667d0d8992e610c85"
     *                           loserId:
     *                             type: string
     *                             description: ID of the losing character
     *                             example: "60d21b4667d0d8992e610c86"
     *                           date:
     *                             type: string
     *                             format: date-time
     *                             description: Date and time when the battle occurred
     *                             example: "2023-04-01T12:00:00.000Z"
     *                           battleLog:
     *                             type: array
     *                             description: Log of battle events
     *                             items:
     *                               type: string
     */
    getAllBattles: (req, res) => {
        res.status(200).json({
            status: 'success',
            results: battleController.battles.length,
            data: {
                battles: battleController.battles
            }
        });
    },

    /**
     * @swagger
     * /api/battles/{id}:
     *   get:
     *     summary: Get a battle by ID
     *     description: Retrieves details of a specific battle by its ID.
     *     tags: [Battles]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Battle ID
     *         example: 1
     *     responses:
     *       200:
     *         description: Battle details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     battle:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: integer
     *                           description: Battle ID
     *                           example: 1
     *                         character1Id:
     *                           type: string
     *                           description: ID of the first character
     *                           example: "60d21b4667d0d8992e610c85"
     *                         character2Id:
     *                           type: string
     *                           description: ID of the second character
     *                           example: "60d21b4667d0d8992e610c86"
     *                         winnerId:
     *                           type: string
     *                           description: ID of the winning character
     *                           example: "60d21b4667d0d8992e610c85"
     *                         loserId:
     *                           type: string
     *                           description: ID of the losing character
     *                           example: "60d21b4667d0d8992e610c86"
     *                         date:
     *                           type: string
     *                           format: date-time
     *                           description: Date and time when the battle occurred
     *                           example: "2023-04-01T12:00:00.000Z"
     *                         battleLog:
     *                           type: array
     *                           description: Log of battle events
     *                           items:
     *                             type: string
     *       404:
     *         description: Battle not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: fail
     *                 message:
     *                   type: string
     *                   example: "Battle with ID 99 not found"
     */
    getBattleById: (req, res) => {
        const id = parseInt(req.params.id);
        const battle = battleController.battles.find(b => b.id === id);

        if (!battle) {
            return res.status(404).json({
                status: 'fail',
                message: `Battle with ID ${id} not found`
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                battle
            }
        });
    },


    battles: []
};

/**
 * Helper function to prepare a character for battle
 * This ensures the character has the proper structure expected by the Battle model
 * @param {Object} character - Character to prepare
 * @returns {Object} - Formatted character with proper modifiers
 */
function prepareBattleCharacter(character) {

    const formatted = { ...character };


    formatted._id = character._id || character.id;


    formatted.hp = character.hp || character.health;


    formatted.level = character.level || 1;
    formatted.strength = character.strength || 5;
    formatted.dexterity = character.dexterity || 5;
    formatted.intelligence = character.intelligence || 5;



    if (character.modifiers) {
        formatted.modifiers = { ...character.modifiers };
    } else {
        formatted.modifiers = {
            attack: character.attackModifier || 5,
            defense: calculateDefense(character),
            speed: character.speedModifier || 5
        };
    }


    if (!formatted.modifiers.attack && formatted.modifiers.attack !== 0) {
        formatted.modifiers.attack = character.attackModifier || 5;
    }
    if (!formatted.modifiers.defense && formatted.modifiers.defense !== 0) {
        formatted.modifiers.defense = calculateDefense(character);
    }
    if (!formatted.modifiers.speed && formatted.modifiers.speed !== 0) {
        formatted.modifiers.speed = character.speedModifier || 5;
    }

    return formatted;
}

/**
 * Calculate defense value based on character attributes
 * @param {Object} character - Character to calculate defense for
 * @returns {number} - Calculated defense value
 */
function calculateDefense(character) {
    switch (character.job) {
        case 'Warrior':

            return Math.round((character.strength * 0.6) + (character.dexterity * 0.2));
        case 'Thief':

            return Math.round((character.dexterity * 0.5) + (character.strength * 0.2));
        case 'Mage':

            return Math.round((character.intelligence * 0.3) + (character.dexterity * 0.3));
        default:

            return Math.round((character.strength * 0.4) + (character.dexterity * 0.4));
    }
}

module.exports = battleController; 