import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  
  // Signup form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    code: ''
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupLoading, setSignupLoading] = useState(false);

  const toggleForm = () => {
    setIsAnimating(true);
    
    // Reset form errors when switching
    setLoginError('');
    setSignupErrors({});
    
    setTimeout(() => {
      setIsLoginForm(!isLoginForm);
      setIsAnimating(false);
    }, 500); // Match this with CSS transition time
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await axiosClient.get('/sanctum/csrf-cookie');
      const response = await axiosClient.post('/api/login', {
        email,
        password
      });

      if (response.data.token) {
        login(response.data.token, response.data.user);
        if (response.data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/adherent/dashboard');
        }
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Les informations d\'identification sont incorrectes.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupErrors({});
    setSignupLoading(true);

    try {
      await axiosClient.get('/sanctum/csrf-cookie');
      const response = await axiosClient.post('/api/register', formData);

      if (response.data.token) {
        // Auto switch to login form after successful registration
        toggleForm();
        
        // Optional: Auto-fill login form with registered email
        setEmail(formData.email);
        
        // Optional: Show success message
        setLoginSuccess('Inscription réussie! Vous pouvez maintenant vous connecter.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setSignupErrors(err.response.data.errors);
      } else {
        setSignupErrors({
          general: err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
        });
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${isAnimating ? 'animating' : ''}`}>
        <div className={`forms-container ${isLoginForm ? 'login-visible' : 'signup-visible'}`}>
          {/* Login Form */}
          <div className="form-section login-form">
            <h2>Se connecter</h2>
            <p className="auth-subtitle">Transformez les opportunités en réalité.</p>
            {loginSuccess && <div className="auth-success">{loginSuccess}</div>}
            {loginError && <div className="auth-error">{loginError}</div>}
            
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
          
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loginLoading}
              >
                {loginLoading ? 'Connexion en cours...' : 'CONNEXION'}
              </button>
            </form>
          </div>
          
          {/* Signup Form */}
          <div className="form-section signup-form">
            <h2>Inscription</h2>
            <p className="auth-subtitle">Rejoignez-nous et donnez vie à votre avenir professionnel.</p>
            
            {signupErrors.general && <div className="auth-error">{signupErrors.general}</div>}
            
           <form onSubmit={handleSignupSubmit}>
  {/* Nom + Prénom sur une même ligne */}
  <div className="form-row">
    <div className="form-group half-width">
      <input
        type="text"
        placeholder="Nom"
        name="nom"
        value={formData.nom}
        onChange={handleSignupChange}
        required
        className={signupErrors.nom ? 'error' : ''}
      />
      {signupErrors.nom && <div className="error-text">{signupErrors.nom}</div>}
    </div>

    <div className="form-group half-width">
      <input
        type="text"
        placeholder="Prénom"
        name="prenom"
        value={formData.prenom}
        onChange={handleSignupChange}
        required
        className={signupErrors.prenom ? 'error' : ''}
      />
      {signupErrors.prenom && <div className="error-text">{signupErrors.prenom}</div>}
    </div>
  </div>

  {/* Email */}
  <div className="form-group">
    <input
      type="email"
      placeholder="Email"
      name="email"
      value={formData.email}
      onChange={handleSignupChange}
      required
      className={signupErrors.email ? 'error' : ''}
    />
    {signupErrors.email && <div className="error-text">{signupErrors.email}</div>}
  </div>

  {/* Mot de passe + Confirmation */}
  <div className="form-row">
    <div className="form-group half-width">
      <input
        type="password"
        placeholder="Mot de passe"
        name="password"
        value={formData.password}
        onChange={handleSignupChange}
        required
        className={signupErrors.password ? 'error' : ''}
      />
      {signupErrors.password && <div className="error-text">{signupErrors.password}</div>}
    </div>

    <div className="form-group half-width">
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        name="password_confirmation"
        value={formData.password_confirmation}
        onChange={handleSignupChange}
        required
      />
    </div>
  </div>

  {/* Code d'inscription */}
  <div className="form-group">
    <input
      type="text"
      placeholder="Code d'inscription"
      name="code"
      value={formData.code}
      onChange={handleSignupChange}
      required
      className={signupErrors.code ? 'error' : ''}
    />
    {signupErrors.code && <div className="error-text">{signupErrors.code}</div>}
  </div>

  <button 
    type="submit" 
    className="auth-button"
    disabled={signupLoading}
  >
    {signupLoading ? 'Inscription en cours...' : 'S\'INSCRIRE'}
  </button>
</form>

          </div>
        </div>
        
        {/* Overlay section */}
        <div className={`overlay-container ${isLoginForm ? 'login-overlay' : 'signup-overlay'}`}>
          <div className="overlay">
            <div className={`overlay-panel ${isLoginForm ? 'overlay-right' : 'overlay-left'}`}>
              {isLoginForm ? (
                <>
                  <h2>Salut !</h2>
                  <p>Inscrivez-vous et développez votre réseau professionnel dès aujourd’hui !</p>
                  <button className="auth-button ghost" onClick={toggleForm}>
                    S'INSCRIRE
                  </button>
                </>
              ) : (
                <>
                  <h2>Bon retour !</h2>
                  <p>Connectez-vous pour accéder à votre compte et continuer votre parcours</p>
                  <button className="auth-button ghost" onClick={toggleForm}>
                    SE CONNECTER
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;