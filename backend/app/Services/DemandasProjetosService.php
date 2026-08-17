<?php

namespace App\Services;

use App\Models\DemandaProjeto;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Service Oficial de Regras de Negócio de Demandas e Projetos
 *
 * REGRAS DE NEGÓCIO REGISTRADAS:
 * 1. Protocolo Único Automático: Formato padronizado DEM-YYYY-XXXXX com ano corrente e número sequencial.
 * 2. Ciclo de Vida de 10 Fases: rascunho ➔ recebida ➔ triagem ➔ em_analise ➔ parecer_tecnico ➔ aprovada ➔ em_execucao ➔ concluida ➔ arquivada ➔ cancelada.
 * 3. Validação de Transição de Estado: Demandas finalizadas (concluida, cancelada, arquivada) não podem retornar para rascunho.
 * 4. Histórico de Auditoria Imodificável: Todas as alterações gravam data, usuário e observação em JSON.
 */
class DemandasProjetosService
{
    /**
     * As 10 Fases Estritas do Ciclo de Vida da Demanda
     */
    public const STATUS_VALIDOS = [
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
    ];

    /**
     * Regra 1: Geração Automática de Protocolo Único (DEM-YYYY-XXXXX)
     *
     * @return string
     */
    public function gerarProtocolo(): string
    {
        $ano = date('Y');
        $ultimoId = DemandaProjeto::max('id') ?? 0;
        $sequencial = str_pad($ultimoId + 1, 5, '0', STR_PAD_LEFT);
        return "DEM-{$ano}-{$sequencial}";
    }

    /**
     * Regra 2 & 3: Transição Validada do Ciclo de Vida da Demanda
     *
     * @param DemandaProjeto $demanda
     * @param string $novoStatus
     * @param int $usuarioId
     * @param string|null $observacao
     * @return DemandaProjeto
     */
    public function transicionarStatus(DemandaProjeto $demanda, string $novoStatus, int $usuarioId, ?string $observacao = null): DemandaProjeto
    {
        $novoStatusNorm = strtolower(trim($novoStatus));

        if (!in_array($novoStatusNorm, self::STATUS_VALIDOS)) {
            throw new InvalidArgumentException("Status '{$novoStatus}' é inválido. Status permitidos: " . implode(', ', self::STATUS_VALIDOS));
        }

        $statusAnterior = $demanda->status;

        // Regra de Negócio: Demandas finalizadas não podem retornar a rascunho ou triagem inicial
        if (in_array($statusAnterior, ['concluida', 'cancelada', 'arquivada']) && in_array($novoStatusNorm, ['rascunho', 'recebida'])) {
            throw new InvalidArgumentException("Demanda finalizada ('{$statusAnterior}') não pode retornar ao status inicial ('{$novoStatusNorm}').");
        }

        $historico = $demanda->historico_tramitacao ?? [];
        $historico[] = [
            'data' => now()->toIso8601String(),
            'de' => $statusAnterior,
            'para' => $novoStatusNorm,
            'usuario_id' => $usuarioId,
            'observacao' => $observacao ?? "Status alterado de '{$statusAnterior}' para '{$novoStatusNorm}'",
        ];

        $demanda->status = $novoStatusNorm;
        $demanda->historico_tramitacao = $historico;

        if ($novoStatusNorm === 'concluida') {
            $demanda->data_conclusao = now();
        }

        $demanda->save();

        return $demanda;
    }

    /**
     * Regra de Criar Nova Demanda com Validação Inicial
     *
     * @param array $dados
     * @param int $criadorId
     * @return DemandaProjeto
     */
    public function criarDemanda(array $dados, int $criadorId): DemandaProjeto
    {
        $dados['protocolo'] = $this->gerarProtocolo();
        $dados['criador_id'] = $criadorId;
        $dados['status'] = strtolower($dados['status'] ?? 'recebida');
        $dados['prioridade'] = strtolower($dados['prioridade'] ?? 'media');

        if (!in_array($dados['status'], self::STATUS_VALIDOS)) {
            $dados['status'] = 'recebida';
        }

        $dados['historico_tramitacao'] = [
            [
                'data' => now()->toIso8601String(),
                'de' => 'novo',
                'para' => $dados['status'],
                'usuario_id' => $criadorId,
                'observacao' => 'Demanda aberta no sistema com protocolo único ' . $dados['protocolo'],
            ]
        ];

        return DemandaProjeto::create($dados);
    }
}
