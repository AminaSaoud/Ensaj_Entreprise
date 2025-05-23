<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\User;
use App\Models\Participation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Récupérer les statistiques globales
     */
    public function getStats()
    {
        // Nombre total d'événements
        $totalEvents = Event::count();
        
        // Nombre total de participants (sans duplications)
        $totalParticipants = Participation::distinct('user_id')->count('user_id');
        
        // Taux de présence global
        $totalPresences = Participation::where('statut_presence', 'present')->count();
        $totalParticipations = Participation::count();
        $presenceRate = $totalParticipations > 0 
            ? round(($totalPresences / $totalParticipations) * 100, 1) 
            : 0;
        
        // Nombre d'événements ce mois-ci
        $eventsThisMonth = Event::whereMonth('date_event', Carbon::now()->month)
            ->whereYear('date_event', Carbon::now()->year)
            ->count();
        
        // Statistiques mensuelles des événements (12 derniers mois)
        $eventsByMonth = Event::select(
                DB::raw('YEAR(date_event) as year'),
                DB::raw('MONTH(date_event) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->where('date_event', '>=', Carbon::now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
            
        return response()->json([
            'totalEvents' => $totalEvents,
            'totalParticipants' => $totalParticipants,
            'presenceRate' => $presenceRate,
            'eventsThisMonth' => $eventsThisMonth,
            'eventsByMonth' => $eventsByMonth
        ]);
    }
    
    /**
     * Récupérer les statistiques de participation
     */
    public function getParticipationStats()
    {
        // Récupérer les événements avec le nombre de participants
        $events = Event::withCount('participations as participant_count')
            ->with('creator')
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
        
        // Statistiques sur les présences
        $presenceCount = Participation::where('statut_presence', 'present')->count();
        $absenceCount = Participation::where('statut_presence', 'absent')->count();
        
        // Statistiques sur les rôles
        $participantRoleCount = Participation::where('role', 'participant')->count();
        $organizerRoleCount = Participation::where('role', 'organisateur')->count();
        
        // Statistiques mensuelles (12 derniers mois)
        $monthlyStats = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->format('M Y');
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();
            
            // Nombre d'événements par mois
            $eventCount = Event::whereBetween('date_event', [$startOfMonth, $endOfMonth])->count();
            
            // Nombre de participants par mois
            $participantCount = Participation::whereHas('event', function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('date_event', [$startOfMonth, $endOfMonth]);
            })->count();
            
            $monthlyStats[] = [
                'month' => $month,
                'event_count' => $eventCount,
                'participant_count' => $participantCount
            ];
        }
        
        return response()->json([
            'events' => $events,
            'presence_count' => $presenceCount,
            'absence_count' => $absenceCount,
            'participant_role_count' => $participantRoleCount,
            'organizer_role_count' => $organizerRoleCount,
            'monthly_stats' => $monthlyStats
        ]);
    }
}