<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('nom', 100);
        $table->string('prenom', 100);
        $table->string('email', 150)->unique();
        $table->string('password');
        $table->enum('role', ['ADMIN', 'USER'])->default('USER');
        $table->timestamps(); //cela va genere created_at et updated_at automatiquement
    });
}

public function down(): void
{
    Schema::dropIfExists('users');
}
};
