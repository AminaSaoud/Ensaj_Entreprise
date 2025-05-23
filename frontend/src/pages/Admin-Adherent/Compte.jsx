import React, { useEffect, useState } from "react";
import { axiosClient } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/CompteStyles.css";

const Compte = () => {
  const { user, setUser, logout, refreshUser} = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user.prenom || "",
        nom: user.nom || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handlePasswordChange = (e) => {
    setPasswordData({...passwordData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await axiosClient.put("/api/user/update", formData);
      setUser(res.data);
      setSuccessMessage("Informations mises à jour avec succès.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur détaillée:", err.response);
      setErrorMessage(`Erreur lors de la mise à jour: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosClient.put("/api/user/change-password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      setSuccessMessage(res.data.message || "Mot de passe modifié avec succès.");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors du changement de mot de passe.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      setErrorMessage("Erreur lors de la déconnexion");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Alertes de succès/erreur */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage("")}></button>
        </div>
      )}

      <div className="card shadow border-0">
        <div className="card-header bg-primary bg-gradient text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="m-0">
              <i className="fas fa-user-cog me-2"></i> Paramètres du profil
            </h2>
            <div className="d-flex gap-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline-light"
                >
                  <i className="fas fa-key me-2"></i> Modifier mot de passe
                </button>
              ) : null}
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
              >
                <i className="fas fa-sign-out-alt me-2"></i> Déconnexion
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {/* Avatar et informations principales */}
          <div className="text-center mb-4">
            <div className="avatar-circle mx-auto mb-3">
              <span className="avatar-initials">
                {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "U"}
              </span>
            </div>
            <h3 className="fw-bold">{user?.prenom} {user?.nom}</h3>
            <span className="badge bg-primary px-3 py-2 rounded-pill">
              {user?.role || "USER"}
            </span>
          </div>

          {/* Informations personnelles */}
          <div className="card mb-4 bg-light">
            <div className="card-header bg-light">
              <h4 className="card-title mb-0">
                <i className="fas fa-user me-2"></i> Informations personnelles
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-user me-2"></i> Prénom
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        className="form-control"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-user me-2"></i> Nom
                      </label>
                      <input
                        type="text"
                        name="nom"
                        className="form-control"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-envelope me-2"></i> Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Chargement...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i> Mettre à jour
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Section Admin uniquement */}
          {user.role === 'ADMIN' && (
            <div className="card mb-4 bg-light">
              <div className="card-header bg-light">
                <h4 className="card-title mb-0">
                  <i className="fas fa-shield-alt me-2"></i> Informations administrateur
                </h4>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i> Vous disposez des droits d'administration sur la plateforme.
                </div>
              </div>
            </div>
          )}

          {/* Modification du mot de passe */}
          {isEditing && (
            <div className="card mb-4 bg-light">
              <div className="card-header bg-light">
                <h4 className="card-title mb-0">
                  <i className="fas fa-key me-2"></i> Modifier le mot de passe
                </h4>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Mot de passe actuel</label>
                        <input
                          type="password"
                          name="current_password"
                          className="form-control"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Nouveau mot de passe</label>
                        <input
                          type="password"
                          name="new_password"
                          className="form-control"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Confirmer le mot de passe</label>
                        <input
                          type="password"
                          name="new_password_confirmation"
                          className="form-control"
                          value={passwordData.new_password_confirmation}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-success me-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i> Confirmer
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      <i className="fas fa-times me-2"></i> Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compte;