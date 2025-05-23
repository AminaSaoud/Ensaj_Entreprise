import React, { useState, useEffect, useRef } from 'react';
import { axiosClient } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { default as autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateDetailedPDF } from '../../utils/pdfExportUtils';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const DashboardAdmin = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalParticipants: 0,
        presenceRate: 0,
        eventsThisMonth: 0,
        eventsByMonth: [],
    });
    const [events, setEvents] = useState([]);
    const [participationData, setParticipationData] = useState({
        labels: [],
        datasets: []
    });
    const [presenceData, setPresenceData] = useState({
        labels: ['Présents', 'Absents'],
        datasets: []
    });
    const [roleData, setRoleData] = useState({
        labels: ['Participants', 'Organisateurs'],
        datasets: []
    });
    const [error, setError] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [activeTab, setActiveTab] = useState('vue-generale');

   
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const lineChartRef = useRef(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Récupération des événements
                const eventsResponse = await axiosClient.get('/api/events-participates');
                setEvents(eventsResponse.data);

                // Récupération des statistiques générales
                const statsResponse = await axiosClient.get('/api/stats');
                setStats(statsResponse.data);

                // Récupération des données de participation pour les graphiques
                const participationResponse = await axiosClient.get('/api/participation-stats');

                // Configuration des données pour le graphique de participation
                const eventLabels = participationResponse.data.events.map(event => event.titre);
                setParticipationData({
                    labels: eventLabels,
                    datasets: [
                        {
                            label: 'Nombre de participants',
                            data: participationResponse.data.events.map(event => event.participant_count),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

                // Configuration des données pour le graphique de présence
                setPresenceData({
                    labels: ['Présents', 'Absents'],
                    datasets: [
                        {
                            data: [
                                participationResponse.data.presence_count,
                                participationResponse.data.absence_count
                            ],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(255, 99, 132, 0.6)'
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1,
                        },
                    ],
                });

                // Configuration des données pour le graphique des rôles
                setRoleData({
                    labels: ['Participants', 'Organisateurs'],
                    datasets: [
                        {
                            data: [
                                participationResponse.data.participant_role_count,
                                participationResponse.data.organizer_role_count
                            ],
                            backgroundColor: [
                                'rgba(153, 102, 255, 0.6)',
                                'rgba(255, 159, 64, 0.6)'
                            ],
                            borderColor: [
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1,
                        },
                    ],
                });

                // Statistiques mensuelles pour le graphique linéaire
                setMonthlyStats(participationResponse.data.monthly_stats);

            } catch (err) {
                console.error("Erreur lors du chargement des données du dashboard:", err);
                setError("Impossible de charger les données du dashboard. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Options pour les graphiques
    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Participation par événement',
            },
        },
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Taux de présence',
            },
        },
    };

    const roleOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Distribution des rôles',
            },
        },
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tendance mensuelle de participation',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Préparation des données pour le graphique linéaire
    const lineData = {
        labels: monthlyStats.map(stat => stat.month),
        datasets: [
            {
                label: 'Participants',
                data: monthlyStats.map(stat => stat.participant_count),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1
            },
            {
                label: 'Événements',
                data: monthlyStats.map(stat => stat.event_count),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
            }
        ],
    };

    // Fonction pour exporter les données en Excel
    const exportToExcel = () => {
        // Préparation des données pour l'export Excel
        const worksheetData = events.map(event => {
            const eventDate = new Date(event.date_event);
            return {
                'Titre': event.titre,
                'Description': event.description,
                'Date': format(eventDate, 'dd MMMM yyyy', { locale: fr }),
                'Créé par': event.creator ? `${event.creator.nom} ${event.creator.prenom}` : 'Aucun',
                'Nombre de participants': event.participations ? event.participations.length : 0,
                'Taux de présence': event.presence_rate ? `${event.presence_rate}%` : '0%'
            };
        });

        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(worksheetData);

        
        XLSX.utils.book_append_sheet(wb, ws, 'Événements');

        // Génération du fichier Excel
        XLSX.writeFile(wb, `Événements_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    };

    // Fonction pour exporter les données en PDF standard
    const exportToPDF = () => {
        const doc = new jsPDF();
        if (typeof doc.autoTable !== 'function' && typeof autoTable === 'function') {
            autoTable(doc, {});
        }

        // Ajout du titre
        doc.setFontSize(18);
        doc.text('Rapport des Événements', 14, 22);

        // Ajout de la date
        doc.setFontSize(11);
        doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 14, 30);

        // Ajout des statistiques générales
        doc.setFontSize(14);
        doc.text('Statistiques Générales', 14, 40);
        doc.setFontSize(11);
        doc.text(`Nombre total d'événements: ${stats.totalEvents}`, 14, 50);
        doc.text(`Nombre total de participants: ${stats.totalParticipants}`, 14, 58);
        doc.text(`Taux de présence moyen: ${stats.presenceRate}%`, 14, 66);

        // Préparation des données pour le tableau
        const tableColumn = ['Titre', 'Date', 'Participants', 'Taux de présence'];
        const tableRows = events.map(event => [
            event.titre,
            format(new Date(event.date_event), 'dd/MM/yyyy'),
            event.participations ? event.participations.length : 0,
            event.presence_rate ? `${event.presence_rate}%` : '0%'
        ]);

        // Ajout du tableau
        doc.setFontSize(14);
        doc.text('Liste des Événements', 14, 80);

        try {
           
            if (typeof doc.autoTable === 'function') {
                doc.autoTable({
                    startY: 85,
                    head: [tableColumn],
                    body: tableRows,
                    theme: 'grid',
                    headStyles: { fillColor: [66, 135, 245] }
                });
            }
            
            else if (typeof autoTable === 'function') {
                autoTable(doc, {
                    startY: 85,
                    head: [tableColumn],
                    body: tableRows,
                    theme: 'grid',
                    headStyles: { fillColor: [66, 135, 245] }
                });
            } else {
                throw new Error("La fonction autoTable n'est pas disponible");
            }
        } catch (error) {
            console.error("Erreur lors de l'utilisation d'autoTable:", error);
            doc.setFontSize(12);
            doc.setTextColor(255, 0, 0);
            doc.text("Erreur: Impossible de générer le tableau automatiquement.", 14, 85);
        }

        // Enregistrement du PDF
        doc.save(`Rapport_Événements_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    };

    // Fonction pour exporter les données en PDF détaillé avec graphiques
    const exportToDetailedPDF = () => {
        const chartRefs = {
            barChartRef,
            pieChartRef,
            lineChartRef
        };

        generateDetailedPDF(events, stats, chartRefs)
            .then(() => {
                console.log('Export PDF détaillé réussi');
            })
            .catch(error => {
                console.error('Erreur lors de l\'export PDF détaillé:', error);
            });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <h1 className="mb-4 fw-bold">Tableau de Bord Administrateur</h1>

            {/* Navigation par onglets */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'vue-generale' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vue-generale')}
                    >
                        Vue Générale
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'statistiques' ? 'active' : ''}`}
                        onClick={() => setActiveTab('statistiques')}
                    >
                        Statistiques Détaillées
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'liste-evenements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('liste-evenements')}
                    >
                        Liste des Événements
                    </button>
                </li>
            </ul>

            {/* Vue générale */}
            {activeTab === 'vue-generale' && (
                <>
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle p-3 bg-white text-primary" style={{ border: '2px solid #0d6efd' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-calendar-check" viewBox="0 0 16 16">
                                                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                            </svg>
                                        </div>
                                        <div className="ms-3">
                                            <h5 className="card-title">Total Événements</h5>
                                            <h2 className="fw-bold">{stats.totalEvents}</h2>
                                        </div>
                                    </div>
                                    <p className="card-text text-muted mt-2 small">{stats.eventsThisMonth} événements ce mois-ci</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle p-3 bg-success bg-opacity-10 text-success">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                                                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                                            </svg>
                                        </div>
                                        <div className="ms-3">
                                            <h5 className="card-title">Total Participants</h5>
                                            <h2 className="fw-bold">{stats.totalParticipants}</h2>
                                        </div>
                                    </div>
                                    <p className="card-text text-muted mt-2 small">Tous événements confondus</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle p-3 bg-purple bg-opacity-10 text-purple" style={{ backgroundColor: 'rgba(102, 16, 242, 0.1)', color: '#6610f2' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-bar-chart" viewBox="0 0 16 16">
                                                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
                                            </svg>
                                        </div>
                                        <div className="ms-3">
                                            <h5 className="card-title">Taux de Présence</h5>
                                            <h2 className="fw-bold">{stats.presenceRate}%</h2>
                                        </div>
                                    </div>
                                    <p className="card-text text-muted mt-2 small">Moyenne sur tous les événements</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            ref={barChartRef}
                                            data={participationData}
                                            options={barOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div style={{ height: '300px' }}>
                                        <Line
                                            ref={lineChartRef}
                                            data={lineData}
                                            options={lineOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div style={{ height: '300px' }}>
                                        <Pie
                                            ref={pieChartRef}
                                            data={presenceData}
                                            options={pieOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div style={{ height: '300px' }}>
                                        <Pie
                                            data={roleData}
                                            options={roleOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={exportToPDF}
                            className="btn btn-danger me-2"
                        >
                            Exporter PDF simple
                        </button>
                        <button
                            onClick={exportToDetailedPDF}
                            className="btn btn-purple me-2"
                            style={{ backgroundColor: '#6610f2', color: 'white' }}
                        >
                            Exporter PDF détaillé
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="btn btn-success"
                        >
                            Exporter en Excel
                        </button>
                    </div>
                </>
            )}

            {/* Statistiques détaillées */}
            {activeTab === 'statistiques' && (
                <div className="card">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Statistiques Détaillées</h2>

                        <div className="row mb-4">
                            <div className="col-md-6 mb-3">
                                <h5 className="mb-3">Distribution des Rôles</h5>
                                <div style={{ height: '300px' }}>
                                    <Pie
                                        data={roleData}
                                        options={roleOptions}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h5 className="mb-3">Taux de Présence</h5>
                                <div style={{ height: '300px' }}>
                                    <Pie
                                        data={presenceData}
                                        options={pieOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h5 className="mb-3">Tendance Mensuelle</h5>
                            <div style={{ height: '400px' }}>
                                <Line
                                    data={lineData}
                                    options={lineOptions}
                                />
                            </div>
                        </div>

                        <div>
                            <h5 className="mb-3">Participation par Événement</h5>
                            <div style={{ height: '400px' }}>
                                <Bar
                                    data={participationData}
                                    options={barOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste des événements */}
            {activeTab === 'liste-evenements' && (
                <div className="card">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Liste des Événements</h5>
                        <div className="btn-group">
                            <button
                                onClick={exportToPDF}
                                className="btn btn-sm btn-danger"
                            >
                                PDF Simple
                            </button>
                            <button
                                onClick={exportToDetailedPDF}
                                className="btn btn-sm btn-purple"
                                style={{ backgroundColor: '#6610f2', color: 'white' }}
                            >
                                PDF Détaillé
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="btn btn-sm btn-success"
                            >
                                Excel
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Date</th>
                                    <th>Créé par</th>
                                    <th>Participants</th>
                                    <th>Taux de présence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const eventDate = new Date(event.date_event);
                                    return (
                                        <tr key={event.id}>
                                            <td>{event.titre}</td>
                                            <td>{format(eventDate, 'dd MMMM yyyy', { locale: fr })}</td>
                                            <td>{event.creator ? `${event.creator.nom} ${event.creator.prenom}` : 'Aucun'}</td>
                                            <td>{event.participations ? event.participations.length : 0}</td>
                                            <td>{event.presence_rate ? `${event.presence_rate}%` : '0%'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;