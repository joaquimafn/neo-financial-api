# Neo Financial API

A REST API built with Node.js and Express for managing RPG game characters.

## Features

- Character management for RPG games (CRUD operations)
- Character level-up mechanics
- Character job change system
- Battle system between characters
- Dynamic attribute calculation based on character job
- RESTful architecture
- JSON responses
- Error handling
- Swagger API documentation

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

## Installation

1. Clone the repository:
```
git clone https://github.com/joaquimafn/neo-financial-api.git
cd neo-financial-api
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file based on `.env.example`:
```
cp .env.example .env
```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Documentation

The API is documented using Swagger UI. Once the server is running, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:
- Explore all available endpoints
- See request/response schemas
- Test API endpoints directly from the browser

## Running the Tests
```
npm test
```

For watching mode (continuous testing):
```
npm run test:watch
```

## Technical Implementation

The project follows a simplified MVC architecture:

- `models/`: Defines entities and business rules
- `controllers/`: Manages API input/output logic
- `routes/`: Defines API endpoints

### Development Challenges and Solutions

During development, I encountered several technical challenges:

1. **Character Model Validation**: Implemented robust validation for character names (length and allowed characters) and available jobs.

2. **Dynamic Attribute Calculation**: Each character class has different formulas for calculating attack and speed modifiers based on base attributes.

3. **Battle System Implementation**: Created a battle system that dynamically determines turn order based on character speed and calculates damage based on character attack modifiers.

4. **Testing Complexity**: Resolved controller testing issues by implementing comprehensive mocks and test scenarios.

All features were implemented following good programming practices, with high test coverage (>95%) and proper documentation.

## Data Storage

All data is stored in memory. No database is used for this application. Data will be lost when the server restarts.

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### RPG Characters
- `GET /api/jobs` - Get available character jobs
- `GET /api/jobs/:job` - Get detailed information about a specific job
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get a specific character
- `POST /api/characters` - Create a new character
- `PUT /api/characters/:id` - Update a character (change job)
- `POST /api/characters/:id/levelup` - Level up a character
- `DELETE /api/characters/:id` - Delete a character

### Battles
- `POST /api/battles` - Start a battle between two characters
- `GET /api/battles` - Get all battles
- `GET /api/battles/:id` - Get a specific battle
- `GET /api/battle/health` - Check battle system health status

## RPG Character System

The API features a comprehensive RPG character system:

### Character Creation
- Characters have a name and job
- Name must be 4-15 characters long and can only contain letters or underscores
- Available jobs: Warrior, Thief, Mage

### Character Attributes
Each job has different base attributes:

**Warrior**
- Health: 20 points
- Strength: 10
- Dexterity: 5
- Intelligence: 5
- Attack modifier: 80% of strength + 20% of dexterity
- Speed modifier: 60% of dexterity + 20% of intelligence

**Thief**
- Health: 15 points
- Strength: 4
- Dexterity: 10
- Intelligence: 4
- Attack modifier: 25% of strength + 100% of dexterity + 25% of intelligence
- Speed modifier: 80% of dexterity

**Mage**
- Health: 12 points
- Strength: 5
- Dexterity: 6
- Intelligence: 10
- Attack modifier: 20% of strength + 20% of dexterity + 120% of intelligence
- Speed modifier: 40% of dexterity + 10% of strength

### Character Progression
The character system supports:
- Character leveling (increases attributes based on job)
- Job changes (recalculates modifiers based on new job)

### Battle System
The battle system provides a way for characters to engage in combat:

- Battles are turn-based and continue until one character reaches 0 HP
- Each round begins by determining which character attacks first based on speed (initiative)
- Initiative is determined randomly using the character's speed modifier
- Damage is calculated as a random value between 0 and the attacker's attack modifier
- Defense reduces incoming damage (defense / 3)
- Minimum damage is always 1, regardless of defense
- Detailed battle logs record each action and the outcome
- The winner keeps their remaining HP after the battle
- In case of a 100-round draw, the character with the most remaining HP is declared the winner

### Battle API Endpoints

#### Start a Battle
Initiates a battle between two characters and returns the battle results.

**Endpoint:** `POST /api/battles`

**Request Body:**
```json
{
  "character1Id": "characterId1",
  "character2Id": "characterId2"
}
```

**Success Response (200):**
```json
{
  "winner": {
    "id": "characterId1",
    "name": "Character1Name",
    "job": "Warrior",
    "remainingHp": 65
  },
  "loser": {
    "id": "characterId2",
    "name": "Character2Name",
    "job": "Mage"
  },
  "rounds": 5,
  "battleLog": [
    "Battle begins: Character1Name (Warrior, HP: 100) vs Character2Name (Mage, HP: 70)",
    "Round 1:",
    "Character1Name wins initiative with 7.5 vs 6.2",
    "Character1Name attacks for 15 damage (12 after defense). Character2Name HP: 58",
    "Character2Name attacks for 12 damage (7 after defense). Character1Name HP: 93",
    // More battle log entries...
    "Battle ends! Character1Name wins with 65 HP remaining!"
  ]
}
```

**Error Responses:**
- `400 Bad Request`: If character IDs are missing or the same character is used twice
- `404 Not Found`: If one or both characters cannot be found
- `500 Internal Server Error`: For server-side errors

#### Get All Battles
Retrieves a list of all battles that have occurred.

**Endpoint:** `GET /api/battles`

**Success Response (200):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "battles": [
      // Battle objects
    ]
  }
}
```

