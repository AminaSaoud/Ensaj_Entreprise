<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;
    protected $table = 'events';
    protected $fillable = [
        'titre', 'description', 'date_event', 'photo', 'created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'participations')
            ->withPivot('role', 'statut_presence')
            ->withTimestamps();
    }
}
