<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory,Notifiable;
    protected $table = 'users';
    protected $fillable = [
        'nom', 'prenom', 'email', 'password', 'role',
    ];

    protected $hidden = ['password'];

    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'created_by');
    }
}
