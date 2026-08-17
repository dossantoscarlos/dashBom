<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DemandaProjeto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'demandas_projetos';

    protected $fillable = [
        'protocolo',
        'titulo',
        'descricao',
        'solicitante_nome',
        'solicitante_cpf',
        'solicitante_telefone',
        'solicitante_email',
        'categoria',
        'uf',
        'municipio',
        'bairro',
        'endereco',
        'status',
        'prioridade',
        'responsavel_id',
        'criador_id',
        'orcamento_estimado',
        'prazo_estimado',
        'data_conclusao',
        'historico_tramitacao',
        'anexos_documentos',
        'parecer_final',
    ];

    protected $casts = [
        'historico_tramitacao' => 'array',
        'anexos_documentos' => 'array',
        'orcamento_estimado' => 'decimal:2',
        'prazo_estimado' => 'date',
        'data_conclusao' => 'datetime',
    ];

    public function criador()
    {
        return $this->belongsTo(User::class, 'criador_id');
    }

    public function responsavel()
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }
}
