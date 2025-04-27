const Character = require('../models/Character');

// In-memory characters data (replace with database in production)
let characters = [];

/**
 * @swagger
 * /api/characters/jobs:
 *   get:
 *     summary: Get available character jobs
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: A list of available jobs
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
 *                     availableJobs:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Warrior", "Thief", "Mage"]
 */
exports.getAvailableJobs = (req, res) => {
    const availableJobs = Character.getAvailableJobs();

    res.status(200).json({
        status: 'success',
        data: {
            availableJobs
        }
    });
};

/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Get all characters
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: A list of characters
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
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     characters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
 */
exports.getAllCharacters = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: characters.length,
        data: {
            characters
        }
    });
};

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     summary: Get a character by ID
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     responses:
 *       200:
 *         description: Character details
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
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.getCharacterById = (req, res) => {
    const id = parseInt(req.params.id);
    const character = characters.find(c => c.id === id);

    if (!character) {
        return res.status(404).json({
            status: 'fail',
            message: `Character with ID ${id} not found`
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            character
        }
    });
};

/**
 * @swagger
 * /api/characters:
 *   post:
 *     summary: Create a new character
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, job]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Character name (4-15 characters, letters and underscores only)
 *                 example: Hero_Knight
 *               job:
 *                 type: string
 *                 enum: [Warrior, Thief, Mage]
 *                 description: Character job
 *                 example: Warrior
 *     responses:
 *       201:
 *         description: Character created successfully
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
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.createCharacter = (req, res) => {
    try {
        const { name, job } = req.body;

        if (!name || !job) {
            return res.status(400).json({
                status: 'fail',
                message: 'Character name and job are required'
            });
        }

        // Create a new character instance (validation happens in the model)
        const character = new Character(name, job);

        // Add an ID for the character
        const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
        character.id = newId;

        // Store the character
        characters.push(character);

        res.status(201).json({
            status: 'success',
            data: {
                character
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * @swagger
 * /api/characters/{id}:
 *   put:
 *     summary: Update a character (change job)
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job:
 *                 type: string
 *                 enum: [Warrior, Thief, Mage]
 *                 description: New character job
 *                 example: Mage
 *     responses:
 *       200:
 *         description: Character updated successfully
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
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.updateCharacter = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const characterIndex = characters.findIndex(c => c.id === id);

        if (characterIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: `Character with ID ${id} not found`
            });
        }

        const character = characters[characterIndex];

        // Handle job change if provided
        if (req.body.job && req.body.job !== character.job) {
            character.changeJob(req.body.job);
        }

        res.status(200).json({
            status: 'success',
            data: {
                character
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * @swagger
 * /api/characters/{id}/level-up:
 *   post:
 *     summary: Level up a character
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     responses:
 *       200:
 *         description: Character leveled up successfully
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
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.levelUpCharacter = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const character = characters.find(c => c.id === id);

        if (!character) {
            return res.status(404).json({
                status: 'fail',
                message: `Character with ID ${id} not found`
            });
        }

        character.levelUp();

        res.status(200).json({
            status: 'success',
            data: {
                character
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * @swagger
 * /api/characters/{id}:
 *   delete:
 *     summary: Delete a character
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     responses:
 *       204:
 *         description: Character deleted successfully
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.deleteCharacter = (req, res) => {
    const id = parseInt(req.params.id);
    const characterIndex = characters.findIndex(c => c.id === id);

    if (characterIndex === -1) {
        return res.status(404).json({
            status: 'fail',
            message: `Character with ID ${id} not found`
        });
    }

    characters.splice(characterIndex, 1);

    res.status(204).json({
        status: 'success',
        data: null
    });
};

/**
 * @swagger
 * /api/characters/job-details:
 *   get:
 *     summary: Get detailed information about character jobs
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: Detailed information about all available character jobs
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
 *                     jobDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Warrior
 *                           healthPoints:
 *                             type: integer
 *                             example: 20
 *                           strength:
 *                             type: integer
 *                             example: 10
 *                           dexterity:
 *                             type: integer
 *                             example: 5
 *                           intelligence:
 *                             type: integer
 *                             example: 5
 *                           attackFormula:
 *                             type: string
 *                             example: 80% of strength + 20% of dexterity
 *                           speedFormula:
 *                             type: string
 *                             example: 60% of dexterity + 20% of intelligence
 */
exports.getJobDetails = (req, res) => {
    const jobDetails = Character.getJobDetails();

    res.status(200).json({
        status: 'success',
        data: {
            jobDetails
        }
    });
}; 