<?php

namespace App\Services;

use App\Models\CandidatoTse;
use App\Models\DadoAbertoTse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Service Oficial de Regras de Negócio de Inteligência Eleitoral TSE/TRE
 *
 * REGRAS DE NEGÓCIO REGISTRADAS:
 * 1. Proibição Absoluta de Dados Mockados: Todas as consultas buscam na base oficial ou no CKAN TSE (dadosabertos.tse.jus.br).
 * 2. Correspondência Exata de Sigla Partidária: Pesquisa por 'PL' ou 'PT' filtra apenas a sigla exata do partido.
 * 3. Flexão de Gênero Flexível nos Cargos: 'Deputado Federal' busca tanto 'Deputado Federal' quanto 'Deputada Federal'.
 * 4. Completude por Ano Eleitoral: Filtro por ano (2026, 2024, 2022) busca a totalidade de cargos daquele pleito.
 * 5. Paginação Obrigatória de Performance: Todos os resultados utilizam paginação estruturada.
 * 6. Perfil Demográfico & Concorrente Direto: Ficha detalhada do eleitorado e confronto de votação.
 */
class TseBusinessRulesService
{
    /**
     * Lista de Siglas Partidárias Oficiais para Validação de Busca Exata
     */
    private const SIGLAS_PARTIDARIAS_OFICIAIS = [
        'PL', 'PT', 'MDB', 'PSD', 'PSOL', 'PSB', 'PRTB', 'PODEMOS', 
        'NOVO', 'UNIÃO', 'REPUBLICANOS', 'PP', 'PDT', 'PSDB', 'PCdoB', 
        'REDE', 'SOLIDARIEDADE', 'CIDADANIA', 'AVANTE', 'PMN', 'DC', 'PRD'
    ];

    /**
     * Regra 1, 2, 3, 4 & 5: Filtra Candidatos com Busca Exata Partidária, Flexão de Gênero e Paginação
     *
     * @param array $params
     * @return array
     */
    public function buscarCandidatos(array $params): array
    {
        $q = trim($params['q'] ?? '');
        $ano = trim($params['ano'] ?? 'todos');
        $cargo = trim($params['cargo'] ?? 'todos');
        $partidoParam = strtoupper(trim($params['partido'] ?? $params['siglaPartido'] ?? ''));
        $ufParam = strtoupper(trim($params['uf'] ?? ''));
        
        $page = max(1, intval($params['page'] ?? $params['pagina'] ?? 1));
        $pageSize = min(100, max(1, intval($params['pageSize'] ?? $params['limite'] ?? 10)));

        $query = CandidatoTse::query();

        // Regra 4: Filtro por Ano Eleitoral (2026, 2024, 2022, 2020, 2018)
        if ($ano !== 'todos' && !empty($ano)) {
            $anoInt = intval($ano);
            if ($anoInt > 0) {
                $query->where(function ($sub) use ($anoInt) {
                    $sub->where('ano_eleicao', $anoInt)
                        ->orWhereJsonContains('historico_comparativo_anos', [['ano' => $anoInt]]);
                });
            }
        }

        // Regra 3: Filtro por Cargo Disputado com Flexão de Gênero (M/F)
        if ($cargo !== 'todos' && !empty($cargo)) {
            $this->aplicarFiltroCargoFlexivel($query, $cargo);
        }

        // Filtro por Estado (UF)
        if (!empty($ufParam) && $ufParam !== 'TODOS') {
            $query->where('uf', $ufParam);
        }

        // Regra 2: Filtro por Partido (Prioridade para Sigla Partidária Exata)
        if (!empty($partidoParam) && $partidoParam !== 'TODOS') {
            $query->where('sigla_partido', $partidoParam);
        }

        // Regra 2 & 3: Busca Geral por Termo com Proteção para Sigla Partidária Exata
        if (!empty($q) && $q !== 'todos') {
            $qUpper = strtoupper($q);

            $query->where(function ($sub) use ($q, $qUpper) {
                // Se o termo for uma sigla partidária conhecida, exige match exato na sigla
                if (in_array($qUpper, self::SIGLAS_PARTIDARIAS_OFICIAIS)) {
                    $sub->where('sigla_partido', $qUpper);
                } else {
                    $sub->where('sigla_partido', $qUpper)
                        ->orWhere('nome_partido', 'LIKE', "%{$q}%")
                        ->orWhere('nome_completo', 'LIKE', "%{$q}%")
                        ->orWhere('nome_urna', 'LIKE', "%{$q}%")
                        ->orWhere('numero_candidato', $q)
                        ->orWhere('uf', $qUpper);

                    $this->aplicarFiltroCargoFlexivel($sub, $q, 'orWhere');
                }
            });
        }

        // Regra 5: Paginação da Pesquisa para Alta Performance
        $paginated = $query->orderBy('votos_ultima_eleicao', 'desc')
                           ->paginate($pageSize, ['*'], 'page', $page);

        return [
            'fonte' => 'TSE - Tribunal Superior Eleitoral (Base Oficial de Candidaturas Paginada)',
            'totalEncontrados' => $paginated->total(),
            'paginaAtual' => $paginated->currentPage(),
            'totalPaginas' => $paginated->lastPage(),
            'itensPorPagina' => $paginated->perPage(),
            'candidatos' => $paginated->items(),
        ];
    }

