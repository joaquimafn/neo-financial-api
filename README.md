# Neo Financial API

A REST API built with Node.js and Express for managing RPG game characters.

## Features

- Character management for RPG games (CRUD operations)
- Character level-up mechanics
- Character job change system
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

3. **Testing Complexity**: Resolved controller testing issues where mocks weren't functioning correctly. The solution involved:
   - Restructuring mocks to improve test isolation
   - Implementing temporary substitutions of original controller functions
   - Ensuring proper restoration after each test
   - Fixing verification of mock function calls

All features were implemented following good programming practices, with high test coverage (>95%) and proper documentation.

## Data Storage

All data is stored in memory. No database is used for this application. Data will be lost when the server restarts.

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### RPG Characters
- `GET /api/characters/jobs` - Get available character jobs
- `GET /api/characters/job-details` - Get detailed information about character jobs
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get a specific character
- `POST /api/characters` - Create a new character
- `PUT /api/characters/:id` - Update a character (change job)
- `POST /api/characters/:id/level-up` - Level up a character
- `DELETE /api/characters/:id` - Delete a character

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

### Example: Change Character Job

**Request:**
```http
PUT /api/characters/1
Content-Type: application/json

{
  "job": "Mage"
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
      "job": "Mage",
      "level": 2,
      "health": 14.4,
      "strength": 12,
      "dexterity": 6,
      "intelligence": 6,
      "attackModifier": 10.08,
      "speedModifier": 3
    }
  }
}
``` 