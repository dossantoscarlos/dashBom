<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for TSE/TRE Candidates & Demographics.
     */
    public function up(): void
    {
        Schema::create('candidatos_tse', function (Blueprint $table) {
            $table->id();
            $table->string('tse_id')->unique(); // Ex: 350001882910_2024
            $table->string('nome_completo');
            $table->string('nome_urna');
            $table->integer('numero_candidato')->index();
            $table->string('sigla_partido', 20)->index();
            $table->string('nome_partido');
            $table->string('filiacao_coligacao')->nullable();
            $table->string('uf', 2)->index();
            $table->string('municipio')->nullable()->index();
            $table->string('cargo_disputado')->index(); // Ex: Prefeito, Deputado Federal, Vereador
            $table->integer('ano_eleicao')->index(); // 2026, 2024, 2022, 2020, 2018
            $table->string('situacao_tse'); // REELEITO, ELEITO, DEFERIDO, 2º TURNO, NÃO ELEITO
            $table->bigInteger('votos_ultima_eleicao')->default(0);
            $table->string('maior_regiao_votos')->nullable();
            
            // Dados Demográficos do Candidato
            $table->string('cor_raca')->nullable();
            $table->string('grau_instrucao')->nullable();
            $table->string('genero')->nullable();
            $table->string('estado_civil')->nullable();
            $table->string('faixa_etaria')->nullable();
            $table->string('ocupacao')->nullable();

            // Metadados Estruturados em JSON (Pirâmide Etária, Cruzamento de Perfil, Distribuição Regional)
            $table->json('piramide_etaria_eleitorado')->nullable();
            $table->json('cruzamento_perfil_demografico')->nullable();
            $table->json('distribuicao_regional_votos')->nullable();
            $table->json('concentracao_eleitoral')->nullable();
            $table->json('concorrente_direto_confronto')->nullable();
            $table->json('historico_comparativo_anos')->nullable();

            $table->boolean('fonte_oficial_tse')->default(true);
            $table->timestamp('data_sincronizacao_tse')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidatos_tse');
    }
};
