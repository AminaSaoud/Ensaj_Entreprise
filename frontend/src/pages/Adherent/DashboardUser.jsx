import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { axiosClient } from '../../api/axios';
import { Card, Row, Col, Table, Badge, Spinner, Alert, Tabs, Tab, ProgressBar, Dropdown } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardUser = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalEvents: 0,
        eventsAsParticipant: 0,
        eventsAsOrganizer: 0,
        presenceStats: { present: 0, absent: 0 },
        upcomingEvents: [],
        pastEvents: [],
        monthlyStats: [],
        eventsByRole: []
    });
    const [filterPeriod, setFilterPeriod] = useState('all');

    // Couleurs pour les graphiques
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const PRESENCE_COLORS = ['#4CAF50', '#F44336']; 

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                setLoading(true);

                // Récupérer les statistiques de participation
                const participationsResponse = await axiosClient.get('/api/user/participations');

                // Récupérer les événements à venir
                const upcomingEventsResponse = await axiosClient.get('/api/user/events/upcoming');

                // Récupérer les événements passés
                const pastEventsResponse = await axiosClient.get('/api/user/events/past');

                // Récupérer les statistiques mensuelles
                const monthlyStatsResponse = await axiosClient.get(`/api/user/stats/monthly?period=${filterPeriod}`);

                // Compiler les statistiques
                const participations = participationsResponse.data;
                const participantEvents = participations.filter(p => p.role === 'participant');
                const organizerEvents = participations.filter(p => p.role === 'organisateur');
                const presentEvents = participations.filter(p => p.statut_presence === 'present');
                const absentEvents = participations.filter(p => p.statut_presence === 'absent');

                setStats({
                    totalEvents: participations.length,
                    eventsAsParticipant: participantEvents.length,
                    eventsAsOrganizer: organizerEvents.length,
                    presenceStats: {
                        present: presentEvents.length,
                        absent: absentEvents.length
                    },
                    upcomingEvents: upcomingEventsResponse.data,
                    pastEvents: pastEventsResponse.data,
                    monthlyStats: monthlyStatsResponse.data,
                    eventsByRole: [
                        { name: 'Participant', value: participantEvents.length },
                        { name: 'Organisateur', value: organizerEvents.length }
                    ]
                });

                setLoading(false);
            } catch (err) {
                console.error('Erreur lors de la récupération des statistiques:', err);
                setError('Impossible de charger les statistiques. Veuillez réessayer plus tard.');
                setLoading(false);
            }
        };

        if (user) {
            fetchUserStats();
        }
    }, [user, filterPeriod]);

    const handlePeriodChange = (period) => {
        setFilterPeriod(period);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Chargement des statistiques...</span>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // Calcul du taux de présence
    const presenceRate = stats.totalEvents > 0
        ? Math.round((stats.presenceStats.present / stats.totalEvents) * 100)
        : 0;

    // Données pour le graphique en camembert de présence
    const presenceData = [
        { name: 'Présent', value: stats.presenceStats.present },
        { name: 'Absent', value: stats.presenceStats.absent }
    ];

    return (
        <div className="dashboard-container py-4">
            <div className="container">
                <h2 className="mb-4">Tableau de bord de {user?.prenom} {user?.nom}</h2>

                {/* Cartes récapitulatives */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Total d'événements</Card.Title>
                                <h1 className="display-4">{stats.totalEvents}</h1>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>En tant que participant</Card.Title>
                                <h1 className="display-4">{stats.eventsAsParticipant}</h1>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>En tant qu'organisateur</Card.Title>
                                <h1 className="display-4">{stats.eventsAsOrganizer}</h1>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Taux de présence</Card.Title>
                                <h1 className="display-4">{presenceRate}%</h1>
                                <ProgressBar
                                    variant={presenceRate > 75 ? "success" : presenceRate > 50 ? "info" : presenceRate > 25 ? "warning" : "danger"}
                                    now={presenceRate}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Ligne pour les graphiques */}
                <Row className="mb-4">
                    <Col md={6}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Répartition par rôle</Card.Title>
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.eventsByRole}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {stats.eventsByRole.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} événements`, 'Nombre']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Statistiques de présence</Card.Title>
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={presenceData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {presenceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PRESENCE_COLORS[index % PRESENCE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} événements`, 'Nombre']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Statistiques mensuelles */}
                <Card className="shadow-sm mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Évolution mensuelle des participations</h5>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-period">
                                {filterPeriod === 'all' ? 'Toute la période' :
                                    filterPeriod === 'year' ? 'Cette année' :
                                        filterPeriod === 'semester' ? 'Ce semestre' :
                                            'Les 3 derniers mois'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handlePeriodChange('all')}>Toute la période</Dropdown.Item>
                                <Dropdown.Item onClick={() => handlePeriodChange('year')}>Cette année</Dropdown.Item>
                                <Dropdown.Item onClick={() => handlePeriodChange('semester')}>Ce semestre</Dropdown.Item>
                                <Dropdown.Item onClick={() => handlePeriodChange('quarter')}>Les 3 derniers mois</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Card.Header>
                    <Card.Body>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.monthlyStats}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="present" name="Présent" fill="#4CAF50" />
                                    <Bar dataKey="absent" name="Absent" fill="#F44336" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>

                {/* Onglets pour les événements */}
                <Tabs defaultActiveKey="upcoming" className="mb-4">
                    <Tab eventKey="upcoming" title="Événements à venir">
                        {stats.upcomingEvents.length > 0 ? (
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>Événement</th>
                                        <th>Date</th>
                                        <th>Rôle</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.upcomingEvents.map(event => (
                                        <tr key={event.id}>
                                            <td>{event.titre}</td>
                                            <td>{new Date(event.date_event).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                <Badge bg={event.role === 'organisateur' ? 'primary' : 'info'}>
                                                    {event.role === 'organisateur' ? 'Organisateur' : 'Participant'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={event.statut_presence === 'present' ? 'success' : 'danger'}>
                                                    {event.statut_presence === 'present' ? 'Présent' : 'Absent'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Alert variant="info">Aucun événement à venir.</Alert>
                        )}
                    </Tab>
                    <Tab eventKey="past" title="Événements passés">
                        {stats.pastEvents.length > 0 ? (
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>Événement</th>
                                        <th>Date</th>
                                        <th>Rôle</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.pastEvents.map(event => (
                                        <tr key={event.id}>
                                            <td>{event.titre}</td>
                                            <td>{new Date(event.date_event).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                <Badge bg={event.role === 'organisateur' ? 'primary' : 'info'}>
                                                    {event.role === 'organisateur' ? 'Organisateur' : event.role ? 'Participant' : ''}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={event.statut_presence === 'present' ? 'success' : 'danger'}>
                                                    {event.statut_presence === 'present' ? 'Présent' : 'Absent'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Alert variant="info">Aucun événement passé.</Alert>
                        )}
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};

export default DashboardUser;