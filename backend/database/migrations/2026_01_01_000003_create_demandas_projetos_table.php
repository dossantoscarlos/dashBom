<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Demandas e Projetos (Ciclo de Vida de 10 Fases).
     */
    public function up(): void
    {
        Schema::create('demandas_projetos', function (Blueprint $table) {
            $table->id();
            $table->string('protocolo', 30)->unique()->index(); // Ex: DEM-2026-00482
            $table->string('titulo');
            $table->text('descricao');
            $table->string('solicitante_nome');
            $table->string('solicitante_cpf', 14)->nullable();
            $table->string('solicitante_telefone', 20)->nullable();
            $table->string('solicitante_email')->nullable();
            $table->string('categoria'); // Infraestrutura, Saúde, Educação, Segurança, Transporte, Iluminação
            $table->string('uf', 2)->default('SP');
            $table->string('municipio');
            $table->string('bairro')->nullable();
            $table->string('endereco')->nullable();
            
            // Ciclo de Vida do Atendimento (10 Status Estritos)
            $table->enum('status', [
                'rascunho',
                'recebida',
                'triagem',
                'em_analise',
                'parecer_tecnico',
                'aprovada',
                'em_execucao',
                'concluida',
                'arquivada',
                'cancelada'
            ])->default('recebida')->index();

            // Nível de Prioridade da Demanda
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media')->index();

            $table->foreignId('responsavel_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('criador_id')->constrained('users')->onDelete('cascade');
            
            $table->decimal('orcamento_estimado', 12, 2)->nullable();
            $table->date('prazo_estimado')->nullable();
            $table->timestamp('data_conclusao')->nullable();
            
            // Histórico de Pareceres e Anexos em JSON
            $table->json('historico_tramitacao')->nullable();
            $table->json('anexos_documentos')->nullable();
            $table->text('parecer_final')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandas_projetos');
    }
};
