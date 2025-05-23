<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class QaController extends Controller
{
    /**
     * Traite l'envoi du formulaire Q&A
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function send(Request $request)
    {
        // Validation des données
        $validatedData = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email',
            'question' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        try {
            // Composition du message
            $messageContent = "Nouvelle question depuis le formulaire Q&A\n\n";
            $messageContent .= "Nom: {$validatedData['nom']}\n";
            $messageContent .= "Prénom: {$validatedData['prenom']}\n";
            $messageContent .= "Email: {$validatedData['email']}\n";
            $messageContent .= "Question: {$validatedData['question']}\n\n";
            $messageContent .= "Message:\n{$validatedData['message']}";

            // Envoi du mail
            Mail::raw($messageContent, function ($msg) use ($validatedData) {
                $msg->to('saoudamina40@gmail.com')
                    ->subject('Question depuis la page Q&A')
                    ->replyTo($validatedData['email'], $validatedData['nom'] . ' ' . $validatedData['prenom']);
            });

            return response()->json([
                'success' => true,
                'message' => 'Votre question a bien été envoyée. Merci !'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'envoi de votre message.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}