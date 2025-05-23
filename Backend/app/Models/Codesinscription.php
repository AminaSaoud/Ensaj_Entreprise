<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Codesinscription extends Model
{
    use HasFactory;
    protected $table = 'codesinscriptions';
    protected $fillable = ['code', 'is_used'];
}
