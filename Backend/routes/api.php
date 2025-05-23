<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ParticipationController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\CodeInscriptionController;

use App\Http\Controllers\ContactController;
use App\Http\Controllers\QaController;

Route::post('/contact', [ContactController::class, 'send']);
Route::post('/qa/send', [QaController::class, 'send']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::put('/user/update',[UserController::class,'update']);
    Route::put('/user/change-password',[UserController::class,'changePassword']);

    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // Routes pour les participations
    Route::get('/participations/user', [ParticipationController::class, 'getUserParticipations']);
    Route::get('/participations/event/{eventId}', [ParticipationController::class, 'getEventParticipations']);
    Route::post('/participations', [ParticipationController::class, 'store']);
    Route::put('/participations/{id}', [ParticipationController::class, 'update']);
    Route::delete('/participations/{id}', [ParticipationController::class, 'destroy']);

    // Route pour récupérer les statistiques générales
    Route::get('/stats', [StatsController::class, 'getStats']);
    
    // Route pour récupérer les statistiques de participation
    Route::get('/participation-stats', [StatsController::class, 'getParticipationStats']);

    // Route pour récupérer tous les événements avec leurs participations
    //on doit supprimer apres cette fonction et l'ecrire dans le Statscontroller
    Route::get('/events-participates', function () {
        return App\Models\Event::with(['creator', 'participations.user'])
            ->orderBy('date_event', 'desc')
            ->get()
            ->map(function ($event) {
                // Calculer le taux de présence pour chaque événement
                $totalParticipations = $event->participations()->count();
                $totalPresences = $event->participations()->where('statut_presence', 'present')->count();
                $event->presence_rate = $totalParticipations > 0 
                    ? round(($totalPresences / $totalParticipations) * 100, 1) 
                    : 0;
                
                return $event;
            });
    });

    // Routes pour les statistiques utilisateur
    Route::get('/user/participations', [ParticipationController::class, 'getUserParticipation']);
    Route::get('/user/events/upcoming', [EventController::class, 'getUserUpcomingEvents']);
    Route::get('/user/events/past', [EventController::class, 'getUserPastEvents']);
    Route::get('/user/stats/monthly', [ParticipationController::class, 'getUserMonthlyStats']);

    //gestion des utilisateurs :)
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'updateUser']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    //finnally, gestion des codes :)
    Route::get('/codes', [CodeInscriptionController::class, 'index']);
    Route::post('/codes', [CodeInscriptionController::class, 'store']);
    Route::post('/codes/generate', [CodeInscriptionController::class, 'generateMultiple']);
    Route::delete('/codes/{code}', [CodeInscriptionController::class, 'destroy']);
});