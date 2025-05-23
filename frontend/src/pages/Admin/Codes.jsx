import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axios';
import { Modal, Button, Form, Table, Alert, Spinner, InputGroup } from 'react-bootstrap';

const Codes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le modal d'ajout de code
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCodeData, setNewCodeData] = useState({
    code: '',
    numberOfCodes: 1
  });
  const [generationType, setGenerationType] = useState('manual'); 
  
  // État pour la génération en masse
  const [generateMultiple, setGenerateMultiple] = useState(false);
  
  // État pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);
  
  // État pour les messages d'alerte
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

  // Fonction pour récupérer la liste des codes
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/codes');
      setCodes(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des codes:', err);
      setError("Erreur lors du chargement des codes. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les codes au chargement du composant
  useEffect(() => {
    fetchCodes();
  }, []);

  // Gérer les changements dans le formulaire d'ajout de code
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCodeData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer le changement de type de génération
  const handleGenerationTypeChange = (e) => {
    setGenerationType(e.target.value);
  };

  // Générer un code aléatoire
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Ajouter un ou plusieurs codes
  const handleAddCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      
      if (generationType === 'manual') {
        // Ajout manuel d'un seul code
        response = await axiosClient.post('/api/codes', { code: newCodeData.code });
        setAlert({
          show: true,
          message: 'Code ajouté avec succès!',
          variant: 'success'
        });
      } else {
        // Génération automatique de plusieurs codes
        const numberOfCodes = parseInt(newCodeData.numberOfCodes) || 1;
        response = await axiosClient.post('/api/codes/generate', { count: numberOfCodes });
        setAlert({
          show: true,
          message: `${numberOfCodes} code(s) généré(s) avec succès!`,
          variant: 'success'
        });
      }
      
      // Fermer le modal et rafraîchir la liste
      setShowAddModal(false);
      fetchCodes();
      // Réinitialiser le formulaire
      setNewCodeData({ code: '', numberOfCodes: 1 });
      setGenerationType('manual');
    } catch (err) {
      console.error("Erreur lors de l'ajout du code:", err);
      setAlert({
        show: true,
        message: "Erreur lors de l'ajout du code. Veuillez réessayer.",
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Préparation à la suppression d'un code
  const handleDeleteClick = (code) => {
    setCodeToDelete(code);
    setShowDeleteModal(true);
  };

  // Supprimer un code
  const handleDeleteCode = async () => {
    if (!codeToDelete) return;
    
    setLoading(true);
    try {
      await axiosClient.delete(`/api/codes/${codeToDelete.id}`);
      
      // Fermer le modal de confirmation et rafraîchir la liste
      setShowDeleteModal(false);
      setCodeToDelete(null);
      setAlert({
        show: true,
        message: 'Code supprimé avec succès!',
        variant: 'success'
      });
      
      fetchCodes();
    } catch (err) {
      console.error('Erreur lors de la suppression du code:', err);
      setAlert({
        show: true,
        message: 'Erreur lors de la suppression du code. Veuillez réessayer.',
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
        <h1>Gestion des Codes d'Inscription</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus mr-2"></i> Ajouter un code
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {loading && !codes.length ? (
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
                <th>Code</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">Aucun code trouvé</td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id}>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">{code.code}</code>
                    </td>
                    <td>
                      <span className={`badge ${code.is_used ? 'bg-danger' : 'bg-success'}`}>
                        {code.is_used ? 'Utilisé' : 'Disponible'}
                      </span>
                    </td>
                    <td>{new Date(code.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(code)}
                        disabled={code.is_used}
                        title={code.is_used ? "Impossible de supprimer un code déjà utilisé" : ""}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal pour ajouter un code */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un code d'inscription</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCode}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Type de génération</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="manual-generation"
                  name="generationType"
                  value="manual"
                  label="Saisie manuelle"
                  checked={generationType === 'manual'}
                  onChange={handleGenerationTypeChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="auto-generation"
                  name="generationType"
                  value="auto"
                  label="Génération automatique"
                  checked={generationType === 'auto'}
                  onChange={handleGenerationTypeChange}
                />
              </div>
            </Form.Group>

            {generationType === 'manual' ? (
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="code"
                    value={newCodeData.code}
                    onChange={handleChange}
                    placeholder="Entrez le code"
                    required
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setNewCodeData(prev => ({ ...prev, code: generateRandomCode() }))}
                  >
                    Générer
                  </Button>
                </InputGroup>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Nombre de codes à générer</Form.Label>
                <Form.Control
                  type="number"
                  name="numberOfCodes"
                  value={newCodeData.numberOfCodes}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                />
                <Form.Text className="text-muted">
                  Maximum 100 codes à la fois
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
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
          {codeToDelete && (
            <p>
              Êtes-vous sûr de vouloir supprimer le code{' '}
              <code className="bg-light px-2 py-1 rounded">{codeToDelete.code}</code>?
              Cette action est irréversible.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteCode} disabled={loading}>
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

export default Codes;