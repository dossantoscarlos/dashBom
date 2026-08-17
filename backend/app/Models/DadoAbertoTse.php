<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DadoAbertoTse extends Model
{
    use HasFactory;

    protected $table = 'dados_abertos_tse';

    protected $fillable = [
        'ckan_id',
        'titulo',
        'nome_pacote',
        'descricao',
        'autor',
        'organizacao',
        'ano_eleicao',
        'categoria',
        'num_recursos',
        'recursos_disponiveis',
        'url_portal_tse',
        'metadata_modified_tse',
        'ultima_sincronizacao',
    ];

    protected $casts = [
        'recursos_disponiveis' => 'array',
        'metadata_modified_tse' => 'datetime',
        'ultima_sincronizacao' => 'datetime',
        'num_recursos' => 'integer',
        'ano_eleicao' => 'integer',
    ];
}