    /**
     * Regra 3: Aplica filtro flexível de cargo que aceita tanto o gênero masculino quanto feminino
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $targetCargo
     * @param string $boolean
     */
    private function aplicarFiltroCargoFlexivel($query, string $targetCargo, string $boolean = 'where'): void
    {
        $norm = mb_strtolower($targetCargo, 'UTF-8');
        $norm = preg_replace('/[áàãâä]/u', 'a', $norm);
        $norm = preg_replace('/[éèêë]/u', 'e', $norm);
        $norm = preg_replace('/[íìîï]/u', 'i', $norm);
        $norm = preg_replace('/[óòõôö]/u', 'o', $norm);
        $norm = preg_replace('/[úùûü]/u', 'u', $norm);
        $norm = preg_replace('/[ç]/u', 'c', $norm);

        $clause = function ($q) use ($norm, $targetCargo) {
            if (Str::contains($norm, 'deputad') && Str::contains($norm, 'federal')) {
                $q->where('cargo_disputado', 'LIKE', '%deputad%')->where('cargo_disputado', 'LIKE', '%federal%');
            } elseif (Str::contains($norm, 'deputad') && (Str::contains($norm, 'estadual') || Str::contains($norm, 'distrital'))) {
                $q->where('cargo_disputado', 'LIKE', '%deputad%')->where(function($s) {
                    $s->where('cargo_disputado', 'LIKE', '%estadual%')->orWhere('cargo_disputado', 'LIKE', '%distrital%');
                });
            } elseif (Str::contains($norm, 'deputad')) {
                $q->where('cargo_disputado', 'LIKE', '%deputad%');
            } elseif (Str::contains($norm, 'senad')) {
                $q->where('cargo_disputado', 'LIKE', '%senad%');
            } elseif (Str::contains($norm, 'prefeit')) {
                $q->where('cargo_disputado', 'LIKE', '%prefeit%');
            } elseif (Str::contains($norm, 'veread')) {
                $q->where('cargo_disputado', 'LIKE', '%veread%');
            } elseif (Str::contains($norm, 'governad')) {
                $q->where('cargo_disputado', 'LIKE', '%governad%');
            } elseif (Str::contains($norm, 'president')) {
                $q->where('cargo_disputado', 'LIKE', '%president%');
            } else {
                $q->where('cargo_disputado', 'LIKE', "%{$targetCargo}%");
            }
        };

        if ($boolean === 'orWhere') {
            $query->orWhere($clause);
        } else {
            $query->where($clause);
        }
    }

    /**
     * Regra 6: Retorna Perfil Demográfico do Eleitorado e Confronto de Concorrente Direto por ID
     *
     * @param string $id
     * @return array|null
     */
    public function obterDetalheCandidato(string $id): ?array
    {
        $candidato = CandidatoTse::where('tse_id', $id)->orWhere('id', $id)->first();

        if (!$candidato) {
            return null;
        }

        return [
            'fonte' => 'TSE - Tribunal Superior Eleitoral (Ficha Oficial do Candidato & Demografia)',
            'candidato' => $candidato,
            'perfilDemografico' => [
                'piramideEtaria' => $candidato->piramide_etaria_eleitorado,
                'cruzamentoPerfil' => $candidato->cruzamento_perfil_demografico,
                'distribuicaoRegional' => $candidato->distribuicao_regional_votos,
                'concentracaoEleitoral' => $candidato->concentracao_eleitoral,
                'concorrenteDireto' => $candidato->concorrente_direto_confronto,
            ]
        ];
    }

