import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConsulterEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('date_event');
    const [sortDirection, setSortDirection] = useState('desc');
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // État pour la modification d'un événement
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        date_event: '',
        photo: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    // État pour la confirmation de suppression
    const [eventToDelete, setEventToDelete] = useState(null);

    //pour faire Read more :)
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Chargement des événements
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/events');
            setEvents(response.data);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des événements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour trier les événements
    const handleSort = (criteria) => {
        if (criteria === sortCriteria) {
            // Inverser la direction si on clique sur le même critère
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Nouveau critère, commencer par ordre ascendant
            setSortCriteria(criteria);
            setSortDirection('asc');
        }
    };

    // Événements triés
    const sortedEvents = [...events].sort((a, b) => {
        let comparison = 0;

        if (sortCriteria === 'titre') {
            comparison = a.titre.localeCompare(b.titre);
        } else if (sortCriteria === 'date_event') {
            comparison = new Date(a.date_event) - new Date(b.date_event);
        } else if (sortCriteria === 'created_at') {
            comparison = new Date(a.created_at) - new Date(b.created_at);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    // Gestion des inputs du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Gestion de l'upload d'image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            // Créer une URL pour prévisualiser l'image
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Initialisation du formulaire de modification
    const handleEditClick = (event) => {
        setEditingEvent(event);
        setFormData({
            titre: event.titre,
            description: event.description,
            date_event: event.date_event.replace(' ', 'T'), 
            photo: null 
        });
        setPreviewImage(event.photo ? `${import.meta.env.VITE_BACKEND_URL}/storage/${event.photo}` : null);
    };

    // Annulation de la modification
    const handleCancelEdit = () => {
        setEditingEvent(null);
        setFormData({
            titre: '',
            description: '',
            date_event: '',
            photo: null
        });
        setPreviewImage(null);
    };

    // Soumission du formulaire de modification
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('titre', formData.titre);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('date_event', formData.date_event);
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }
            formDataToSend.append('_method', 'PUT');

            await axiosClient.post(`/api/events/${editingEvent.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Rafraîchir la liste des événements
            fetchEvents();
            handleCancelEdit();
        } catch (err) {
            setError('Erreur lors de la modification de l\'événement');
            console.error(err);
        }
    };

    // Confirmation de suppression
    const handleDeleteConfirmation = (event) => {
        setEventToDelete(event);
    };

    // Annulation de la suppression
    const handleCancelDelete = () => {
        setEventToDelete(null);
    };

    // Suppression d'un événement
    const handleDeleteEvent = async () => {
        if (!eventToDelete) return;

        try {
            await axiosClient.delete(`/api/events/${eventToDelete.id}`);
            setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
            setEventToDelete(null);
        } catch (err) {
            setError('Erreur lors de la suppression de l\'événement');
            console.error(err);
        }
    };

    // Formater la date pour l'affichage
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
        } catch (err) {
            return dateString;
        }
    };

    if (loading) return <div className="text-center p-5">Chargement des événements...</div>;

    return (
        <div className="container py-4">
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                <h1 className="m-0">Gestion des Événements</h1>
                <div className="btn-group">
                    <button
                        type="button"
                        className="btn btn-outline-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Trier par {sortCriteria === 'titre' ? 'titre' : sortCriteria === 'date_event' ? 'date' : 'date de création'} ({sortDirection === 'asc' ? '↑' : '↓'})
                    </button>
                    <ul className="dropdown-menu">
                        <li><button className="dropdown-item" onClick={() => handleSort('titre')}>Titre</button></li>
                        <li><button className="dropdown-item" onClick={() => handleSort('date_event')}>Date d'événement</button></li>
                        <li><button className="dropdown-item" onClick={() => handleSort('created_at')}>Date de création</button></li>
                    </ul>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {eventToDelete && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmer la suppression</h5>
                                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete.titre}" ?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                                    Annuler
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteEvent}>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire de modification */}
            {editingEvent && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Modifier l'événement</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="titre" className="form-label">Titre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="titre"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="date_event" className="form-label">Date de l'événement</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="date_event"
                                    name="date_event"
                                    value={formData.date_event}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="photo" className="form-label">Photo (facultatif)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="photo"
                                    name="photo"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <div className="mt-2">
                                        <p className="text-muted mb-1">Aperçu de l'image :</p>
                                        <img
                                            src={previewImage}
                                            alt="Aperçu"
                                            className="img-thumbnail"
                                            style={{ maxHeight: '200px' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn btn-secondary"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste des événements */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {events.length === 0 ? (
                    <div className="col-12 text-center text-muted">
                        <p>Aucun événement trouvé.</p>
                    </div>
                ) : (
                    sortedEvents.map(event => (
                        <div key={event.id} className="col">
                            <div className="card h-100">
                                {event.photo && (
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/${event.photo}`}
                                        className="card-img-top"
                                        alt={event.titre}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">{event.titre}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{formatDate(event.date_event)}</h6>
                                    <p className="card-text">
                                        {expandedDescriptions[event.id] || event.description.length <= 150
                                            ? event.description
                                            : `${event.description.slice(0, 150)}...`
                                        }
                                        {event.description.length > 150 && (
                                            <span
                                                onClick={() => toggleDescription(event.id)}
                                                className="text-primary"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {expandedDescriptions[event.id] ? ' Voir moins' : ' Lire plus'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="card-footer d-flex justify-content-end gap-2">
                                    <button
                                        onClick={() => handleEditClick(event)}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDeleteConfirmation(event)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConsulterEvents;