<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Financial Transactions & TSE Accountability.
     */
    public function up(): void
    {
        Schema::create('financeiro_transacoes', function (Blueprint $table) {
            $table->id();
            $table->string('recibo_tse', 50)->nullable()->unique()->index();
            $table->enum('tipo', ['receita', 'despesa'])->index();
            $table->string('categoria'); // Propaganda, Eventos, Combustível, Pessoal, Doação Direta
            $table->decimal('valor', 12, 2);
            $table->date('data_transacao')->index();
            $table->string('descricao');
            
            // Dados da Parte Doadora / Fornecedora (Conformidade TSE)
            $table->string('cpf_cnpj_parte', 18)->index();
            $table->string('nome_parte');
            $table->enum('tipo_parte', ['pf', 'pj'])->default('pf');
            $table->string('banco_origem')->nullable();
            $table->string('agencia_origem')->nullable();
            $table->string('conta_origem')->nullable();

            $table->enum('forma_pagamento', ['pix', 'ted', 'boleto', 'cartao', 'cheque', 'especie'])->default('pix');
            $table->enum('status_conciliacao', ['pendente', 'conciliado', 'rejeitado_tse'])->default('conciliado');

            $table->string('comprovante_url')->nullable();
            $table->foreignId('registrado_por_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financeiro_transacoes');
    }
};
