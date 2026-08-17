<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'cpf',
        'telefone',
        'uf',
        'municipio',
        'ativo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'ativo' => 'boolean',
    ];

    public function permissions()
    {
        return $this->hasMany(Permission::class);
    }

    public function demandasCriadas()
    {
        return $this->hasMany(DemandaProjeto::class, 'criador_id');
    }

    public function demandasResponsaveis()
    {
        return $this->hasMany(DemandaProjeto::class, 'responsavel_id');
    }
}
