"use client";

import React, { useState, useRef } from "react";
import type { ProjectFileItem } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  FileText,
  Folder,
  Upload,
  Search,
  CheckCircle2,
  Eye,
  Download,
  MoreVertical,
  Plus,
  X,
  File,
  HardDrive,
  Grid,
  List,
  ChevronRight,
  ShieldCheck,
  History,
} from "lucide-react";

interface ProjectArquivosProps {
  files: ProjectFileItem[];
  onAddFile: (f: ProjectFileItem) => void;
  onNavigateTab: (tab: any) => void;
}

export function ProjectArquivos({
  files,
  onAddFile,
  onNavigateTab,
}: ProjectArquivosProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolder, setSelectedFolder] = useState("Documentos técnicos");
  const [selectedFileId, setSelectedFileId] = useState<string>("file-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");

  const folders = [
    { name: "Todos os arquivos", count: 28 },
    { name: "Documentos técnicos", count: 8 },
    { name: "Contratos", count: 5 },
    { name: "Imagens", count: 6 },
    { name: "Relatórios", count: 4 },
    { name: "Comprovantes", count: 3 },
    { name: "Arquivados", count: 2 },
  ];

  const subFolders = [
    { name: "Arquitetura", count: "4 arquivos" },
    { name: "Engenharia", count: "3 arquivos" },
    { name: "Orçamentos", count: "2 arquivos" },
    { name: "Memoriais", count: "1 arquivo" },
  ];

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.linkedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const file = uploaded[0];
    const newFileItem: ProjectFileItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      folder: selectedFolder,
      linkedItem: "ETG-009",
      responsible: "Ana Martins",
      version: "v1",
      modifiedAt: new Date().toLocaleString("pt-BR"),
      verified: true,
      versionsHistory: [
        {
          version: "v1",
          modifiedAt: new Date().toLocaleString("pt-BR"),
          responsible: "Ana Martins",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isCurrent: true,
        },
      ],
    };

    onAddFile(newFileItem);
    setSelectedFileId(newFileItem.id);
    toast(`Arquivo '${file.name}' enviado e armazenado com sucesso!`);
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      toast("Por favor, informe o nome da nova pasta.", "error");
      return;
    }
    toast(`Nova pasta '${folderName}' criada com sucesso!`);
    setFolderName("");
    setShowAddFolderModal(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES (IMAGEM 5) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("visao_geral")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Detalhes do projeto
          </button>

          <button
            type="button"
            onClick={() => setShowAddFolderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Folder className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
            <span>Nova pasta</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="h-4 w-4" strokeWidth={2.5} />
          <span>Enviar arquivos</span>
        </button>
      </div>

      {/* ── CARD INDICADORES DE ARQUIVOS (IMAGEM 5) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Arquivos</span>
            <span className="text-sm font-black text-[#10213D]">28</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <Folder className="h-7 w-7 text-[#7928F5] bg-[#F3EAFF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Pastas</span>
            <span className="text-sm font-black text-[#10213D]">6</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <HardDrive className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Armazenamento</span>
            <span className="text-sm font-black text-[#10213D]">182 MB</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <CheckCircle2 className="h-7 w-7 text-[#F59E0B] bg-[#FFF4E5] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Atualizados esta semana</span>
            <span className="text-sm font-black text-[#10213D]">9</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE FERRAMENTAS E BUSCA ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar arquivos e pastas..."
            className="h-9 w-full pl-9 pr-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid" ? "bg-white text-[#1264F3] shadow-2xs" : "text-[#64748B]"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "list" ? "bg-white text-[#008B63] shadow-2xs" : "text-[#64748B]"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── ESTRUTURA PRINCIPAL: PASTAS ESQUERDA, TABELA MEIO E PAINEL DETALHES DIREITA (IMAGEM 5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-5 items-start">
        {/* Coluna 1: Árvore de Pastas */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <h4 className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider px-2 pb-1">
            Pastas
          </h4>

          <div className="flex flex-col gap-1">
            {folders.map((f) => {
              const isSel = selectedFolder === f.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setSelectedFolder(f.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSel
                      ? "bg-[#EAF2FF] text-[#1264F3] font-black"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#10213D]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`h-4 w-4 shrink-0 ${isSel ? "text-[#1264F3]" : "text-[#64748B]"}`} />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono">{f.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: Sub-pastas & Tabela de Arquivos */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Sub-pastas da pasta selecionada */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subFolders.map((sf) => (
              <div
                key={sf.name}
                className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3 cursor-pointer hover:border-[#1264F3] transition"
              >
                <Folder className="h-6 w-6 text-[#1264F3] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-[#10213D] truncate">{sf.name}</span>
                  <span className="text-[10px] text-[#64748B]">{sf.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela de Arquivos (Imagem 5) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs font-bold text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span>Projeto</span>
                <ChevronRight className="h-3 w-3" />
                <span>Arquivos</span>
                <ChevronRight className="h-3 w-3" />
                <strong className="text-[#10213D] font-black">{selectedFolder}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-extrabold">
                    <th className="py-2">Nome</th>
                    <th className="py-2">Vinculado a</th>
                    <th className="py-2">Responsável</th>
                    <th className="py-2">Versão</th>
                    <th className="py-2">Modificado em</th>
                    <th className="py-2 text-right">Tamanho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#10213D]">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <tr
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-[#EAF2FF] font-bold" : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <td className="py-3 font-bold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#EF4444] shrink-0" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-[#1264F3] font-bold">{file.linkedItem}</td>
                        <td className="py-3 text-[#64748B]">{file.responsible}</td>
                        <td className="py-3">
                          <span className="bg-[#EAF2FF] text-[#1264F3] px-2 py-0.5 rounded text-[10px] font-black">
                            {file.version}
                          </span>
                        </td>
                        <td className="py-3 text-[#64748B] font-mono text-[11px]">{file.modifiedAt}</td>
                        <td className="py-3 text-right font-mono font-bold">{file.size}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Dropzone de Upload Direct In-Page */}
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00A978] bg-[#F8FAFC] hover:bg-[#E8F7F1]/30 rounded-xl p-4 text-center transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Upload className="h-4 w-4 text-[#1264F3]" />
              <span className="text-xs font-extrabold text-[#10213D]">
                Solte arquivos aqui para enviar ou clique para selecionar arquivos
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 3: Painel Lateral de Detalhes do Arquivo Selecionado (Imagem 5) */}
        {selectedFile && (
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
              Detalhes do arquivo
            </h4>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 font-black text-xs flex flex-col items-center justify-center shadow-2xs">
                <FileText className="h-6 w-6" />
                <span className="text-[9px] uppercase font-mono mt-0.5">{selectedFile.type}</span>
              </div>

              <h5 className="font-extrabold text-[#10213D] text-xs leading-snug break-all">{selectedFile.name}</h5>
              <span className="text-[10px] font-mono text-[#64748B]">{selectedFile.size} · {selectedFile.type}</span>

              <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verificado</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast(`Visualizando arquivo ${selectedFile.name}`)}
                className="flex-1 h-9 rounded-xl bg-[#EAF2FF] hover:bg-[#1264F3] text-[#1264F3] hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Visualizar</span>
              </button>

              <button
                type="button"
                onClick={() => toast(`Download do arquivo ${selectedFile.name} iniciado!`)}
                className="flex-1 h-9 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-[#008B63]" />
                <span>Baixar</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs border-t border-[#E2E8F0] pt-3 font-medium">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Versão atual:</span>
                <span className="font-extrabold text-[#1264F3]">{selectedFile.version}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Responsável:</span>
                <span className="font-extrabold text-[#10213D]">{selectedFile.responsible}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Modificado em:</span>
                <span className="font-mono text-[11px] text-[#10213D]">{selectedFile.modifiedAt}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Vinculado a tarefa:</span>
                <span className="font-mono text-[#1264F3] font-bold">{selectedFile.linkedItem}</span>
              </div>
            </div>

            {/* Histórico de Versões */}
            <div className="flex flex-col gap-2 border-t border-[#E2E8F0] pt-3">
              <span className="text-[11px] font-extrabold text-[#10213D] flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-[#7928F5]" />
                <span>Histórico de versões</span>
              </span>

              <div className="flex flex-col gap-2">
                {selectedFile.versionsHistory?.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#1264F3] font-mono">{v.version}</span>
                      <span className="text-[#64748B] text-[10px]">{v.modifiedAt}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#10213D]">{v.responsible}</span>
                      {v.isCurrent && (
                        <span className="bg-[#E8F7F1] text-[#008B63] text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                          Atual
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NOVA PASTA */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">Criar Nova Pasta</h3>
              <button type="button" onClick={() => setShowAddFolderModal(false)} className="text-[#64748B] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#10213D]">Nome da Pasta *</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex.: Relatórios de Engenharia"
                className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddFolderModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="px-5 py-2 rounded-xl bg-[#008B63] text-white font-extrabold"
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
