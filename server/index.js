const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Cerebras } = require('@cerebras/cerebras_cloud_sdk');
// const { createClient } = require('@supabase/supabase-js'); // Uncomment when supabase-js is available

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware to log requests (simplified)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// In-memory storage for recipes (fallback when MongoDB is not available)
let recipes = [];

// MongoDB connection (optional - will fallback to in-memory if fails)
let Recipe = null;
let User = null;
let mongoConnected = false;

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    
    // User Schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });
    User = mongoose.model('User', userSchema);
    
    // Recipe Schema
    const recipeSchema = new mongoose.Schema({
      title: String,
      description: String,
      ingredients: [String],
      instructions: String,
      cookingTime: String,
      servings: String,
      difficulty: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    });
    Recipe = mongoose.model('Recipe', recipeSchema);
    mongoConnected = true;
  } catch (err) {
    console.log('MongoDB not available, using in-memory storage:', err.message);
    mongoConnected = false;
  }
};

connectMongo();

// Cerebras AI setup
const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API: User Registration
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    if (!mongoConnected || !User) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// API: User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!mongoConnected || !User) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// API: Generate Recipe (works with or without authentication)
app.post('/api/recipes/generate', async (req, res) => {
  const { ingredients } = req.body;
  
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'Please provide ingredients' });
  }
  
  // Optional authentication - get user ID if token is provided
  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.log('Invalid token, proceeding anonymously');
    }
  }

  try {
    console.log('Generating recipe for ingredients:', ingredients.join(', '));
    
    // Use Cerebras AI to generate recipe
    const prompt = `Create a detailed and creative recipe using these ingredients: ${ingredients.join(', ')}.

Please provide a response in this exact format:

TITLE: [Creative recipe name]

DESCRIPTION: [Brief description of the dish]

INGREDIENTS:
- [Ingredient 1 with measurement]
- [Ingredient 2 with measurement]
- [Continue for all needed ingredients]

INSTRUCTIONS:
1. [Detailed step 1]
2. [Detailed step 2]
3. [Continue with all cooking steps]

COOKING_TIME: [Total time needed]
SERVINGS: [Number of servings]
DIFFICULTY: [Easy/Medium/Hard]

Make it creative, detailed, and delicious!`;

    const completion = await cerebras.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3.1-8b",
      max_tokens: 800,
      temperature: 0.8,
    });

    const aiText = completion.choices[0].message.content;
    console.log('Recipe generated successfully!');
    
    // Parse the AI response more intelligently
    const lines = aiText.split('\n').filter(line => line.trim());
    
    let title = 'Creative Recipe';
    let description = '';
    let instructions = '';
    let cookingTime = '30 minutes';
    let servings = '2-4';
    let difficulty = 'Medium';
    let parsedIngredients = ingredients;
    
    // Extract title
    const titleLine = lines.find(line => line.toLowerCase().includes('title:'));
    if (titleLine) {
      title = titleLine.replace(/^.*title:\s*/i, '').replace(/^\*\*|\*\*$/g, '').replace(/^"|}"|"$/g, '').trim();
    }
    
    // Extract description
    const descLine = lines.find(line => line.toLowerCase().includes('description:'));
    if (descLine) {
      description = descLine.replace(/^.*description:\s*/i, '').replace(/^\*\*|\*\*$/g, '').trim();
    }
    
    // Extract cooking time
    const timeLine = lines.find(line => line.toLowerCase().includes('cooking_time:'));
    if (timeLine) {
      cookingTime = timeLine.replace(/^.*cooking_time:\s*/i, '').replace(/^\*\*|\*\*$/g, '').replace(/\(.*\)/, '').trim();
    }
    
    // Extract servings
    const servingsLine = lines.find(line => line.toLowerCase().includes('servings:'));
    if (servingsLine) {
      servings = servingsLine.replace(/^.*servings:\s*/i, '').replace(/^\*\*|\*\*$/g, '').trim();
    }
    
    // Extract difficulty
    const diffLine = lines.find(line => line.toLowerCase().includes('difficulty:'));
    if (diffLine) {
      difficulty = diffLine.replace(/^.*difficulty:\s*/i, '').replace(/^\*\*|\*\*$/g, '').trim();
    }
    
    // Extract ingredients section
    const ingredientsIndex = lines.findIndex(line => line.toLowerCase().includes('ingredients:'));
    const instructionsIndex = lines.findIndex(line => line.toLowerCase().includes('instructions:'));
    
    if (ingredientsIndex !== -1 && instructionsIndex !== -1) {
      const ingredientLines = lines.slice(ingredientsIndex + 1, instructionsIndex)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
      if (ingredientLines.length > 0) {
        parsedIngredients = ingredientLines;
      }
    }
    
    // Extract instructions
    if (instructionsIndex !== -1) {
      const instructionLines = lines.slice(instructionsIndex + 1)
        .filter(line => line.trim() && !line.toLowerCase().includes('cooking_time') && !line.toLowerCase().includes('servings') && !line.toLowerCase().includes('difficulty'))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^\*\*|\*\*$/g, '').trim())
        .filter(line => line.length > 0);
      instructions = instructionLines.join('\n');
    }
    
    if (!instructions) {
      instructions = aiText; // Fallback to full response
    }
    
    const recipeData = { 
      title, 
      description,
      ingredients: parsedIngredients, 
      instructions: instructions.trim(),
      cookingTime,
      servings,
      difficulty,
      userId: userId, // Will be null for anonymous users
      createdAt: new Date() 
    };
    
    console.log('Parsed recipe data:', { title, cookingTime, servings, difficulty });
    
    // Save to MongoDB if available, otherwise use in-memory storage
    if (mongoConnected && Recipe) {
      const recipe = new Recipe(recipeData);
      await recipe.save();
      res.json(recipe);
    } else {
      recipeData._id = Date.now().toString();
      recipes.push(recipeData);
      res.json(recipeData);
    }
  } catch (err) {
    console.error('Error generating recipe:', err.message);
    res.status(500).json({ error: 'Failed to generate recipe', details: err.message });
  }
});

// API: Get All Recipes (public)
app.get('/api/recipes', async (req, res) => {
  try {
    if (mongoConnected && Recipe) {
      const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(20);
      res.json(recipes);
    } else {
      res.json(recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  } catch (err) {
    res.json(recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
});

// API: Get User's Recipes (protected)
app.get('/api/recipes/my', authenticateToken, async (req, res) => {
  try {
    if (mongoConnected && Recipe) {
      const userRecipes = await Recipe.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json(userRecipes);
    } else {
      const userRecipes = recipes.filter(recipe => recipe.userId === req.user.userId);
      res.json(userRecipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// Health check
app.get('/', (req, res) => res.send('AI Cooking Suggest Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
