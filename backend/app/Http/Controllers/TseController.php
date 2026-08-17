<?php

namespace App\Http\Controllers;

use App\Services\TseBusinessRulesService;
use Illuminate\Http\Request;

class TseController extends Controller
{
    protected TseBusinessRulesService $tseService;

    public function __construct(TseBusinessRulesService $tseService)
    {
        $this->tseService = $tseService;
    }

    /**
     * GET /api/tse/candidatos
     * Busca Paginada com Regra Exata por Partido e Flexão de Gênero
     */
    public function index(Request $request)
    {
        $params = $request->only(['q', 'ano', 'cargo', 'uf', 'partido', 'page', 'pageSize']);
        $resultado = $this->tseService->buscarCandidatos($params);

        return response()->json($resultado);
    }

    /**
     * GET /api/tse/candidatos/{id}
     * Detalhes do Perfil Demográfico do Eleitorado e Confronto com Concorrente Direto
     */
    public function show(string $id)
    {
        $detalhes = $this->tseService->obterDetalheCandidato($id);

        if (!$detalhes) {
            return response()->json(['erro' => 'Candidato não encontrado na base oficial do TSE'], 404);
        }

        return response()->json($detalhes);
    }

    /**
     * GET /api/tse/dados-abertos
     * Estatísticas do Eleitorado e Relatórios da Conexão CKAN do TSE (dadosabertos.tse.jus.br)
     */
    public function dadosAbertos(Request $request)
    {
        $queryStr = $request->query('query', 'eleitorado');
        $ano = $request->query('ano', 'todos');

        $resultado = $this->tseService->sincronizarDadosAbertosTse($queryStr, $ano);

        return response()->json($resultado);
    }
}
