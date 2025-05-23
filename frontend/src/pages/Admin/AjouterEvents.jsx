import React, { useState } from 'react';
import { axiosClient } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';

const AjouterEvents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState(null);
    
    // État pour les données du formulaire
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        date_event: '',
        photo: null
    });

    // Gérer les changements dans les champs de texte
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Gérer le changement de fichier photo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                photo: file
            });
            
            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Créer un objet FormData pour envoyer les données multipart/form-data
            const data = new FormData();
            data.append('titre', formData.titre);
            data.append('description', formData.description);
            data.append('date_event', formData.date_event);
            if (formData.photo) {
                data.append('photo', formData.photo);
            }
            
            // Si l'utilisateur est connecté, ajouter son ID
            if (user) {
                data.append('created_by', user.id);
            }
            
            // Envoyer les données au backend
            const response = await axiosClient.post('/api/events', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
           
            setSuccess('Événement ajouté avec succès!');
            // Réinitialiser le formulaire
            setFormData({
                titre: '',
                description: '',
                date_event: '',
                photo: null
            });
            setPreview(null);
            
            // Rediriger vers la liste des événements après 2 secondes
            setTimeout(() => {
                navigate('/admin/events');
            }, 2000);
            
        } catch (err) {
            console.error('Erreur lors de l\'ajout de l\'événement:', err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'ajout de l\'événement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">Ajouter un nouvel événement</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            )}
                            
                            {success && (
                                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                                    {success}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Titre de l'événement*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="titre"
                                        value={formData.titre}
                                        onChange={handleChange}
                                        required
                                        placeholder="Entrez le titre de l'événement"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Entrez une description de l'événement"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Date et heure de l'événement*</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="date_event"
                                        value={formData.date_event}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Photo de l'événement</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Formats acceptés: JPG, PNG, GIF
                                    </Form.Text>
                                </Form.Group>
                                
                                {preview && (
                                    <div className="mb-3">
                                        <p>Aperçu:</p>
                                        <img 
                                            src={preview} 
                                            alt="Aperçu" 
                                            style={{ maxWidth: '100%', maxHeight: '300px' }} 
                                            className="img-thumbnail"
                                        />
                                    </div>
                                )}
                                
                                <div className="d-flex justify-content-between mt-4">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/admin/events')}
                                    >
                                        Annuler
                                    </Button>
                                    
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                <span className="ms-2">Chargement...</span>
                                            </>
                                        ) : (
                                            'Ajouter l\'événement'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AjouterEvents;