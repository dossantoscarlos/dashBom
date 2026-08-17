<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TseController;
use App\Http\Controllers\DemandaProjetoController;

/*
|--------------------------------------------------------------------------
| API Routes - campanhaPRO Backend Laravel
|--------------------------------------------------------------------------
|
| Aqui estão registradas as rotas RESTful integradas às Regras de Negócio
| do sistema (Inteligência TSE/TRE, Demandas & Projetos, Finanças).
|
*/

Route::prefix('v1')->group(function () {
    // ── ROTAS DE INTELIGÊNCIA ELEITORAL TSE / TRE ──
    Route::get('/tse/candidatos', [TseController::class, 'index']);
    Route::get('/tse/candidatos/{id}', [TseController::class, 'show']);
    Route::get('/tse/dados-abertos', [TseController::class, 'dadosAbertos']);

    // ── ROTAS DO CICLO DE VIDA DE DEMANDAS & PROJETOS ──
    Route::get('/demandas', [DemandaProjetoController::class, 'index']);
    Route::post('/demandas', [DemandaProjetoController::class, 'store']);
    Route::put('/demandas/{id}/status', [DemandaProjetoController::class, 'updateStatus']);
});
