<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->string('titre');
        $table->text('description')->nullable();
        $table->dateTime('date_event');
        $table->string('photo')->nullable();
        $table->unsignedBigInteger('created_by')->nullable();
        $table->timestamps();

        $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
    });
}
public function down(): void
{
    Schema::dropIfExists('events');
}
};