    /**
     * Regra 1: Conexão em Tempo Real com a API Pública do CKAN TSE (dadosabertos.tse.jus.br)
     *
     * @param string $queryStr
     * @param string $ano
     * @return array
     */
    public function sincronizarDadosAbertosTse(string $queryStr = 'eleitorado', string $ano = 'todos'): array
    {
        $fullQuery = ($ano !== 'todos' && !empty($ano)) ? "{$queryStr} {$ano}" : $queryStr;
        $url = "https://dadosabertos.tse.jus.br/api/3/action/package_search?q=" . urlencode($fullQuery) . "&rows=20";

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'campanhaPRO-Laravel/1.0 (Integracao-Oficial-TSE)',
                'Accept' => 'application/json'
            ])->timeout(7)->get($url);

            if ($response->successful()) {
                $json = $response->json();
                $results = $json['result']['results'] ?? [];

                $datasetsFormatados = [];

                foreach ($results as $pkg) {
                    $dadosAtu = [
                        'titulo' => $pkg['title'] ?? $pkg['name'],
                        'nome_pacote' => $pkg['name'],
                        'descricao' => $pkg['notes'] ?? 'Dados Abertos Oficiais emitidos pelo Tribunal Superior Eleitoral.',
                        'autor' => $pkg['author'] ?? 'Tribunal Superior Eleitoral - TSE',
                        'organizacao' => $pkg['organization']['title'] ?? 'Justiça Eleitoral / TSE',
                        'ano_eleicao' => is_numeric($ano) ? intval($ano) : null,
                        'categoria' => Str::contains($pkg['name'], 'eleitorado') ? 'eleitorado' : 'resultados',
                        'num_recursos' => $pkg['num_resources'] ?? 0,
                        'recursos_disponiveis' => array_map(function($r) {
                            return [
                                'id' => $r['id'],
                                'formato' => strtoupper($r['format'] ?? 'CSV'),
                                'nome' => $r['name'] ?? 'Arquivo Oficial TSE',
                                'url' => $r['url']
                            ];
                        }, array_slice($pkg['resources'] ?? [], 0, 4)),
                        'url_portal_tse' => "https://dadosabertos.tse.jus.br/dataset/{$pkg['name']}",
                        'metadata_modified_tse' => isset($pkg['metadata_modified']) ? date('Y-m-d H:i:s', strtotime($pkg['metadata_modified'])) : null,
                        'ultima_sincronizacao' => now(),
                    ];

                    DadoAbertoTse::updateOrCreate(
                        ['ckan_id' => $pkg['id']],
                        $dadosAtu
                    );

                    $datasetsFormatados[] = $dadosAtu;
                }

                return [
                    'sucesso' => true,
                    'fonte' => 'TSE - Portal de Dados Abertos (dadosabertos.tse.jus.br)',
                    'ano' => $ano,
                    'totalSincronizados' => count($datasetsFormatados),
                    'statusConexao' => '100% Online (TSE API CKAN Conectada)',
                    'datasets' => $datasetsFormatados,
                ];
            }
        } catch (\Exception $e) {
            Log::warning("[TSE CKAN API WARNING]: " . $e->getMessage());

            // Retorno Gracioso buscando o cache local do Banco de Dados
            $cached = DadoAbertoTse::when($ano !== 'todos', function($q) use ($ano) {
                $q->where('ano_eleicao', intval($ano));
            })->get();

            return [
                'sucesso' => true,
                'fonte' => 'Cache do Banco de Dados Local (Modo Offline TSE)',
                'ano' => $ano,
                'statusConexao' => 'Modo Cache Local (TSE Offline)',
                'totalSincronizados' => $cached->count(),
                'datasets' => $cached,
            ];
        }

        return ['sucesso' => false, 'erro' => 'Resposta não compreendida da API oficial do TSE'];
    }
}
