import React, { useState } from 'react';
import { axiosClient } from '../api/axios';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';


const QaPage = () => {
  // État initial du formulaire
  const initialFormState = {
    nom: '',
    prenom: '',
    email: '',
    question: '',
    message: ''
  };

  // États
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Envoi vers l'API backend
      const response = await axiosClient.post('/api/qa/send', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData(initialFormState); // Réinitialiser le formulaire
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de l\'envoi de votre message.'
      );
    } finally {
      setLoading(false);
    }
  };

return (
    <>
  <Container className="py-4">
    <Row className="justify-content-center">
      <Col md={8}>
        <Card>
          <Card.Header className="bg-bleu-marine text-center">
            <h4 className="mb-0">Posez-nous votre question</h4>
          </Card.Header>
          <Card.Body>
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                <Alert.Heading>Succès !</Alert.Heading>
                <p>Votre question a bien été envoyée, merci !</p>
              </Alert>
            )}

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                <Alert.Heading>Erreur</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
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
                  placeholder="Votre prénom"
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
                  placeholder="votre.email@exemple.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  placeholder="Votre question en une phrase"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Message à l'équipe</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Détaillez votre question ici..."
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button type="submit" className="btn-bleu-marine" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Envoi en cours...</span>
                    </>
                  ) : (
                    'Envoyer ma question'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>

  <style>{`
    .bg-bleu-marine {
      background-color: #0a1e3c !important;
      color: white !important;
    }

    .btn-bleu-marine {
      background-color: #0a1e3c !important;
      border-color: #0a1e3c !important;
      color: white !important;
    }

    .btn-bleu-marine:hover {
      background-color: #12263a !important;
      border-color: #12263a !important;
    }
  `}</style>
  </>
);

};

export default QaPage;