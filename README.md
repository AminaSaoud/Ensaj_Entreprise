# SiteEnsajEntreprises

**Site web officiel du club EnsajEntreprises**, conçu pour faciliter la gestion des événements, des membres et des statistiques du club.

Cette plateforme propose deux espaces distincts : un pour les **administrateurs** et un autre pour les **adhérents**.

---

## Fonctionnalités principales

### Page d'accueil
- Galerie dynamique avec aperçu des derniers événements organisés.

### Espace Administrateur
- Connexion sécurisée via un espace dédié.
- Tableau de bord avec statistiques exportables (PDF/Excel).
- Attribution des événements aux organisateurs.
- Ajouter un événement via un formulaire complet.
- Consulter/Modifier les événements existants.
- Gestion des utilisateurs : ajouter, modifier, supprimer des membres.
- Gestion des codes d’inscription : création manuelle ou automatique de codes.
- Compte admin : modifier mot de passe et infos personnelles.

### Espace Adhérent
- Inscription via un code fourni par l’admin.
- Statistiques personnelles de participation aux événements.
- Liste des événements avec possibilité de marquer sa présence, choisir son rôle ou indiquer une absence.
- Compte adhérent : modification du mot de passe et infos personnelles.

### Page de contact
- Formulaire de contact relié à l’email officiel du club.

---

## Stack technique

- **Backend** : Laravel 12.5  
- **Frontend** : React (Vite)  
- **Base de données** : MySQL  

### Librairies utilisées
- Bootstrap / React-Bootstrap  
- Chart.js & React-ChartJS-2  
- Recharts  
- jsPDF, jsPDF-AutoTable  
- XLSX  
- date-fns  

---

## Installation de l’environnement

1. **Cloner le projet :**

```bash
git clone <URL_DU_DEPOT>
cd SiteEnsajEntreprises
