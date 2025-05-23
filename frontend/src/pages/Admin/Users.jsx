import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, Button, Form, Table, Alert, Spinner } from 'react-bootstrap';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le modal d'ajout/modification
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'USER'
  });
  
  // État pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // État pour les messages d'alerte
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

  // Fonction pour récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs au chargement du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ouvrir le modal pour ajouter un utilisateur
  const handleAddUser = () => {
    setModalTitle('Ajouter un utilisateur');
    setEditingUser(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'USER'
    });
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier un utilisateur
  const handleEditUser = (user) => {
    setModalTitle('Modifier l\'utilisateur');
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '', 
      role: user.role
    });
    setShowModal(true);
  };

  // Préparation à la suppression d'un utilisateur
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Soumettre le formulaire pour ajouter/modifier un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      const payload = { ...formData };
      
      if (editingUser) {
        // Si le mot de passe est vide, ne pas l'inclure dans la mise à jour
        if (!payload.password) {
          delete payload.password;
        }
        
        response = await axiosClient.put(`/api/users/${editingUser.id}`, payload);
        setAlert({
          show: true,
          message: 'Utilisateur modifié avec succès!',
          variant: 'success'
        });
      } else {
        response = await axiosClient.post('/api/users', payload);
        setAlert({
          show: true,
          message: 'Utilisateur ajouté avec succès!',
          variant: 'success'
        });
      }
      
     
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Erreur lors de l\'ajout/modification de l\'utilisateur:', err);
      setAlert({
        show: true,
        message: 'Erreur lors de l\'enregistrement de l\'utilisateur. Veuillez réessayer.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      await axiosClient.delete(`/api/users/${userToDelete.id}`);
      
      // Fermer le modal de confirmation et rafraîchir la liste
      setShowDeleteModal(false);
      setUserToDelete(null);
      setAlert({
        show: true,
        message: 'Utilisateur supprimé avec succès!',
        variant: 'success'
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setAlert({
        show: true,
        message: 'Erreur lors de la suppression de l\'utilisateur. Veuillez réessayer.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Pour masquer l'alerte après quelques secondes
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Utilisateurs</h1>
        <Button variant="primary" onClick={handleAddUser}>
          <i className="fas fa-plus mr-2"></i> Ajouter un utilisateur
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {loading && !users.length ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="bg-primary text-white">
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nom}</td>
                    <td>{user.prenom}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-success'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={currentUser && currentUser.id === user.id}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal pour ajouter/modifier un utilisateur */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {editingUser ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Chargement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>
                {userToDelete.prenom} {userToDelete.nom}
              </strong>
              ? Cette action est irréversible.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Chargement...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;