"use client";

import { useEffect, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { buttonPrimaryClass, buttonSecondaryClass, inputClass } from "@/components/dashboard/form-styles";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Voluntario } from "@/app/api/voluntarios/route";
import { useDashboard } from "@/contexts/DashboardProvider";

export function VoluntariadoPanel() {
  const { locations, regions } = useDashboard();
  const comites = locations.filter((l) => l.type === "comitê" || l.type === "sede");

  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  // Estado de Edição e Exclusão
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Formulário de Cadastro do Voluntário
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState("Masculino");
  const [dataNascimento, setDataNascimento] = useState("");
  const [tituloEleitor, setTituloEleitor] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("SP");
  const [indicadoPor, setIndicadoPor] = useState("");
  const [idade, setIdade] = useState<number | "">(25);
  const [regiaoDesignada, setRegiaoDesignada] = useState("Zona Norte");
  const [comiteId, setComiteId] = useState("");

  // Status de Validação do TSE e CEP
  const [tseChecking, setTseChecking] = useState(false);
  const [tseValidStatus, setTseValidStatus] = useState<string | null>(null);
  const [cepChecking, setCepChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setEditingId(null);
    setNome("");
    setGenero("Masculino");
    setDataNascimento("");
    setTituloEleitor("");
    setCep("");
    setLogradouro("");
    setBairro("");
    setCidade("");
    setUf("SP");
    setIndicadoPor("");
    setIdade(25);
    setRegiaoDesignada("Zona Norte");
    setComiteId(comites[0]?.id ?? "");
    setTseValidStatus(null);
    setErrorMsg(null);
  }

  function startEdit(v: Voluntario) {
    setEditingId(v.id);
    setNome(v.nome);
    setGenero(v.genero || "Masculino");
    setDataNascimento(v.dataNascimento || "");
    setTituloEleitor(v.tituloEleitor);
    setCep(v.cep || "");
    setLogradouro(v.logradouro || "");
    setBairro(v.bairro || "");
    setCidade(v.cidade || "");
    setUf(v.uf || "SP");
    setIndicadoPor(v.indicadoPor || "");
    setIdade(v.idade);
    setRegiaoDesignada(v.regiaoDesignada);
    setComiteId(v.comiteId || (comites[0]?.id ?? ""));
    setTseValidStatus(v.tseStatus === "REGULAR_ATIVO" ? "✓ REGULAR E ATIVO NO TSE" : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadVoluntarios() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/voluntarios?q=${encodeURIComponent(busca)}`);
      const data = await res.json();
      if (res.ok) {
        setVoluntarios(data.voluntarios ?? []);
      } else {
        throw new Error(data.error ?? "Erro ao carregar voluntários.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVoluntarios();
    if (comites.length > 0 && !comiteId) setComiteId(comites[0].id);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadVoluntarios();
  }

  // 🔍 BUSCA E VALIDAÇÃO AO VIVO DE ELEITOR ATIVO NA API DO TSE
  async function handleVerifyTseVoter() {
    if (!tituloEleitor || tituloEleitor.trim().length < 10) {
      setErrorMsg("Informe um Título de Eleitor válido com pelo menos 10 dígitos para consulta.");
      return;
    }
    setTseChecking(true);
    setErrorMsg(null);
    setTseValidStatus(null);
    try {
      const res = await fetch(`/api/voluntarios?validarTitulo=${encodeURIComponent(tituloEleitor.trim())}`);
      const data = await res.json();
      if (res.ok && data.statusStr) {
        setTseValidStatus(data.statusStr);
      } else {
        setErrorMsg(data.erro ?? "Erro ao consultar título na base do TSE.");
      }
    } catch {
      setErrorMsg("Erro ao conectar com a API da Justiça Eleitoral.");
    } finally {
      setTseChecking(false);
    }
  }

  // 🔍 CONSULTA DE CEP VIA API ViaCEP
  async function handleLookupCep() {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) { setErrorMsg("Informe um CEP válido com 8 dígitos."); return; }
    setCepChecking(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error("CEP não encontrado.");
      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setUf(data.uf || "SP");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Erro ao consultar CEP.");
    } finally {
      setCepChecking(false);
    }
  }

  // 💾 SUBMIT DE CRIAÇÃO / EDIÇÃO DO VOLUNTÁRIO
  async function handleRegisterVolunteer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const selectedComite = comites.find((c) => c.id === comiteId);
      const payload = {
        id: editingId ?? undefined,
        nome, genero, dataNascimento, tituloEleitor,
        cep, logradouro, bairro, cidade, uf,
        indicadoPor, idade, regiaoDesignada,
        comiteId: comiteId,
        comiteNome: selectedComite?.name ?? "Não vinculado",
      };

      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/voluntarios", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar voluntário.");

      setSuccessMsg(
        editingId
          ? "✏️ Voluntário atualizado com sucesso!"
          : "🎉 Voluntário cadastrado com sucesso! Dados verificados com a Justiça Eleitoral."
      );
      resetForm();
      loadVoluntarios();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha ao registrar voluntário.");
    } finally {
      setSubmitting(false);
    }
  }

  // 🗑️ EXCLUSÃO DE VOLUNTÁRIO
  async function handleDeleteVolunteer() {
    if (!deleteId) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/voluntarios?id=${encodeURIComponent(deleteId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir voluntário.");
      setSuccessMsg("🗑️ Voluntário removido com sucesso!");
      setDeleteId(null);
      loadVoluntarios();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha ao remover voluntário.");
      setDeleteId(null);
    }
  }

  return (
    <ModuleBlock title="Gestão de Voluntariado e Comitês" icon="🙋🏼‍♂️">
      <div className="flex flex-col gap-6">

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 font-bold">
            {errorMsg}
          </div>
        )}

        {/* FORMULÁRIO COMPLETO DE CADASTRO / EDIÇÃO DE VOLUNTÁRIO */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{editingId ? "✏️" : "📋"}</span>
              <div>
                <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  {editingId ? "Editar Cadastro de Voluntário" : "Novo Cadastro de Voluntário de Campanha"}
                </h3>
                <p className="text-[10px] text-zinc-400">
                  {editingId
                    ? "Altere os dados do voluntário e salve as atualizações."
                    : "Preencha os dados e valide a situação eleitoral diretamente no TSE."}
                </p>
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className={`${buttonSecondaryClass} text-xs font-bold py-1 px-3`}
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleRegisterVolunteer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">

            {/* Nome Completo */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="vol-nome" className="font-bold text-zinc-700 dark:text-zinc-300">Nome Completo *</label>
              <input id="vol-nome" required className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Carlos da Silva" />
            </div>

            {/* Gênero */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-genero" className="font-bold text-zinc-700 dark:text-zinc-300">Gênero</label>
              <select id="vol-genero" className={inputClass} value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Não informar">Preferiu não informar</option>
              </select>
            </div>

            {/* Data de Nascimento */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-nasc" className="font-bold text-zinc-700 dark:text-zinc-300">Data de Nascimento</label>
              <input id="vol-nasc" type="date" className={inputClass} value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>

            {/* Título de Eleitor com Consulta ao TSE */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="vol-titulo" className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Título de Eleitor *</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-normal">(Validação de Eleitor Ativo no TSE)</span>
              </label>
              <div className="flex gap-2">
                <input id="vol-titulo" required className={inputClass} value={tituloEleitor} onChange={(e) => setTituloEleitor(e.target.value)} placeholder="Informe os 12 dígitos do Título de Eleitor..." />
                <button type="button" onClick={handleVerifyTseVoter} disabled={tseChecking} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-2 rounded-lg text-[10px] shrink-0 transition">
                  {tseChecking ? "Consultando..." : "🔍 Validar TSE"}
                </button>
              </div>
              {tseValidStatus && (
                <span className={`text-[10px] font-bold mt-1 ${tseValidStatus.includes("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                  {tseValidStatus}
                </span>
              )}
            </div>

            {/* Idade */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-idade" className="font-bold text-zinc-700 dark:text-zinc-300">Idade</label>
              <input id="vol-idade" type="number" min={16} max={120} className={inputClass} value={idade} onChange={(e) => setIdade(e.target.value ? Number(e.target.value) : "")} />
            </div>

            {/* Consulta CEP */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-cep" className="font-bold text-zinc-700 dark:text-zinc-300">Consulta CEP</label>
              <div className="flex gap-2">
                <input id="vol-cep" className={inputClass} value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
                <button type="button" onClick={handleLookupCep} disabled={cepChecking} className="bg-zinc-700 hover:bg-zinc-800 text-white font-extrabold px-3 py-2 rounded-lg text-[10px] shrink-0 transition">
                  {cepChecking ? "..." : "🔍 CEP"}
                </button>
              </div>
            </div>

            {/* Logradouro */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="vol-logradouro" className="font-bold text-zinc-700 dark:text-zinc-300">Endereço / Logradouro</label>
              <input id="vol-logradouro" className={inputClass} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua / Avenida..." />
            </div>

            {/* Bairro/Cidade */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-bairro" className="font-bold text-zinc-700 dark:text-zinc-300">Bairro / Cidade</label>
              <input id="vol-bairro" className={inputClass} value={bairro ? `${bairro}${cidade ? ` - ${cidade}` : ''}` : cidade} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro..." />
            </div>

            {/* Indicado por */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-indicador" className="font-bold text-zinc-700 dark:text-zinc-300">Indicado por</label>
              <input id="vol-indicador" className={inputClass} value={indicadoPor} onChange={(e) => setIndicadoPor(e.target.value)} placeholder="Nome da liderança ou parceiro..." />
            </div>

            {/* Região Designada (Vinda dinamicamente do cadastro oficial de Regiões do sistema) */}
            <div className="flex flex-col gap-1">
              <label htmlFor="vol-regiao" className="font-bold text-zinc-700 dark:text-zinc-300">Região Designada</label>
              <select id="vol-regiao" className={inputClass} value={regiaoDesignada} onChange={(e) => setRegiaoDesignada(e.target.value)}>
                <option value="">— Selecione a Região —</option>
                {regions.length > 0 ? (
                  regions.map((reg) => (
                    <option key={reg.id} value={reg.name}>
                      {reg.name} ({reg.uf})
                    </option>
                  ))
                ) : (
                  <option disabled value="">Nenhuma região cadastrada no sistema</option>
                )}
              </select>
              {regions.length === 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠️ Cadastre regiões primeiro no menu Regiões para vinculação.
                </span>
              )}
            </div>

            {/* COMITÊ - Associação ao comitê registrado no sistema */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="vol-comite" className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <span>🏛️ Comitê Vinculado</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-normal">(Comitês registrados no sistema)</span>
              </label>
              <select id="vol-comite" className={inputClass} value={comiteId} onChange={(e) => setComiteId(e.target.value)}>
                <option value="">— Selecione o Comitê —</option>
                {comites.length > 0 ? (
                  comites.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.type}) — {loc.address}</option>
                  ))
                ) : (
                  <option disabled value="">Nenhum comitê cadastrado no sistema</option>
                )}
              </select>
              {comites.length === 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠️ Cadastre comitês/locais primeiro no menu Locais (Comitê) para vinculação.
                </span>
              )}
            </div>

            {/* Botão de Cadastro / Alteração */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={resetForm} className={buttonSecondaryClass}>
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={submitting} className={`${buttonPrimaryClass} ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white font-extrabold px-6 py-2.5 text-xs shadow-sm`}>
                {submitting ? (editingId ? "Salvando..." : "Cadastrando...") : (editingId ? "💾 Salvar Alterações do Voluntário" : "💾 Salvar Cadastro do Voluntário")}
              </button>
            </div>
          </form>
        </div>

        {/* LISTAGEM DOS VOLUNTÁRIOS CADASTRADOS */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Voluntários Registrados ({voluntarios.length})</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input className={`${inputClass} h-8 text-[11px] w-48`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome, região, comitê..." />
              <button type="submit" className="bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-lg">Buscar</button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Nome / Gênero</th>
                  <th className="p-3">Título Eleitor (TSE)</th>
                  <th className="p-3">Nasc. / Idade</th>
                  <th className="p-3">Comitê Vinculado</th>
                  <th className="p-3">Indicado Por</th>
                  <th className="p-3">Região</th>
                  <th className="p-3">Status TSE</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {loading ? (
                  <tr><td colSpan={8} className="p-6 text-center text-zinc-400 italic">Carregando voluntários...</td></tr>
                ) : voluntarios.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-zinc-400 italic">Nenhum voluntário cadastrado.</td></tr>
                ) : (
                  voluntarios.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {v.nome}
                        <span className="block text-[10px] font-normal text-zinc-400">{v.genero}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {v.tituloEleitor}
                        <span className="block text-[9px] text-zinc-400 font-sans">{v.tseZona ?? "Zona Unificada"}</span>
                      </td>
                      <td className="p-3 font-bold">
                        {v.dataNascimento || "—"}
                        <span className="block text-[10px] font-normal text-zinc-400">{v.idade} anos</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          🏛️ {v.comiteNome || "Não vinculado"}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-700 dark:text-zinc-300">{v.indicadoPor}</td>
                      <td className="p-3">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          {v.regiaoDesignada}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${v.tseStatus === "REGULAR_ATIVO" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-700"}`}>
                          {v.tseStatus === "REGULAR_ATIVO" ? "✓ Ativo TSE" : "✗ Irregular"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(v)}
                            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(v.id)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO */}
        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir voluntário"
          message="Tem certeza de que deseja excluir este voluntário? Esta ação não poderá ser desfeita."
          onConfirm={handleDeleteVolunteer}
          onCancel={() => setDeleteId(null)}
        />

      </div>
    </ModuleBlock>
  );
}
