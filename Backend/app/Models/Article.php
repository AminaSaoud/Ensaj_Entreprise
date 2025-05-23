<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;
    
    protected $table = 'articles';
    
    protected $fillable = [
        'titre',
        'contenu',
        'image',
        'event_id',
        'created_by'
    ];

    /**
     * Récupérer l'événement associé à cet article
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Récupérer l'utilisateur qui a créé cet article
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}