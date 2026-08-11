<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidatoTse extends Model
{
    use HasFactory;

    protected $table = 'candidatos_tse';

    protected $fillable = [
        'tse_id',
        'nome_completo',
        'nome_urna',
        'numero_candidato',
        'sigla_partido',
        'nome_partido',
        'filiacao_coligacao',
        'uf',
        'municipio',
        'cargo_disputado',
        'ano_eleicao',
        'situacao_tse',
        'votos_ultima_eleicao',
        'maior_regiao_votos',
        'cor_raca',
        'grau_instrucao',
        'genero',
        'estado_civil',
        'faixa_etaria',
        'ocupacao',
        'piramide_etaria_eleitorado',
        'cruzamento_perfil_demografico',
        'distribuicao_regional_votos',
        'concentracao_eleitoral',
        'concorrente_direto_confronto',
        'historico_comparativo_anos',
        'fonte_oficial_tse',
        'data_sincronizacao_tse',
    ];

    protected $casts = [
        'piramide_etaria_eleitorado' => 'array',
        'cruzamento_perfil_demografico' => 'array',
        'distribuicao_regional_votos' => 'array',
        'concentracao_eleitoral' => 'array',
        'concorrente_direto_confronto' => 'array',
        'historico_comparativo_anos' => 'array',
        'fonte_oficial_tse' => 'boolean',
        'data_sincronizacao_tse' => 'datetime',
        'numero_candidato' => 'integer',
        'ano_eleicao' => 'integer',
        'votos_ultima_eleicao' => 'integer',
    ];
}
