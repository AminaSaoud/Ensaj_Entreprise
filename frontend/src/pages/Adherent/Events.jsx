import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { axiosClient } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('date'); 
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [expandDescription, setExpandDescription] = useState(false);
  const [participation, setParticipation] = useState({
    role: 'participant',
    statut_presence: 'present' 
  });
  const [participations, setParticipations] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Fonction pour charger les événements
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/events');
      setEvents(response.data);

      // Récupérer les participations de l'utilisateur connecté
      const userParticipationsResponse = await axiosClient.get('/api/participations/user');

      // Organiser les participations par event_id pour un accès facile
      const participationsMap = {};
      userParticipationsResponse.data.forEach(p => {
        participationsMap[p.event_id] = p;
      });

      setParticipations(participationsMap);

      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des événements:', err);
      setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);


  const getSortedEvents = () => {
    if (!events.length) return [];

    return [...events].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date_event);
        const dateB = new Date(b.date_event);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'titre') {
        const titreA = a.titre.toLowerCase();
        const titreB = b.titre.toLowerCase();
        return sortOrder === 'asc'
          ? titreA.localeCompare(titreB)
          : titreB.localeCompare(titreA);
      }
      return 0;
    });
  };

  const resetModalState = () => {
    setExpandDescription(false);
  };

  const handleShowModal = (event) => {
    setSelectedEvent(event);
    resetModalState();

    // Pré-remplir le formulaire si l'utilisateur participe déjà à cet événement
    if (participations[event.id]) {
      setParticipation({
        role: participations[event.id].role || 'participant',
        statut_presence: participations[event.id].statut_presence || 'present'
      });
    } else {
      // Réinitialiser le formulaire
      setParticipation({
        role: 'participant',
        statut_presence: 'present'
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    resetModalState();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParticipation(prev => ({
      ...prev,
      [name]: value,
      statut_presence: 'present' 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setSubmitting(true);
      const payload = {
        event_id: selectedEvent.id,
        role: participation.role,
        statut_presence: 'present' 
      };

      let response;

      // Si l'utilisateur participe déjà, on fait une mise à jour (PUT)
      if (participations[selectedEvent.id]) {
        response = await axiosClient.put(
          `/api/participations/${participations[selectedEvent.id].id}`,
          { role: participation.role, statut_presence: 'present' }
        );
      } else {
        // Sinon, on crée une nouvelle participation (POST)
        response = await axiosClient.post('/api/participations', payload);
      }

      // Mettre à jour l'état local des participations
      setParticipations(prev => ({
        ...prev,
        [selectedEvent.id]: response.data
      }));

      setMessage({
        type: 'success',
        text: participations[selectedEvent.id]
          ? 'Votre participation a été mise à jour avec succès!'
          : 'Votre participation a été enregistrée avec succès!'
      });

      // Fermer la modal après un court délai
      setTimeout(() => {
        handleCloseModal();
        setMessage(null);
      }, 2000);

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la participation:', err);
      setMessage({
        type: 'danger',
        text: 'Une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour formatter la date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour obtenir le badge de participation
  const getParticipationBadge = (eventId) => {
    if (!participations[eventId]) return null;

    const { role, statut_presence } = participations[eventId];
    
    // Si l'utilisateur est marqué comme absent
    if (statut_presence === 'absent') {
      return (
        <Badge bg="danger" className="ms-2">
          Absent
        </Badge>
      );
    }
    
    // Sinon, on affiche le rôle
    if (role) {
      let badgeText = role === 'organisateur' ? 'Organisateur' : 'Participant';
      let badgeVariant = role === 'organisateur' ? 'warning' : 'info';

      return (
        <Badge bg={badgeVariant} className="ms-2">
          {badgeText}
        </Badge>
      );
    }
    
    return null;
  };

  // Construire l'URL de la photo en utilisant le stockage Laravel
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;

    // Si le chemin contient déjà l'URL complète, retournez-le tel quel
    if (photoPath.startsWith('http')) {
      return photoPath;
    }

    // Sinon, construisez l'URL avec le chemin de stockage
    return `${import.meta.env.VITE_BACKEND_URL}/storage/${photoPath}`;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Événements à venir</h2>
      {/* Contrôles de tri */}
      <div className="mb-3 d-flex align-items-center">
        <span className="me-2">Trier par:</span>
        <Form.Select
          style={{ width: 'auto' }}
          className="me-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Date</option>
          <option value="titre">Titre</option>
        </Form.Select>

        <Button
          variant="outline-secondary"
          className="ms-2"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
        </Button>
      </div>
      {events.length === 0 ? (
        <Alert variant="info">
          Aucun événement n'est disponible actuellement.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {getSortedEvents().map(event => (
            <Col key={event.id}>
              <Card className="h-100 shadow-sm">
                {event.photo && (
                  <Card.Img
                    variant="top"
                    src={getPhotoUrl(event.photo)}
                    alt={event.titre}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>
                    {event.titre}
                    {getParticipationBadge(event.id)}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {formatDate(event.date_event)}
                  </Card.Subtitle>
                  <Card.Text>
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Lieu: ENSA EL JADIDA</span>
                    <span className="text-muted">Bienvenu</span>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button
                    variant={participations[event.id] ? "outline-primary" : "primary"}
                    onClick={() => handleShowModal(event)}
                    className="w-100"
                  >
                    {participations[event.id] ? 
                      (participations[event.id].statut_presence === 'absent' ? 
                        "Modifier mon statut" : "Modifier ma participation") 
                      : "Participer"}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de participation */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {participations[selectedEvent?.id]
              ? (participations[selectedEvent?.id].statut_presence === 'absent' 
                ? "Modifier mon statut" 
                : "Modifier ma participation")
              : "Participer à l'événement"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.type} className="mb-3">
              {message.text}
            </Alert>
          )}

          {selectedEvent && (
            <>
              <h5>{selectedEvent.titre}</h5>
              <p className="text-muted">
                {formatDate(selectedEvent.date_event)}
              </p>

              <p><strong>Lieu:</strong> ENSA EL JADIDA</p>
              <p><strong>Description:</strong></p>
              <div className="event-description mb-3" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {expandDescription
                  ? selectedEvent.description
                  : selectedEvent.description.length > 150
                    ? `${selectedEvent.description.substring(0, 150)}...`
                    : selectedEvent.description}
                {selectedEvent.description.length > 150 && (
                  <Button
                    variant="link"
                    className="p-0 ms-1"
                    onClick={() => setExpandDescription(!expandDescription)}
                  >
                    {expandDescription ? 'Voir moins' : 'Lire plus'}
                  </Button>
                )}
              </div>
              {selectedEvent.photo && (
                <div className="text-center mb-3">
                  <img
                    src={getPhotoUrl(selectedEvent.photo)}
                    alt={selectedEvent.titre}
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    className="img-thumbnail"
                  />
                </div>
              )}

              <hr />

              {/* N'afficher le formulaire de rôle que si l'utilisateur n'est pas marqué comme absent */}
              {(!participations[selectedEvent?.id] || 
                participations[selectedEvent?.id].statut_presence !== 'absent') && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Votre rôle</Form.Label>
                    <Form.Select
                      name="role"
                      value={participation.role}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="participant">Participant</option>
                      <option value="organisateur">Organisateur</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">En cours...</span>
                        </>
                      ) : (
                        participations[selectedEvent?.id] ? "Mettre à jour" : "S'inscrire"
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              <div className="d-flex flex-column gap-2 mt-3">
                {participations[selectedEvent?.id] && (
                  <Button
                    variant="outline-danger"
                    onClick={async () => {
                      try {
                        setSubmitting(true);
                        await axiosClient.delete(`/api/participations/${participations[selectedEvent.id].id}`);
                        const newParticipations = { ...participations };
                        delete newParticipations[selectedEvent.id];
                        setParticipations(newParticipations);
                        setMessage({ type: 'success', text: 'Participation annulée.' });
                        setTimeout(() => {
                          handleCloseModal();
                          setMessage(null);
                        }, 2000);
                      } catch (err) {
                        console.error(err);
                        setMessage({ type: 'danger', text: 'Erreur lors de l\'annulation.' });
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    disabled={submitting}
                  >
                    Annuler ma participation
                  </Button>
                )}

                <Button
                  variant={participations[selectedEvent?.id]?.statut_presence === 'absent' ? "outline-success" : "outline-warning"}
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      
                      // Si déjà marqué comme absent, revenir à présent
                      if (participations[selectedEvent?.id]?.statut_presence === 'absent') {
                        const response = await axiosClient.put(
                          `/api/participations/${participations[selectedEvent.id].id}`,
                          { 
                            role: 'participant', 
                            statut_presence: 'present' 
                          }
                        );
                        
                        setParticipations(prev => ({
                          ...prev,
                          [selectedEvent.id]: response.data
                        }));
                        
                        setMessage({ type: 'success', text: 'Vous êtes maintenant inscrit comme présent.' });
                      } else {
                        // Sinon, marquer comme absent
                        const payload = {
                          event_id: selectedEvent.id,
                          role: null,
                          statut_presence: 'absent'
                        };

                        let response;
                        if (participations[selectedEvent.id]) {
                          response = await axiosClient.put(
                            `/api/participations/${participations[selectedEvent.id].id}`,
                            { role: null, statut_presence: 'absent' }
                          );
                        } else {
                          response = await axiosClient.post('/api/participations', payload);
                        }

                        setParticipations(prev => ({
                          ...prev,
                          [selectedEvent.id]: response.data
                        }));

                        setMessage({ type: 'success', text: 'Absence signalée.' });
                      }
                      
                      setTimeout(() => {
                        handleCloseModal();
                        setMessage(null);
                      }, 2000);
                    } catch (err) {
                      console.error(err);
                      setMessage({ type: 'danger', text: 'Erreur lors du signalement d\'absence.' });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                >
                  {participations[selectedEvent?.id]?.statut_presence === 'absent' 
                    ? "Je serai présent finalement" 
                    : "Je serai absent"}
                </Button>

                <Button variant="secondary" onClick={handleCloseModal} className="mt-2" disabled={submitting}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Events;