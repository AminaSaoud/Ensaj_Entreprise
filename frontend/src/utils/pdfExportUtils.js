// Importation correcte pour jspdf 3.x et jspdf-autotable 5.x
import { jsPDF } from 'jspdf';
import { default as autoTable } from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Génère un rapport PDF détaillé des événements et participations
 * @param {Array} events - Liste des événements
 * @param {Object} stats - Statistiques générales
 * @param {Object} chartRefs - Références vers les graphiques pour les capturer
 */
export const generateDetailedPDF = (events, stats, chartRefs) => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    
    if (typeof doc.autoTable !== 'function' && typeof autoTable === 'function') {
      autoTable(doc, {}); 
    }
    
    // En-tête du document
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text('Rapport des Événements', 14, 22);
    
    // Sous-titre et date
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 14, 30);
    
    // Séparateur
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);
    
    // Section des statistiques générales
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('1. Statistiques Générales', 14, 40);
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`• Nombre total d'événements: ${stats.totalEvents}`, 16, 48);
    doc.text(`• Événements ce mois-ci: ${stats.eventsThisMonth}`, 16, 54);
    doc.text(`• Nombre total de participants: ${stats.totalParticipants}`, 16, 60);
    doc.text(`• Taux de présence moyen: ${stats.presenceRate}%`, 16, 66);
    
    // Section des graphiques
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('2. Visualisation des Données', 14, 76);
    
    let yPosition = 84;
    
    // Fonction pour ajouter un graphique depuis le canvas
    const addChartToDoc = (chartRef, caption, yPos) => {
      // Vérifier si la référence au graphique existe
      if (chartRef && chartRef.current) {
        try {
          // Obtenir l'URL de l'image du canvas
          const canvas = chartRef.current.canvas;
          const imgData = canvas.toDataURL('image/png');
          
          // Ajouter l'image au PDF
          doc.addImage(imgData, 'PNG', 14, yPos, 180, 80);
          
          // Ajouter la légende
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(caption, 14, yPos + 84);
          
          return yPos + 90; // Retourner la nouvelle position Y
        } catch (err) {
          console.error("Erreur lors de l'ajout du graphique:", err);
          return yPos;
        }
      }
      return yPos;
    };
    
    // Ajouter les graphiques s'ils sont disponibles
    if (chartRefs.barChartRef) {
      yPosition = addChartToDoc(chartRefs.barChartRef, 'Figure 1: Participation par événement', yPosition);
      
      // Vérifier si on doit ajouter une nouvelle page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    if (chartRefs.pieChartRef) {
      yPosition = addChartToDoc(chartRefs.pieChartRef, 'Figure 2: Taux de présence', yPosition);
      
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    if (chartRefs.lineChartRef) {
      yPosition = addChartToDoc(chartRefs.lineChartRef, 'Figure 3: Tendance mensuelle de participation', yPosition);
      
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    // Ajouter une nouvelle page pour la liste des événements
    doc.addPage();
    
    // Section de la liste des événements
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('3. Liste Détaillée des Événements', 14, 20);
    
    // Préparation des données pour le tableau
    const tableColumn = ['Titre', 'Date', 'Créé par', 'Participants', 'Taux présence'];
    const tableRows = events.map(event => [
      event.titre,
      format(new Date(event.date_event), 'dd/MM/yyyy'),
      event.creator ? `${event.creator.nom} ${event.creator.prenom}` : 'N/A',
      event.participations ? event.participations.length : 0,
      event.presence_rate ? `${event.presence_rate}%` : 'N/A'
    ]);
    
    
    try {
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 25,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          }
        });
      } else if (typeof autoTable === 'function') {
        autoTable(doc, {
          startY: 25,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          }
        });
      } else {
        throw new Error("La fonction autoTable n'est pas disponible");
      }
    } catch (error) {
      console.error("Erreur lors de l'utilisation d'autoTable:", error);
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("Erreur: Impossible de générer le tableau automatiquement.", 14, 30);
    }
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} sur ${pageCount} - Rapport généré par le système de gestion d'événements`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Enregistrement du PDF
    doc.save(`Rapport_Détaillé_Événements_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    
    resolve(true);
  });
};

/**
 * Génère un export Excel des événements et participations
 * @param {Array} events - Liste des événements
 * @param {Object} XLSX - Instance de la bibliothèque SheetJS
 */
export const generateExcelReport = (events, XLSX) => {
};