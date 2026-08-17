<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for TSE Open Data Datasets & Electorate Statistics Cache.
     */
    public function up(): void
    {
        Schema::create('dados_abertos_tse', function (Blueprint $table) {
            $table->id();
            $table->string('ckan_id')->unique()->index();
            $table->string('titulo');
            $table->string('nome_pacote')->index();
            $table->text('descricao')->nullable();
            $table->string('autor')->default('Tribunal Superior Eleitoral - TSE');
            $table->string('organizacao')->default('Justiça Eleitoral / TSE');
            $table->integer('ano_eleicao')->nullable()->index();
            $table->string('categoria')->default('eleitorado'); // eleitorado, resultados, prestacao_contas, boletim_urna
            $table->integer('num_recursos')->default(0);
            $table->json('recursos_disponiveis')->nullable(); // URLs de arquivos CSV, JSON, TXT no TSE
            $table->string('url_portal_tse');
            $table->timestamp('metadata_modified_tse')->nullable();
            $table->timestamp('ultima_sincronizacao')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dados_abertos_tse');
    }
};
