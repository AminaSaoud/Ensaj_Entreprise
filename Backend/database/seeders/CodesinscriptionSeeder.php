<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Codesinscription;
use Illuminate\Support\Str;

class CodesinscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un code de test simple "TEST123"
        Codesinscription::create([
            'code' => 'TEST123',
            'is_used' => false
        ]);

        // Créer quelques codes aléatoires supplémentaires
        for ($i = 0; $i < 5; $i++) {
            Codesinscription::create([
                'code' => Str::random(8),
                'is_used' => false
            ]);
        }
    }
}