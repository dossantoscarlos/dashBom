<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Users and Permissions.
     */
    public function up(): void
    {
        // Tabela de Usuários da Plataforma
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'gestor', 'coordenador', 'operador', 'voluntario'])->default('operador');
            $table->string('cpf', 14)->nullable()->unique();
            $table->string('telefone', 20)->nullable();
            $table->string('uf', 2)->nullable();
            $table->string('municipio')->nullable();
            $table->boolean('ativo')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // Tabela de Permissões de Acesso por Módulo do Sistema
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('modulo'); // Ex: 'tre', 'demandas', 'financeiro', 'agenda', 'voluntariado'
            $table->boolean('pode_visualizar')->default(true);
            $table->boolean('pode_criar')->default(false);
            $table->boolean('pode_editar')->default(false);
            $table->boolean('pode_excluir')->default(false);
            $table->boolean('pode_exportar')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'modulo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('users');
    }
};
