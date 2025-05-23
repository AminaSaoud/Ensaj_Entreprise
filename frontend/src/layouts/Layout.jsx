import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '/assets/img/NV LOGO WHITE.png'; 
import logoBlue from '/assets/img/NV LOGO ORG.png'; // Vous devrez créer cette version du logo ou adapter selon votre cas

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Fonction qui détecte le scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Ajoute l'écouteur d'événement lors du montage
    window.addEventListener('scroll', handleScroll);
    
    // Nettoie l'écouteur d'événement lors du démontage
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Vérifie si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header>
        <nav className={`navbar navbar-expand-lg ${scrolled ? 'navbar-light bg-white' : 'navbar-dark'} shadow-sm fixed-top transition-all duration-300`}
             style={{ 
               backgroundColor: scrolled ? 'white' : '#0a1e3c', // Bleu marine
               transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
             }}>
          <div className="container">
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img 
                src={scrolled ? logoBlue : logo} 
                alt="Logo ENSAJ Entreprises" 
                style={{ height: '50px', width: 'auto', marginRight: '10px', transition: 'opacity 0.3s ease' }} 
              />
            </Link>

            {/* Menu burger responsive */}
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
              style={{ borderColor: scrolled ? '#0a1e3c' : 'white' }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Liens de navigation */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto text-end">
                <li className="nav-item">
                  <Link 
                    className={`nav-link position-relative ${isActive('/') ? 'active' : ''}`} 
                    to="/"
                    style={{ color: scrolled ? '#0a1e3c' : 'white' }}
                  >
                    Home
                    <span 
                      className={`position-absolute start-0 bottom-0 w-100 ${isActive('/') ? 'nav-indicator-active' : 'nav-indicator'}`}
                      style={{ 
                        height: '2px', 
                        backgroundColor: scrolled ? '#0a1e3c' : 'white',
                        transition: 'transform 0.3s ease'
                      }}
                    ></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link position-relative ${isActive('/login') ? 'active' : ''}`} 
                    to="/login"
                    style={{ color: scrolled ? '#0a1e3c' : 'white' }}
                  >
                    Login
                    <span 
                      className={`position-absolute start-0 bottom-0 w-100 ${isActive('/login') ? 'nav-indicator-active' : 'nav-indicator'}`}
                      style={{ 
                        height: '2px', 
                        backgroundColor: scrolled ? '#0a1e3c' : 'white',
                        transition: 'transform 0.3s ease'
                      }}
                    ></span>
                  </Link>
                </li>

                    <li className="nav-item">
                  <Link 
                    className={`nav-link position-relative ${isActive('/QA') ? 'active' : ''}`} 
                    to="/QA"
                    style={{ color: scrolled ? '#0a1e3c' : 'white' }}
                  >
                    Contact
                    <span 
                      className={`position-absolute start-0 bottom-0 w-100 ${isActive('/QA') ? 'nav-indicator-active' : 'nav-indicator'}`}
                      style={{ 
                        height: '2px', 
                        backgroundColor: scrolled ? '#0a1e3c' : 'white',
                        transition: 'transform 0.3s ease'
                      }}
                    ></span>
                  </Link>
                </li>

              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Ajouter un espace pour éviter que le contenu soit caché sous la navbar fixe */}
      <div style={{ paddingTop: '80px' }}></div>

      <main>
        <Outlet />
      </main>
      
      {/* Ajouter le CSS personnalisé pour les animations */}
      <style>{`
        .nav-indicator {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .nav-indicator-active {
          transform: scaleX(1);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .nav-link:hover .nav-indicator {
          transform: scaleX(1);
        }
      `}</style>
    </>
  );
};

export default Layout;