#### Get Battle by ID
Retrieves details of a specific battle by its ID.

**Endpoint:** `GET /api/battles/:id`

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "battle": {
      // Battle details
    }
  }
}
```

**Error Response:**
- `404 Not Found`: If the battle with the specified ID cannot be found

## Technologies Used

- Node.js
- Express
- Jest (testing)
- Swagger (API documentation)

## Request & Response Examples

### Example: Create a Character

**Request:**
```http
POST /api/characters
Content-Type: application/json

{
  "name": "Hero_Knight",
  "job": "Warrior"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "character": {
      "id": 1,
      "name": "Hero_Knight",
      "job": "Warrior",
      "level": 1,
      "health": 20,
      "strength": 10,
      "dexterity": 5,
      "intelligence": 5,
      "attackModifier": 9,
      "speedModifier": 4
    }
  }
}
```

### Example: Level Up a Character

**Request:**
```http
POST /api/characters/1/level-up
Content-Type: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "character": {
      "id": 1,
      "name": "Hero_Knight",
      "job": "Warrior",
      "level": 2,
      "health": 24,
      "strength": 12,
      "dexterity": 6,
      "intelligence": 6,
      "attackModifier": 10.8,
      "speedModifier": 4.8
    }
  }
}
```

### Example: Start a Battle

**Request:**
```http
POST /api/battles
Content-Type: application/json

{
  "character1Id": 1,
  "character2Id": 2
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "battleId": 1,
    "winner": {
      "id": 1,
      "name": "Hero_Knight",
      "job": "Warrior",
      "currentHP": 15
    },
    "loser": {
      "id": 2,
      "name": "Spell_Master",
      "job": "Mage",
      "currentHP": 0
    },
    "battleLog": [
      "Battle between Hero_Knight (Warrior) - 20 HP and Spell_Master (Mage) - 12 HP begins!",
      "Hero_Knight 3 speed was faster than Spell_Master 1 speed and will begin this round.",
      "Hero_Knight attacks Spell_Master for 5, Spell_Master has 7 HP remaining.",
      "Spell_Master attacks Hero_Knight for 8, Hero_Knight has 12 HP remaining.",
      "Spell_Master 2 speed was faster than Hero_Knight 1 speed and will begin this round.",
      "Spell_Master attacks Hero_Knight for 7, Hero_Knight has 5 HP remaining.",
      "Hero_Knight attacks Spell_Master for 7, Spell_Master has 0 HP remaining.",
      "Hero_Knight wins the battle! Hero_Knight still has 5 HP remaining!"
    ]
  }
}
``` 