<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('participations', function (Blueprint $table) {
        $table->id();
        $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->enum('role', ['participant', 'organisateur'])->default('participant');
        $table->enum('statut_presence', ['present', 'absent'])->default('absent');
        $table->timestamps();
    });
}
public function down(): void
{
    Schema::dropIfExists('participations');
}
};
