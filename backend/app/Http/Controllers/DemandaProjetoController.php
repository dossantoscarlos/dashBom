<?php

namespace App\Http\Controllers;

use App\Models\DemandaProjeto;
use App\Services\DemandasProjetosService;
use Illuminate\Http\Request;

class DemandaProjetoController extends Controller
{
    protected DemandasProjetosService $demandaService;

    public function __construct(DemandasProjetosService $demandaService)
    {
        $this->demandaService = $demandaService;
    }

    /**
     * GET /api/demandas
     * Lista Paginada de Demandas com Filtros de Status, Prioridade e Busca
     */
    public function index(Request $request)
    {
        $query = DemandaProjeto::with(['criador', 'responsavel']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($prioridade = $request->query('prioridade')) {
            $query->where('prioridade', $prioridade);
        }

        if ($q = $request->query('q')) {
            $query->where(function($sub) use ($q) {
                $sub->where('protocolo', 'LIKE', "%{$q}%")
                    ->orWhere('titulo', 'LIKE', "%{$q}%")
                    ->orWhere('solicitante_nome', 'LIKE', "%{$q}%")
                    ->orWhere('municipio', 'LIKE', "%{$q}%");
            });
        }

        $demandas = $query->orderBy('created_at', 'desc')->paginate($request->query('pageSize', 15));

        return response()->json($demandas);
    }

    /**
     * POST /api/demandas
     * Registro de Nova Demanda com Geração Automática de Protocolo
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'required|string',
            'solicitante_nome' => 'required|string|max:255',
            'solicitante_cpf' => 'nullable|string|max:14',
            'solicitante_telefone' => 'nullable|string|max:20',
            'solicitante_email' => 'nullable|email',
            'categoria' => 'required|string',
            'uf' => 'required|string|size:2',
            'municipio' => 'required|string',
            'bairro' => 'nullable|string',
            'prioridade' => 'nullable|in:baixa,media,alta,urgente',
            'responsavel_id' => 'nullable|exists:users,id',
        ]);

        $criadorId = $request->user()->id ?? 1; // Default fallback para admin se sem auth
        $demanda = $this->demandaService->criarDemanda($validated, $criadorId);

        return response()->json([
            'mensagem' => 'Demanda criada com sucesso!',
            'protocolo' => $demanda->protocolo,
            'demanda' => $demanda,
        ], 201);
    }

    /**
     * PUT /api/demandas/{id}/status
     * Alteração Validada de Status no Ciclo de Vida de 10 Fases
     */
    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'novo_status' => 'required|string|in:' . implode(',', DemandasProjetosService::STATUS_VALIDOS),
            'observacao' => 'nullable|string',
        ]);

        $demanda = DemandaProjeto::findOrFail($id);
        $usuarioId = $request->user()->id ?? 1;

        try {
            $demandaAtualizada = $this->demandaService->transicionarStatus(
                $demanda,
                $validated['novo_status'],
                $usuarioId,
                $validated['observacao'] ?? null
            );

            return response()->json([
                'mensagem' => "Status alterado para '{$demandaAtualizada->status}' com sucesso!",
                'protocolo' => $demandaAtualizada->protocolo,
                'demanda' => $demandaAtualizada,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['erro' => $e->getMessage()], 422);
        }
    }
}
