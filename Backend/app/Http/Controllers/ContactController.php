<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'required|string'
        ]);

        Mail::raw("Message de: {$request->email}\n\n{$request->message}", function ($msg) {
            $msg->to('saoudamina40@gmail.com')
                ->subject('Message depuis le site ENSAJ Entreprises');
        });

        return response()->json(['success' => true]);
    }
}

