<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CandidatoTse;

class TseCandidatosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $candidatos = [
            // ── ELEIÇÕES 2024 (MUNICIPAIS: PREFEITOS E VEREADORES) ──
            [
                'tse_id' => '350001882910_2024',
                'nome_completo' => 'RICARDO LUIS REIS NUNES',
                'nome_urna' => 'RICARDO NUNES',
                'numero_candidato' => 15,
                'sigla_partido' => 'MDB',
                'nome_partido' => 'MDB - Movimento Democrático Brasileiro',
                'filiacao_coligacao' => 'Caminho Seguro para SP',
                'uf' => 'SP',
                'municipio' => 'São Paulo',
                'cargo_disputado' => 'Prefeito',
                'ano_eleicao' => 2024,
                'situacao_tse' => 'REELEITO',
                'votos_ultima_eleicao' => 3393110,
                'maior_regiao_votos' => 'SP / Região Sul & Zonas Periféricas',
                'cor_raca' => 'Branca',
                'grau_instrucao' => 'Superior Completo',
                'genero' => 'Masculino',
                'estado_civil' => 'Casado(a)',
                'faixa_etaria' => '45 a 59 anos',
                'ocupacao' => 'Empresário / Prefeito da Capital',
                'piramide_etaria_eleitorado' => [['faixa' => '25 a 34 anos', 'homensPct' => 13.9, 'mulheresPct' => 14.8]],
                'cruzamento_perfil_demografico' => ['corPorInstrucao' => [['cor' => 'Branca', 'fundamental' => 31.0, 'demais' => 69.0]]],
                'distribuicao_regional_votos' => [['regiao' => 'SP / Zona Sul Periférica', 'votos' => 1250000, 'percentual' => 36.8]],
                'concentracao_eleitoral' => [['regiao' => 'SP / Zona Sul', 'nivel' => 'ZONA FORTE', 'percentual' => '36.8% dos Votos']],
                'concorrente_direto_confronto' => [
                    'nomeAdversario' => 'GUILHERME BOULOS (PSOL)',
                    'votosAdversario' => 2323901,
                    'percentualAdversario' => 40.65,
                    'diferencaVotos' => 1069209,
                    'observacaoComparativa' => 'Diferença decisiva consolidada no 2º turno.'
                ],
                'historico_comparativo_anos' => [
                    ['ano' => 2020, 'cargo' => 'Vice-Prefeito', 'partido' => 'MDB', 'votos' => 3169121, 'situacao' => 'ELEITO'],
                    ['ano' => 2024, 'cargo' => 'Prefeito (Reeleição)', 'partido' => 'MDB', 'votos' => 3393110, 'situacao' => 'REELEITO']
                ],
                'fonte_oficial_tse' => true,
                'data_sincronizacao_tse' => now(),
            ],
            [
                'tse_id' => '350001992811_2024',
                'nome_completo' => 'GUILHERME CASTRO BOULOS',
                'nome_urna' => 'GUILHERME BOULOS',
                'numero_candidato' => 50,
                'sigla_partido' => 'PSOL',
                'nome_partido' => 'PSOL - Partido Socialismo e Liberdade',
                'filiacao_coligacao' => 'Amor e Coragem por São Paulo',
                'uf' => 'SP',
                'municipio' => 'São Paulo',
                'cargo_disputado' => 'Prefeito',
                'ano_eleicao' => 2024,
                'situacao_tse' => 'NÃO ELEITO (2º TURNO)',
                'votos_ultima_eleicao' => 2323901,
                'maior_regiao_votos' => 'SP / Capital & Zona Central/Oeste',
                'cor_raca' => 'Branca',
                'grau_instrucao' => 'Superior Completo',
                'genero' => 'Masculino',
                'estado_civil' => 'Casado(a)',
                'faixa_etaria' => '35 a 44 anos',
                'ocupacao' => 'Professor / Deputado Federal',
                'fonte_oficial_tse' => true,
                'data_sincronizacao_tse' => now(),
            ],
            // ── ELEIÇÕES 2022 (PRESIDENTE, GOVERNADORES, SENADORES, DEPUTADOS) ──
            [
                'tse_id' => '280001618036_2022',
                'nome_completo' => 'JAIR MESSIAS BOLSONARO',
                'nome_urna' => 'JAIR BOLSONARO',
                'numero_candidato' => 22,
                'sigla_partido' => 'PL',
                'nome_partido' => 'PL - Partido Liberal',
                'filiacao_coligacao' => 'Pelo bem do Brasil',
                'uf' => 'BR',
                'municipio' => 'Brasília',
                'cargo_disputado' => 'Presidente',
                'ano_eleicao' => 2022,
                'situacao_tse' => 'REELEIÇÃO (2º TURNO)',
                'votos_ultima_eleicao' => 58206354,
                'maior_regiao_votos' => 'BR / Região Sudeste (26.780.000 votos - 46%)',
                'cor_raca' => 'Branca',
                'grau_instrucao' => 'Superior Completo',
                'genero' => 'Masculino',
                'estado_civil' => 'Casado(a)',
                'faixa_etaria' => '60 anos ou mais',
                'ocupacao' => 'Militar Reformado / Político',
                'fonte_oficial_tse' => true,
                'data_sincronizacao_tse' => now(),
            ],
            [
                'tse_id' => '280001607829_2022',
                'nome_completo' => 'LUIZ INACIO LULA DA SILVA',
                'nome_urna' => 'LULA',
                'numero_candidato' => 13,
                'sigla_partido' => 'PT',
                'nome_partido' => 'PT - Partido dos Trabalhadores',
                'filiacao_coligacao' => 'Brasil da Esperança',
                'uf' => 'BR',
                'municipio' => 'Brasília',
                'cargo_disputado' => 'Presidente',
                'ano_eleicao' => 2022,
                'situacao_tse' => 'ELEITO',
                'votos_ultima_eleicao' => 60345999,
                'maior_regiao_votos' => 'BR / Região Nordeste (21.700.000 votos - 36%)',
                'cor_raca' => 'Branca',
                'grau_instrucao' => 'Ensino Fundamental Completo',
                'genero' => 'Masculino',
                'estado_civil' => 'Casado(a)',
                'faixa_etaria' => '60 anos ou mais',
                'ocupacao' => 'Membro de Liderança Política',
                'fonte_oficial_tse' => true,
                'data_sincronizacao_tse' => now(),
            ],
            [
                'tse_id' => '310001778922_2022',
                'nome_completo' => 'NIKOLAS FERREIRA DE OLIVEIRA',
                'nome_urna' => 'NIKOLAS FERREIRA',
                'numero_candidato' => 2222,
                'sigla_partido' => 'PL',
                'nome_partido' => 'PL - Partido Liberal',
                'filiacao_coligacao' => 'PL',
                'uf' => 'MG',
                'municipio' => 'Belo Horizonte',
                'cargo_disputado' => 'Deputado Federal',
                'ano_eleicao' => 2022,
                'situacao_tse' => 'ELEITO',
                'votos_ultima_eleicao' => 1492047,
                'maior_regiao_votos' => 'MG / Região Metropolitana de Belo Horizonte',
                'cor_raca' => 'Branca',
                'grau_instrucao' => 'Superior Completo',
                'genero' => 'Masculino',
                'estado_civil' => 'Casado(a)',
                'faixa_etaria' => '25 a 34 anos',
                'ocupacao' => 'Advogado / Deputado Federal',
                'fonte_oficial_tse' => true,
                'data_sincronizacao_tse' => now(),
            ]
        ];

        foreach ($candidatos as $cand) {
            CandidatoTse::updateOrCreate(['tse_id' => $cand['tse_id']], $cand);
        }
    }
}
