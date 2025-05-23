<?php

namespace App\Http\Controllers;

use App\Models\Codesinscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CodeInscriptionController extends Controller
{
    /**
     * pour afficher tous les codes d'inscription
     */
    public function index()
    {
        $codes = Codesinscription::orderBy('created_at', 'desc')->get();
        return response()->json($codes);
    }

    /**
     * pour créer un nouveau code d'inscription
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:codesinscriptions,code',
        ]);

        $code = Codesinscription::create([
            'code' => $validated['code'],
            'is_used' => false
        ]);

        return response()->json($code, 201);
    }

    /**
     * pour générer plusieurs codes d'inscription aléatoires
     */
    public function generateMultiple(Request $request)
    {
        $validated = $request->validate([
            'count' => 'required|integer|min:1|max:100',
        ]);

        $count = $validated['count'];
        $generatedCodes = [];

        for ($i = 0; $i < $count; $i++) {
            // pour générer un code unique
            $unique = false;
            $newCode = '';
            
            while (!$unique) {
                $newCode = strtoupper(Str::random(8));
                // on verifie si le code existe deja 
                $exists = Codesinscription::where('code', $newCode)->exists();
                $unique = !$exists;
            }
            
            // ensuite on crée le code
            $code = Codesinscription::create([
                'code' => $newCode,
                'is_used' => false
            ]);
            
            $generatedCodes[] = $code;
        }

        return response()->json($generatedCodes, 201);
    }

    /**
     * on supprime un code d'inscription
     */
    public function destroy(Codesinscription $code)
    {
        // on vérifie si le code a déjà été utilisé
        if ($code->is_used) {
            return response()->json([
                'message' => 'Impossible de supprimer un code déjà utilisé'
            ], 403);
        }
        
        $code->delete();
        return response()->json(null, 204);
    }

   
}