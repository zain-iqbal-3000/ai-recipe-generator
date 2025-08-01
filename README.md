# AI Recipe Generator 🍳🤖

A full-stack MERN (MongoDB, Express, React, Node.js) application that generates creative recipes using AI. Built with a modern, vibrant UI and powered by Cerebras AI for intelligent recipe generation.

## ✨ Features

- **AI-Powered Recipe Generation**: Enter ingredients and get creative, detailed recipes
- **User Authentication**: Register and login to save your favorite recipes
- **Modern UI**: Beautiful, responsive design with glassmorphism effects and animations
- **Recipe Management**: View all public recipes or manage your personal collection
- **Real-time Feedback**: Interactive loading states and smooth animations
- **Cross-Platform**: Works on desktop, tablet, and mobile devices

## 🚀 Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks
- **Vanilla JavaScript** - No TypeScript for simplicity
- **CSS-in-JS** - Styled components with advanced effects
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **JWT Authentication** - Secure user sessions
- **bcryptjs** - Password hashing

### AI Integration
- **Cerebras AI** - Advanced language model for recipe generation
- **llama3.1-8b** - High-quality text generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cerebras AI API key

### Clone the Repository
```bash
git clone https://github.com/yourusername/ai-recipe-generator.git
cd ai-recipe-generator
```

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CEREBRAS_API_KEY=your_cerebras_api_key
PORT=5000
```

### Frontend Setup
```bash
cd client
npm install
```

## 🎯 Running the Application

### Start the Backend Server
```bash
cd server
npm start
```
Server will run on http://localhost:5000

### Start the Frontend
```bash
cd client
npm start
```
Frontend will run on http://localhost:3000

## 🌟 Usage

1. **Visit the Application**: Open http://localhost:3000
2. **Generate Recipes**: Enter ingredients in the search box and click "Generate Recipe"
3. **Create Account**: Sign up to save and manage your recipes
4. **Explore Recipes**: Browse all public recipes in the gallery
5. **Manage Profile**: Login to access your personal recipe collection

## 🎨 UI Features

- **Glassmorphism Design**: Modern glass-like effects with blur and transparency
- **Gradient Backgrounds**: Beautiful color transitions throughout the app
- **Smooth Animations**: Engaging hover effects and transitions
- **Floating Particles**: Dynamic background animations
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Interactive Cards**: Recipe cards with hover effects and details

## 🔐 Authentication

- User registration with email and password
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes for user-specific features
- Persistent login sessions

## � API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Recipes
- `POST /api/recipes/generate` - Generate new recipe with AI
- `GET /api/recipes` - Get all public recipes
- `GET /api/recipes/my` - Get user's recipes (protected)

## 🛠️ Development

### Project Structure
```
ai-recipe-generator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Server entry point
│   ├── package.json
│   └── .env              # Environment variables
├── .gitignore
└── README.md
```

### Environment Variables
Make sure to set up your environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CEREBRAS_API_KEY`: API key for Cerebras AI
- `PORT`: Server port (default: 5000)

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Ensure MongoDB Atlas is accessible

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build directory
3. Update API endpoints to use production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **Cerebras AI** for providing the AI model
- **MongoDB Atlas** for cloud database services
- **React Team** for the amazing framework
- **Express.js** for the robust backend framework

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ and AI** 🤖✨

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/recipes/generate` - Generate AI recipe (public)
- `GET /api/recipes` - Get all recipes (public)
- `GET /api/recipes/my` - Get user's recipes (protected)

## Getting Started
1. **Backend**: `cd server && npm start`
2. **Frontend**: `cd client && npm start`
3. **Access**: Frontend at http://localhost:3000, Backend at http://localhost:5000

## Environment Variables
- `MONGO_URI`: MongoDB Atlas connection string
- `CEREBRAS_API_KEY`: Cerebras AI API key
- `JWT_SECRET`: Secret for JWT token signing
- `PORT`: Server port (default: 5000)
