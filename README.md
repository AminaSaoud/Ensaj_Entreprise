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

1. Cloner le projet :

git clone <URL_DU_DEPOT>
cd SiteEnsajEntreprises

2. Installer Laravel dans le dossier Backend :

composer create-project laravel/laravel Backend

3. Installer les dépendances React :

npm install
npm install bootstrap react-bootstrap
npm install recharts chart.js react-chartjs-2 jspdf jspdf-autotable xlsx date-fns

4. Configuration Laravel :

Copier le fichier .env.example en .env  
Configurer les variables de base de données dans .env  
Générer la clé d'application :

php artisan key:generate

5. Migrer la base de données :

php artisan migrate

6. Créer le lien vers le stockage (pour les fichiers d'événements) :

php artisan storage:link

7. Optimiser ou vider le cache si nécessaire :

php artisan optimize  
php artisan route:clear  
php artisan config:clear  
php artisan cache:clear  
php artisan view:clear

8. Utilitaire Laravel Tinker :

php artisan tinker

Pour créer des utilisateurs ou générer un mot de passe crypté.

---

## Contribution

Toute contribution est la bienvenue. Merci de bien vouloir soumettre une pull request ou ouvrir une issue pour proposer des modifications ou signaler un bug.