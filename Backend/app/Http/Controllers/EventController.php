<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Participation;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * pour afficher tous les événements
     */
    public function index()
    {
        $events = Event::with('creator')->orderBy('date_event', 'desc')->get();
        return response()->json($events);
    }

    /**
     * pour crée un nouvel événement
     */
    public function store(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_event' => 'required|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()], 422);
        }

        try {
            $eventData = $request->only(['titre', 'description', 'date_event']);
            
            // Si l'utilisateur connecté est disponible, on utiliser son ID :)
            if (Auth::check()) {
                $eventData['created_by'] = Auth::id();
            } elseif ($request->has('created_by')) {
                $eventData['created_by'] = $request->created_by;
            }

            // Traitement de la photo si elle existe
            if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
                $photo = $request->file('photo');
                $filename = time() . '.' . $photo->getClientOriginalExtension();
                
                // On va enregistrer l'image dans le dossier storage/app/public/events
                $path = $photo->storeAs('events', $filename, 'public');
                $eventData['photo'] = $path;
            }

            // Créer l'événement
            $event = Event::create($eventData);

            return response()->json([
                'message' => 'Événement créé avec succès',
                'event' => $event
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la création de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affichage d'un événement spécifique
     */
    public function show($id)
    {
        $event = Event::with('creator')->findOrFail($id);
        return response()->json($event);
    }

    /**
     * Mettre à jour un événement spécifique
     */
    public function update(Request $request, $id)
    {
        // Valider les données
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date_event' => 'sometimes|required|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()], 422);
        }

        try {
            $event = Event::findOrFail($id);
            $eventData = $request->only(['titre', 'description', 'date_event']);
            
            // Traitement de la photo si elle existe
            if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
                // Supprression de l'ancienne photo si elle existe
                if ($event->photo && Storage::disk('public')->exists($event->photo)) {
                    Storage::disk('public')->delete($event->photo);
                }
                
                $photo = $request->file('photo');
                $filename = time() . '.' . $photo->getClientOriginalExtension();
                
                // on enregistre l'image
                $path = $photo->storeAs('events', $filename, 'public');
                $eventData['photo'] = $path;
            }

            // Mettre à jour l'événement
            $event->update($eventData);

            return response()->json([
                'message' => 'Événement mis à jour avec succès',
                'event' => $event
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * pour supprimer un événement spécifique
     */
    public function destroy($id)
    {
        try {
            $event = Event::findOrFail($id);
            
            // on supprime la photo associée si elle existe
            if ($event->photo && Storage::disk('public')->exists($event->photo)) {
                Storage::disk('public')->delete($event->photo);
            }
            
            $event->delete();
            
            return response()->json([
                'message' => 'Événement supprimé avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la suppression de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * pour récupèrer les événements à venir de l'utilisateur connecté
     */
    public function getUserUpcomingEvents(Request $request)
    {
        $user = $request->user();
        $today = Carbon::now();
        
        // Récupérer les événements à venir où l'utilisateur participe
        $participations = Participation::with(['event' => function ($query) use ($today) {
                $query->where('date_event', '>=', $today);
            }])
            ->where('user_id', $user->id)
            ->whereHas('event', function ($query) use ($today) {
                $query->where('date_event', '>=', $today);
            })
            ->get();
        
        // Formater les données
        $events = $participations->map(function ($participation) {
            return [
                'id' => $participation->event->id,
                'titre' => $participation->event->titre,
                'description' => $participation->event->description,
                'date_event' => $participation->event->date_event,
                'role' => $participation->role,
                'statut_presence' => $participation->statut_presence
            ];
        });
        
        return response()->json($events);
    }
    
    /**
     * pour récupèrer les événements passés de l'utilisateur connecté
     */
    public function getUserPastEvents(Request $request)
    {
        $user = $request->user();
        $today = Carbon::now();
        
        // Récupérer les événements passés où l'utilisateur a participé
        $participations = Participation::with(['event' => function ($query) use ($today) {
                $query->where('date_event', '<', $today);
            }])
            ->where('user_id', $user->id)
            ->whereHas('event', function ($query) use ($today) {
                $query->where('date_event', '<', $today);
            })
            ->get();
        
        // Formater les données
        $events = $participations->map(function ($participation) {
            return [
                'id' => $participation->event->id,
                'titre' => $participation->event->titre,
                'description' => $participation->event->description,
                'date_event' => $participation->event->date_event,
                'role' => $participation->role,
                'statut_presence' => $participation->statut_presence
            ];
        });
        
        return response()->json($events);
    }
}