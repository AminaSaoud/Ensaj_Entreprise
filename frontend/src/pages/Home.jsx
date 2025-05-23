import React from 'react';
import '../styles/main.css'; 

import { axiosClient } from '../api/axios';
import { useState } from 'react';

const Home = () => {


  
 const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('http://localhost:8000/api/contact', {
        email,
        message
      });
      alert("Message envoyé avec succès !");
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi du message.");
    }
  };




  return (
    <>
      <header className="jumbotron text-center">
        <h1>ENSAJ Entreprises</h1>
        <p className="typing-animation">
          <span>𝙀𝙩𝙪𝙙𝙞𝙖𝙣𝙩𝙨 𝙚𝙩 𝙀𝙣𝙩𝙧𝙚𝙥𝙧𝙞𝙨𝙚𝙨 : 𝙐𝙣𝙞𝙨𝙨𝙤𝙣𝙨 𝙣𝙤𝙨 𝙚𝙭𝙥𝙚𝙧𝙩𝙞𝙨𝙚𝙨 !</span>
        </p>
      </header>


      <section className="neighborhood-guides text-center">
        <div className="container">
          <h2>À Propos du club ENSAJ Entreprises</h2>
          <p>
            <b>ENSAJ Entreprises</b> est un club professionnel dynamique qui vise à renforcer le lien entre les étudiants et le monde de l'entreprise.
            À travers des ateliers, conférences et rencontres, nous préparons les futurs ingénieurs aux défis du marché du travail.
            Notre événement phare, le <b>Forum ENSAJ Entreprises,</b> est un rendez-vous incontournable favorisant les échanges entre étudiants, entreprises et experts du secteur. 
            Après une 8ᵉ édition réussie en 2024, nous préparons avec enthousiasme la 9ᵉ édition pour offrir encore plus d'opportunités et d'innovations.
            Rejoignez-nous pour enrichir vos compétences, élargir votre réseau et bâtir ensemble l'avenir professionnel des étudiants de l'ENSAJ !
          </p>
          <div className="row">
            <div className="col-md-4">
              <img src="/assets/img/AfficheForum9.png" className="img-fluid" alt="Forum9" />
              <img src="/assets/img/AfficheForum8.jpg" className="img-fluid" alt="Forum8" />
            </div>
            <div className="col-md-4">
              <img src="/assets/img/AfficheAtelier.jpg" className="img-fluid" alt="AtelierCarrière" />
              <img src="/assets/img/Report.png" className="img-fluid" alt="ReportForum" />
            </div>
            <div className="col-md-4">
              <img src="/assets/img/AfficheConférence.jpeg" className="img-fluid" alt="ConférenceInnovation" />
              <img src="/assets/img/Formation.png" className="img-fluid" alt="FormationDisteam" />
            </div>
          </div>
        </div>
      </section>

<footer id="contact" className="bg-blue-marine text-white py-4 mt-5">
      <div className="container">
        <div className="row">

          <div className="col-md-4 mb-3">
            <h5>Adresse</h5>
            <p>
              ENSAJ Entreprises<br />
              École Nationale des Sciences Appliquées d'El Jadida<br />
              Avenue Ahmed Chaouki, El Jadida 24000<br />
              Maroc
            </p>
          </div>

          <div className="col-md-4 mb-3">
            <h5>Suivez-nous</h5>
            <a href="https://www.facebook.com/profile.php?id=100064782034487&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-white me-3 footer-link">
              <i className="fab fa-facebook"></i> Facebook
            </a><br />
            <a href="https://www.linkedin.com/company/forum-ensaj-entreprises/" target="_blank" rel="noopener noreferrer" className="text-white me-3 footer-link">
              <i className="fab fa-linkedin"></i> LinkedIn
            </a><br />
            <a href="https://www.instagram.com/forum_ensaj_entreprises?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-white footer-link">
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>

          <div className="col-md-4 mb-3">
            <h5>Contactez-nous</h5>
            <form onSubmit={handleSubmit} className="small-form">
              <div className="mb-2">
                <input
                  type="email"
                  className="footer-input form-control form-control-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="footer-input form-control form-control-sm"
                  rows="2"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-sm btn-outline-light w-100 footer-button">Envoyer</button>
            </form>
          </div>

        </div>
        <hr className="bg-light opacity-25" />
        <p className="text-center mb-0">© {new Date().getFullYear()} ENSAJ Entreprises. Tous droits réservés.</p>
      </div>

      <style>{`
        .bg-blue-marine {
          background-color: #0a1e3c; /* Bleu marine */
        }
        
        .footer-link {
          transition: color 0.3s ease;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 8px;
        }
        
        .footer-link:hover {
          color: #4db6ac !important; /* Couleur d'accentuation au survol */
        }
        
        .footer-input {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .footer-input:focus {
          background-color: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.15);
        }
        
        .footer-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .footer-button:hover {
          background-color: white;
          color: #0a1e3c;
        }
        
        h5 {
          margin-bottom: 15px;
          font-weight: 600;
        }
      `}</style>
    </footer>

    </>
  );
};

export default Home;