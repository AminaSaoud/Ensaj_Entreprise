import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/newmain.css';


const LayoutNew = () => {
  // Déterminer l'état initial de la sidebar en fonction de la taille de l'écran
  const initialCollapsed = window.innerWidth <= 768;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();



  useEffect(() => {
    // Console.log pour déboguer
    console.log('État de la sidebar:', {
      sidebarCollapsed,
      mobileSidebarOpen,
      windowWidth: window.innerWidth
    });
  }, [sidebarCollapsed, mobileSidebarOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      // Sur mobile, on gère l'ouverture/fermeture
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // Sur desktop, on gère l'expansion/réduction
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        // Si on passe de mobile à desktop, fermer la sidebar mobile
        setMobileSidebarOpen(false);
      } else {
        // Si on passe de desktop à mobile, s'assurer que la sidebar est fermée
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer la sidebar mobile quand on change de page
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="app-container">
      {/* Overlay pour mobile */}
      <div
        className={`overlay ${mobileSidebarOpen ? 'active' : ''}`}
        id="sidebarOverlay"
        onClick={() => setMobileSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'active' : ''}`}
        id="sidebar"
      >
        <ul className="side-menu">
          <li>
            <Link
              to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/adherent/dashboard'}
              className={
                location.pathname === '/admin/dashboard' || location.pathname === '/adherent/dashboard' ? 'active' : ''
              }
            >
              <i className='bx bxs-dashboard'></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to={user?.role === 'ADMIN' ? '/admin/events' : '/adherent/events'}
              className={
                location.pathname === '/adherent/events' || location.pathname === '/admin/events' ? 'active' : ''
              }
            >
              <i className='bx bxs-calendar'></i>
              <span>Événements</span>
            </Link>
          </li>

          {/* Pour les admins */}
          {user?.role === 'ADMIN' && (
            <>
              <li>
                <Link
                  to="/admin/events/consult"
                  className={location.pathname === '/admin/events/consult' ? 'active' : ''}
                >
                  <i className='bx bxs-calendar'></i>
                  <span>Consulter Événement</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={location.pathname === '/admin/users' ? 'active' : ''}
                >
                  <i className='bx bxs-group'></i>
                  <span>Utilisateurs</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/codes"
                  className={location.pathname === '/admin/codes' ? 'active' : ''}
                >
                  <i className='bx bxs-key'></i>
                  <span>Codes</span>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              to={user?.role === 'ADMIN' ? '/admin/compte' : '/adherent/compte'}
              className={
                location.pathname === '/adherent/compte' || location.pathname === '/admin/compte' ? 'active' : ''
              }
            >
              <i className='bx bxs-user'></i>
              <span>Mon Compte</span>
            </Link>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
              <i className='bx bxs-log-out'></i>
              <span>Déconnexion</span>
            </a>
          </li>
        </ul>
      </div>

      {/* Contenu principal */}
      <div
        className={`content ${sidebarCollapsed ? 'collapsed' : ''}`}
        id="content"
      >
        {/* Navbar */}
        <div className="navbar">
          <button className="btn btn-light" onClick={toggleSidebar}>
            <i className='bx bx-menu'></i>
          </button>

          <div className="user-profile">
            <span>Bonjour, {user?.prenom || 'Utilisateur'} {user?.nom || ''}</span>
          </div>
        </div>

        {/* Contenu des pages */}
        <div className="container-fluid p-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutNew;