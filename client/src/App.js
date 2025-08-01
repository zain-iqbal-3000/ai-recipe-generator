import React, { useState, useEffect } from 'react';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Load existing recipes
    fetchRecipes();
  }, []);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:5000/api/recipes/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setRecipes([data, ...recipes]);
      setIngredients('');
      setSelectedRecipe(data);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Failed to generate recipe. Please make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
        if (data.length > 0 && !selectedRecipe) {
          setSelectedRecipe(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleAuth = async (email, password, username = '') => {
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const body = authMode === 'login' 
      ? { email, password }
      : { username, email, password };

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowAuth(false);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Navigation Header */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🍳
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
                CookAI
              </h1>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>
                AI Recipe Generator
              </p>
            </div>
          </div>
          
          <div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}>
                  👋 {user.username}
                </span>
                <button 
                  onClick={logout}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  border: 'none',
                  borderRadius: '20px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                ✨ Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem 3rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          marginBottom: '1.5rem',
          lineHeight: '1.1'
        }}>
          Turn Your Ingredients Into Magic ✨
        </h1>
        
        <p style={{
          fontSize: '1.3rem',
          opacity: 0.9,
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          AI-powered recipe generation that creates personalized, detailed recipes from whatever you have in your kitchen
        </p>
        
        {/* Recipe Input Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔥</div>
          
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter ingredients (e.g. salmon, asparagus, lemon, garlic)"
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              fontSize: '1.1rem',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#333',
              outline: 'none',
              marginBottom: '1.5rem',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleGenerate();
              }
            }}
          />
          
          <button
            onClick={handleGenerate}
            disabled={loading || !ingredients.trim()}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              borderRadius: '15px',
              background: loading || !ingredients.trim() 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: 'none',
              cursor: loading || !ingredients.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !ingredients.trim() ? 0.6 : 1
            }}
          >
            {loading ? (
              <span>🔄 Creating Recipe...</span>
            ) : (
              '✨ Generate Recipe'
            )}
          </button>
        </div>
      </section>

      {/* Recipe Display */}
      {selectedRecipe && (
        <section style={{
          maxWidth: '1000px',
          margin: '2rem auto',
          padding: '0 2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Recipe Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              padding: '2.5rem 2rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 900,
                margin: '0 0 1rem',
                lineHeight: '1.2'
              }}>
                {selectedRecipe.title}
              </h1>
              {selectedRecipe.description && (
                <p style={{
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  maxWidth: '600px',
                  margin: '0 auto 1.5rem',
                  lineHeight: '1.6'
                }}>
                  {selectedRecipe.description}
                </p>
              )}
              
              {/* Recipe Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {selectedRecipe.cookingTime && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    ⏰ {selectedRecipe.cookingTime}
                  </div>
                )}
                {selectedRecipe.servings && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    👥 {selectedRecipe.servings}
                  </div>
                )}
                {selectedRecipe.difficulty && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    📊 {selectedRecipe.difficulty}
                  </div>
                )}
              </div>
            </div>

            {/* Recipe Content */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 768 ? '1fr 2fr' : '1fr',
              gap: '0'
            }}>
              {/* Ingredients */}
              <div style={{
                background: '#ffeaa7',
                padding: '2rem',
                color: '#2d3436'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🥘 Ingredients
                </h2>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '15px',
                  padding: '1.5rem'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} style={{
                        padding: '0.5rem 0',
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderBottom: index < selectedRecipe.ingredients.length - 1 ? '1px solid rgba(45, 52, 54, 0.1)' : 'none'
                      }}>
                        • {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                background: '#ffffff',
                padding: '2rem',
                color: '#2d3436'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#00b894',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👨‍🍳 Instructions
                </h2>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedRecipe.instructions && selectedRecipe.instructions.split('\n').filter(instruction => instruction.trim()).map((instruction, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        background: '#00b894',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{
                        flex: 1,
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        fontWeight: 400
                      }}>
                        {instruction.replace(/^\d+\.\s*/, '')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recipe Collection */}
      {recipes.length > 0 && (
        <section style={{
          maxWidth: '1000px',
          margin: '2rem auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            Your Recipe Collection
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {recipes.map((recipe, index) => (
              <div
                key={recipe._id || index}
                onClick={() => setSelectedRecipe(recipe)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  border: selectedRecipe === recipe 
                    ? '2px solid rgba(255, 255, 255, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: '0 0 0.5rem',
                  lineHeight: '1.3'
                }}>
                  {recipe.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  opacity: 0.8,
                  margin: '0 0 1rem',
                  lineHeight: '1.4'
                }}>
                  {recipe.ingredients && recipe.ingredients.slice(0, 3).join(', ')}
                  {recipe.ingredients && recipe.ingredients.length > 3 && '...'}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  opacity: 0.7
                }}>
                  {recipe.cookingTime && <span>⏰ {recipe.cookingTime}</span>}
                  {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!selectedRecipe && recipes.length === 0 && (
        <section style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.6 }}>🍽️</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Ready to Cook Something Amazing?
          </h2>
          <p style={{
            fontSize: '1rem',
            opacity: 0.7,
            lineHeight: '1.6',
            margin: 0
          }}>
            Enter your ingredients above and let our AI create personalized recipes with detailed instructions!
          </p>
        </section>
      )}

      {/* Authentication Modal */}
      {showAuth && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '350px',
            width: '90%',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                {authMode === 'login' ? 'Welcome Back!' : 'Join CookAI'}
              </h2>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '0.9rem' }}>
                {authMode === 'login' ? 'Sign in to save your recipes' : 'Create an account to get started'}
              </p>
            </div>

            <AuthForm onSubmit={handleAuth} mode={authMode} />

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  opacity: 0.8
                }}
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Auth Form Component
function AuthForm({ onSubmit, mode }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.email, formData.password, formData.username);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {mode === 'register' && (
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#333'
          }}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#333'
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#333'
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );
}

export default App;
