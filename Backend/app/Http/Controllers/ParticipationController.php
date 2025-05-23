<?php

namespace App\Http\Controllers;

use App\Models\Participation;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ParticipationController extends Controller
{
    /**
     * Récupérer toutes les participations de l'utilisateur connecté
     */
    public function getUserParticipations()
    {
        $user = Auth::user();
        $participations = Participation::with('event')
            ->where('user_id', $user->id)
            ->get();
        
        return response()->json($participations);
    }

    /**
     * Récupérer toutes les participations pour un événement spécifique
     */
    public function getEventParticipations($eventId)
    {
        // Vérifier si l'événement existe
        $event = Event::findOrFail($eventId);
        
        $participations = Participation::with('user')
            ->where('event_id', $eventId)
            ->get();
        
        return response()->json($participations);
    }

    /**
     * Enregistrer une nouvelle participation
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'role' => 'nullable|in:participant,organisateur',
            'statut_presence' => 'required|in:present,absent',
        ]);
        
        $user = Auth::user();
        
        // Vérifier si l'utilisateur participe déjà à cet événement
        $existingParticipation = Participation::where('user_id', $user->id)
            ->where('event_id', $request->event_id)
            ->first();
            
        if ($existingParticipation) {
            return response()->json([
                'message' => 'Vous participez déjà à cet événement'
            ], 422);
        }
        
        // Si l'utilisateur est absent, le rôle reste null
        $role = $request->statut_presence === 'absent' ? null : $request->role;
        
        $participation = Participation::create([
            'user_id' => $user->id,
            'event_id' => $request->event_id,
            'role' => $role,
            'statut_presence' => $request->statut_presence, 
        ]);
        
        return response()->json($participation, 201);
    }

    /**
     * Mettre à jour une participation existante
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'role' => 'nullable|in:participant,organisateur',
            'statut_presence' => 'sometimes|required|in:present,absent',
        ]);
        
        $participation = Participation::findOrFail($id);
        
        // Vérifier que l'utilisateur est bien le propriétaire de cette participation
        if ($participation->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $data = $request->only(['role', 'statut_presence']);
        
        // Si l'utilisateur est absent, le rôle reste null
        if (isset($data['statut_presence']) && $data['statut_presence'] === 'absent') {
            $data['role'] = null;
        }
        
        $participation->update($data);
        
        return response()->json($participation);
    }

    /**
     * Supprimer une participation
     */
    public function destroy($id)
    {
        $participation = Participation::findOrFail($id);
        
        // Vérifier que l'utilisateur est bien le propriétaire de cette participation
        if ($participation->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $participation->delete();
        
        return response()->json([
            'message' => 'Participation supprimée avec succès'
        ]);
    }

   /**
     * Récupère toutes les participations de l'utilisateur connecté
     */
    public function getUserParticipation(Request $request)
    {
        $user = $request->user();
        
        $participations = Participation::with('event')
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'event_id' => $participation->event_id,
                    'event_title' => $participation->event->titre ?? 'Événement inconnu',
                    'role' => $participation->role,
                    'statut_presence' => $participation->statut_presence,
                    'date_event' => $participation->event->date_event ?? null,
                ];
            });
        
        return response()->json($participations);
    }
    
    /**
     * Récupère les statistiques mensuelles de participation de l'utilisateur
     */
    public function getUserMonthlyStats(Request $request)
    {
        $user = $request->user();
        $period = $request->query('period', 'all');
        
        // Définir la date de début en fonction de la période demandée
        $startDate = null;
        switch ($period) {
            case 'quarter':
                $startDate = Carbon::now()->subMonths(3);
                break;
            case 'semester':
                $startDate = Carbon::now()->subMonths(6);
                break;
            case 'year':
                $startDate = Carbon::now()->subYear();
                break;
            default:
                break;
        }
        
        // Base de la requête
        $query = DB::table('participations')
            ->join('events', 'participations.event_id', '=', 'events.id')
            ->where('participations.user_id', $user->id)
            ->select(
                DB::raw('YEAR(events.date_event) as year'),
                DB::raw('MONTH(events.date_event) as month'),
                DB::raw('COUNT(CASE WHEN participations.statut_presence = "present" THEN 1 END) as present'),
                DB::raw('COUNT(CASE WHEN participations.statut_presence = "absent" THEN 1 END) as absent')
            );
        
        // Appliquer le filtre de date si nécessaire
        if ($startDate) {
            $query->where('events.date_event', '>=', $startDate);
        }
        
        // Finaliser la requête
        $stats = $query->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        
        // Formater les résultats pour les rendre plus lisibles
        $formattedStats = $stats->map(function ($item) {
            $date = Carbon::createFromDate($item->year, $item->month, 1);
            return [
                'month' => $date->locale('fr')->isoFormat('MMM YYYY'),
                'present' => $item->present,
                'absent' => $item->absent,
                'total' => $item->present + $item->absent
            ];
        });
        
        return response()->json($formattedStats);
    }
}