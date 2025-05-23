<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function update(Request $request)
    {   /** @var \App\Models\User $user  */
        
        $user = Auth::user();

        $data = $request->validate([
            'prenom' => 'required|string|max:192',
            'nom' => 'required|string|max:192',
            'email' => 'required|email|max:192|unique:users,email,' . $user->id,
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {   /** @var \App\Models\User $user  */
        $user = Auth::user();

        $data = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel incorrect.'
            ], 422);
        }

        $user->update([
            'password' => bcrypt($data['new_password']),
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès.'
        ]);
    }


    /**
     * Afficher tous les utilisateurs
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['ADMIN', 'USER'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    /**
     * Afficher un utilisateur spécifique
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:150',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'role' => ['sometimes', 'required', Rule::in(['ADMIN', 'USER'])],
        ]);

        // Si un nouveau mot de passe est fourni, le hacher
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            // Si aucun mot de passe n'est fourni, le retirer du tableau pour ne pas écraser avec une valeur vide
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy(Request $request, User $user)
    {
        // Vérifier si l'utilisateur n'est pas l'utilisateur actuel
        // Cette vérification est complémentaire à celle du frontend
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }
        
        $user->delete();
        return response()->json(null, 204);
    }

    
}