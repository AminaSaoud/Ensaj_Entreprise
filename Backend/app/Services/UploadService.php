<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadService
{
    /**
     * Enregistre un fichier téléchargé et retourne le chemin.
     *
     * @param UploadedFile $file Le fichier téléchargé
     * @param string $folder Le dossier où stocker le fichier
     * @param string $disk Le disque de stockage à utiliser
     * @param string|null $filename Le nom de fichier personnalisé (optionnel)
     * @return string Le chemin du fichier enregistré
     */
    public function saveFile(UploadedFile $file, string $folder = 'uploads', string $disk = 'public', string $filename = null): string
    {
        // Générer un nom de fichier unique si aucun n'est fourni
        $filename = $filename ?? Str::random(20);
        
        // Obtenir l'extension du fichier original
        $extension = $file->getClientOriginalExtension();
        
        // Créer le nom de fichier complet avec extension
        $filenameWithExt = "{$filename}.{$extension}";
        
        // Enregistrer le fichier et récupérer le chemin
        $path = $file->storeAs($folder, $filenameWithExt, $disk);
        
        return $path;
    }

    /**
     * Supprime un fichier existant.
     *
     * @param string|null $path Le chemin du fichier à supprimer
     * @param string $disk Le disque de stockage à utiliser
     * @return bool True si la suppression est réussie, false sinon
     */
    public function deleteFile(?string $path, string $disk = 'public'): bool
    {
        if (!$path) {
            return false;
        }
        
        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
            return true;
        }
        
        return false;
    }
}