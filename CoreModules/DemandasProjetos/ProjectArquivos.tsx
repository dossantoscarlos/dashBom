"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import type { ProjectFileItem, AuditEvent } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  Folder,
  FileText,
  Upload,
  Search,
  Eye,
  Download,
  ShieldCheck,
  History,
  MoreVertical,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Pencil,
  FolderEdit,
  FolderInput,
} from "lucide-react";

interface ProjectArquivosProps {
  files: ProjectFileItem[];
  onAddFile: (f: ProjectFileItem) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onUpdateFile?: (file: ProjectFileItem) => void;
  onAddAuditEvent: (event: AuditEvent) => void;
  onNavigateTab: (tab: any) => void;
}

export function ProjectArquivos({
  files,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onUpdateFile,
  onAddAuditEvent,
  onNavigateTab,
}: ProjectArquivosProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolder, setSelectedFolder] = useState("Todos os arquivos");
  const [selectedFileId, setSelectedFileId] = useState<string>("file-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Menus contextuais
  const [contextMenuFileId, setContextMenuFileId] = useState<string | null>(null);
  const [contextMenuFolderName, setContextMenuFolderName] = useState<string | null>(null);

  // Modais de Documentos e Pastas
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [docFolder, setDocFolder] = useState("Documentos técnicos");
  const [docResponsible, setDocResponsible] = useState("Ana Martins");
  const [docLinkedItem, setDocLinkedItem] = useState("ETG-009");
  const [docFileBlob, setDocFileBlob] = useState<File | null>(null);

  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameFileValue, setRenameFileValue] = useState("");

  const [showMoveFileModal, setShowMoveFileModal] = useState(false);
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState("Documentos técnicos");

  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);

  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renameFolderOldName, setRenameFolderOldName] = useState("");
  const [renameFolderValue, setRenameFolderValue] = useState("");

  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [deleteFolderName, setDeleteFolderName] = useState("");

  // Lista de pastas base
  const [baseFolderNames, setBaseFolderNames] = useState([
    "Documentos técnicos",
    "Contratos",
    "Imagens",
    "Relatórios",
    "Comprovantes",
    "Arquivados",
  ]);

  // Lista de pastas existentes para selects
  const existingFolders = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of files) {
      if (f.folder && f.folder !== "Todos os arquivos") {
        counts[f.folder] = (counts[f.folder] || 0) + 1;
      }
    }
    return Array.from(new Set([...baseFolderNames, ...Object.keys(counts)]));
  }, [files, baseFolderNames]);

  // Calcular contagens reais por pasta
  const folderList = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of files) {
      counts[f.folder] = (counts[f.folder] || 0) + 1;
    }
    return [
      { name: "Todos os arquivos", count: files.length },
      ...existingFolders.map((name) => ({ name, count: counts[name] || 0 })),
    ];
  }, [files, existingFolders]);

  // Fechar menus contextuais ao clicar fora
  useEffect(() => {
    const handler = () => {
      setContextMenuFileId(null);
      setContextMenuFolderName(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.linkedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolder === "Todos os arquivos" || f.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const selectedFile = files.find((f) => f.id === selectedFileId) || filteredFiles[0] || files[0];

  const getOrGenerateFileUrl = (file: ProjectFileItem): string => {
    if (file.url && file.url !== "#") return file.url;

    const content = `================================================================
RELATÓRIO / DOCUMENTO TÉCNICO OFICIAL DO PROJETO
================================================================
Documento: ${file.name}
Tipo: ${file.type}
Tamanho: ${file.size}
Pasta: ${file.folder}
Responsável: ${file.responsible}
Versão: ${file.version}
Modificado em: ${file.modifiedAt}
Status: Documento Verificado e Armazenado com Sucesso

Conteúdo do documento anexado ao sistema de gestão.
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  const handlePreviewFile = (file: ProjectFileItem) => {
    const fileUrl = getOrGenerateFileUrl(file);
    window.open(fileUrl, "_blank");
    toast(`Visualizando arquivo '${file.name}' em nova aba.`);
  };

  const handleDownloadFile = (file: ProjectFileItem) => {
    const fileUrl = getOrGenerateFileUrl(file);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Download do arquivo '${file.name}' concluído com sucesso!`);
  };

  // Upload rápido direto via input ou dropzone
  const handleQuickFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const file = uploaded[0];
    const targetFolder =
      selectedFolder !== "Todos os arquivos" ? selectedFolder : "Documentos técnicos";

    const newFileItem: ProjectFileItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      folder: targetFolder,
      url: URL.createObjectURL(file),
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
    toast(`Arquivo '${file.name}' adicionado à pasta '${targetFolder}' com sucesso!`);
  };

  // Abertura do modal completo de Adicionar Documento
  const handleOpenAddDocModal = () => {
    setDocName("");
    setDocFolder(
      selectedFolder !== "Todos os arquivos" ? selectedFolder : existingFolders[0] || "Documentos técnicos"
    );
    setDocResponsible("Ana Martins");
    setDocLinkedItem("ETG-009");
    setDocFileBlob(null);
    setShowAddDocModal(true);
  };

  // Confirmação de criação pelo modal
  const handleConfirmAddDoc = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!docName.trim() && !docFileBlob) {
      toast("Por favor, selecione um arquivo ou informe o nome do documento.", "error");
      return;
    }

    const finalName = docName.trim() || docFileBlob?.name || "Documento_Sem_Nome.pdf";
    const ext = finalName.split(".").pop()?.toUpperCase() || "PDF";
    const fileSizeStr = docFileBlob
      ? `${(docFileBlob.size / (1024 * 1024)).toFixed(1)} MB`
      : "1.2 MB";

    const newFileItem: ProjectFileItem = {
      id: `file-${Date.now()}`,
      name: finalName,
      type: ext,
      size: fileSizeStr,
      folder: docFolder,
      url: docFileBlob ? URL.createObjectURL(docFileBlob) : undefined,
      linkedItem: docLinkedItem.trim() || "ETG-009",
      responsible: docResponsible.trim() || "Ana Martins",
      version: "v1",
      modifiedAt: new Date().toLocaleString("pt-BR"),
      verified: true,
      versionsHistory: [
        {
          version: "v1",
          modifiedAt: new Date().toLocaleString("pt-BR"),
          responsible: docResponsible.trim() || "Ana Martins",
          size: fileSizeStr,
          isCurrent: true,
        },
      ],
    };

    onAddFile(newFileItem);
    setSelectedFileId(newFileItem.id);
    toast(`Documento '${finalName}' adicionado à pasta '${docFolder}' com sucesso!`);

    setShowAddDocModal(false);
  };

  const handleCreateFolder = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!folderName.trim()) {
      toast("Por favor, informe o nome da nova pasta.", "error");
      return;
    }
    const newFolderName = folderName.trim();
    setBaseFolderNames((prev) => [...prev, newFolderName]);
    setSelectedFolder(newFolderName);
    toast(`Nova pasta '${newFolderName}' criada com sucesso!`);

    // Registrar na auditoria
    const auditId = `evt-${Date.now()}`;
    onAddAuditEvent({
      id: auditId,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#1264F3]",
      actionText: `criou a pasta '${newFolderName}'`,
      eventType: "Arquivo",
      targetCode: "PASTA",
      targetTitle: newFolderName,
      newValue: `Pasta criada: ${newFolderName}`,
      isImportant: false,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    setFolderName("");
    setShowAddFolderModal(false);
  };

  // ── AÇÕES EM ARQUIVO ──
  const handleOpenRenameFile = (file: ProjectFileItem) => {
    setRenameFileId(file.id);
    setRenameFileValue(file.name);
    setShowRenameFileModal(true);
    setContextMenuFileId(null);
  };

  const handleConfirmRenameFile = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!renameFileId || !renameFileValue.trim()) return;
    const file = files.find((f) => f.id === renameFileId);
    if (!file) return;
    const oldName = file.name;
    onRenameFile(renameFileId, renameFileValue.trim());
    toast(`Arquivo renomeado para '${renameFileValue.trim()}'`);

    onAddAuditEvent({
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#1264F3]",
      actionText: `renomeou o arquivo '${oldName}' para '${renameFileValue.trim()}'`,
      eventType: "Arquivo",
      targetCode: file.linkedItem,
      targetTitle: oldName,
      previousValue: oldName,
      newValue: renameFileValue.trim(),
      isImportant: false,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    setShowRenameFileModal(false);
    setRenameFileId(null);
  };

  const handleOpenMoveFile = (file: ProjectFileItem) => {
    setMoveFileId(file.id);
    setTargetMoveFolder(file.folder);
    setShowMoveFileModal(true);
    setContextMenuFileId(null);
  };

  const handleConfirmMoveFile = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!moveFileId || !targetMoveFolder) return;
    const file = files.find((f) => f.id === moveFileId);
    if (!file) return;

    const oldFolder = file.folder;
    if (oldFolder === targetMoveFolder) {
      setShowMoveFileModal(false);
      return;
    }

    const updatedFile = { ...file, folder: targetMoveFolder };
    if (onUpdateFile) {
      onUpdateFile(updatedFile);
    } else {
      onDeleteFile(file.id);
      onAddFile(updatedFile);
    }

    toast(`Arquivo '${file.name}' movido para a pasta '${targetMoveFolder}'.`);

    onAddAuditEvent({
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#7928F5]",
      actionText: `moveu o arquivo '${file.name}' da pasta '${oldFolder}' para '${targetMoveFolder}'`,
      eventType: "Arquivo",
      targetCode: file.linkedItem,
      targetTitle: file.name,
      previousValue: `Pasta: ${oldFolder}`,
      newValue: `Pasta: ${targetMoveFolder}`,
      isImportant: false,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    setShowMoveFileModal(false);
    setMoveFileId(null);
  };

  const handleOpenDeleteFile = (file: ProjectFileItem) => {
    setDeleteFileId(file.id);
    setShowDeleteFileModal(true);
    setContextMenuFileId(null);
  };

  const handleConfirmDeleteFile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!deleteFileId) return;
    const file = files.find((f) => f.id === deleteFileId);
    if (!file) {
      setShowDeleteFileModal(false);
      setDeleteFileId(null);
      return;
    }

    onDeleteFile(deleteFileId);
    toast(`Arquivo '${file.name}' excluído com sucesso.`, "error");

    onAddAuditEvent({
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#EF4444]",
      actionText: `excluiu o arquivo '${file.name}' da pasta '${file.folder}'`,
      eventType: "Arquivo",
      targetCode: file.linkedItem,
      targetTitle: file.name,
      previousValue: `Arquivo: ${file.name} (${file.size})`,
      newValue: "Arquivo removido",
      isImportant: true,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    if (selectedFileId === deleteFileId) {
      const remaining = files.filter((f) => f.id !== deleteFileId);
      setSelectedFileId(remaining[0]?.id || "");
    }
    setShowDeleteFileModal(false);
    setDeleteFileId(null);
  };

  // ── AÇÕES EM PASTA ──
  const handleOpenRenameFolder = (folderName: string) => {
    setRenameFolderOldName(folderName);
    setRenameFolderValue(folderName);
    setShowRenameFolderModal(true);
    setContextMenuFolderName(null);
  };

  const handleConfirmRenameFolder = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!renameFolderValue.trim() || !renameFolderOldName) return;
    const newName = renameFolderValue.trim();
    setBaseFolderNames((prev) => prev.map((n) => (n === renameFolderOldName ? newName : n)));
    if (selectedFolder === renameFolderOldName) setSelectedFolder(newName);

    toast(`Pasta '${renameFolderOldName}' renomeada para '${newName}'`);

    onAddAuditEvent({
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#7928F5]",
      actionText: `renomeou a pasta '${renameFolderOldName}' para '${newName}'`,
      eventType: "Arquivo",
      targetCode: "PASTA",
      targetTitle: renameFolderOldName,
      previousValue: renameFolderOldName,
      newValue: newName,
      isImportant: false,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    setShowRenameFolderModal(false);
  };

  // ── EXCLUIR PASTA ──
  const handleOpenDeleteFolder = (name: string) => {
    setDeleteFolderName(name);
    setShowDeleteFolderModal(true);
    setContextMenuFolderName(null);
  };

  const handleConfirmDeleteFolder = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!deleteFolderName) return;
    const filesInFolder = files.filter((f) => f.folder === deleteFolderName);
    filesInFolder.forEach((f) => {
      if (onUpdateFile) {
        onUpdateFile({ ...f, folder: "Documentos técnicos" });
      }
    });

    setBaseFolderNames((prev) => prev.filter((n) => n !== deleteFolderName));
    if (selectedFolder === deleteFolderName) setSelectedFolder("Todos os arquivos");
    toast(
      `Pasta '${deleteFolderName}' excluída. ${
        filesInFolder.length > 0 ? `${filesInFolder.length} arquivo(s) movido(s) para 'Documentos técnicos'.` : ""
      }`,
      "error"
    );

    onAddAuditEvent({
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Usuário atual",
      avatarInitials: "UC",
      avatarBg: "bg-[#EF4444]",
      actionText: `excluiu a pasta '${deleteFolderName}' (${filesInFolder.length} arquivo(s))`,
      eventType: "Arquivo",
      targetCode: "PASTA",
      targetTitle: deleteFolderName,
      previousValue: `Pasta com ${filesInFolder.length} arquivo(s)`,
      newValue: "Pasta excluída",
      isImportant: true,
      fullDate: new Date().toLocaleString("pt-BR"),
    });

    setShowDeleteFolderModal(false);
    setDeleteFolderName("");
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES ── */}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddDocModal}
            className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Adicionar documento</span>
          </button>
        </div>
      </div>

      {/* ── CARD INDICADORES DE ARQUIVOS ── */}
      {(() => {
        const totalPastas = folderList.length - 1; // exclui "Todos os arquivos"
        const verificados = files.filter((f) => f.verified).length;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#64748B]">Arquivos cadastrados</span>
                <span className="text-sm font-black text-[#10213D]">{files.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
              <Folder className="h-7 w-7 text-[#7928F5] bg-[#F3EAFF] p-1.5 rounded-xl shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#64748B]">Pastas ativas</span>
                <span className="text-sm font-black text-[#10213D]">{totalPastas}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
              <ShieldCheck className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#64748B]">Verificados</span>
                <span className="text-sm font-black text-[#008B63]">{verificados}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
              <Upload className="h-7 w-7 text-[#F59E0B] bg-[#FFF4E5] p-1.5 rounded-xl shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#64748B]">Pasta atual</span>
                <span className="text-xs font-black text-[#10213D] truncate max-w-[120px]">
                  {selectedFolder}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── GRID PRINCIPAL: 3 COLUNAS (Pastas / Tabela de Arquivos / Detalhes) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-6 items-start">
        {/* Coluna 1: Lista de Pastas */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">Pastas</h4>
            <button
              type="button"
              onClick={() => setShowAddFolderModal(true)}
              className="text-[#1264F3] hover:text-[#0B5FEA] font-bold text-xs p-1 cursor-pointer"
              title="Nova pasta"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {folderList.map((f) => {
              const isSelected = selectedFolder === f.name;
              const isAllFiles = f.name === "Todos os arquivos";
              return (
                <div
                  key={f.name}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#EAF2FF] text-[#1264F3]"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#10213D]"
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedFolder(f.name)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedFolder(f.name)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <Folder
                      className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#1264F3]" : "text-[#94A3B8]"}`}
                    />
                    <span className="truncate">{f.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isSelected
                          ? "bg-[#1264F3] text-white"
                          : "bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#E2E8F0]"
                      }`}
                    >
                      {f.count}
                    </span>

                    {!isAllFiles && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuFolderName(contextMenuFolderName === f.name ? null : f.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E2E8F0] rounded text-[#64748B] transition cursor-pointer"
                        title="Opções da pasta"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Menu Contextual da Pasta */}
                  {contextMenuFolderName === f.name && (
                    <div
                      className="absolute left-full ml-2 top-0 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 min-w-[160px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenRenameFolder(f.name)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                      >
                        <FolderEdit className="h-3.5 w-3.5 text-[#7928F5]" />
                        Renomear pasta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteFolder(f.name)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer border-t border-[#F1F5F9] mt-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir pasta
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: Tabela de Arquivos */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 text-xs font-bold text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span>Projeto</span>
                <ChevronRight className="h-3 w-3" />
                <span>Arquivos</span>
                <ChevronRight className="h-3 w-3" />
                <strong className="text-[#10213D] font-black">{selectedFolder}</strong>
                <span className="text-[11px] font-normal text-[#94A3B8]">
                  ({filteredFiles.length} documento{filteredFiles.length === 1 ? "" : "s"})
                </span>
              </span>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar arquivo..."
                  className="h-8 pl-8 pr-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-extrabold">
                    <th className="py-2.5">Nome do documento</th>
                    <th className="py-2.5">Pasta</th>
                    <th className="py-2.5">Vinculado a</th>
                    <th className="py-2.5">Responsável</th>
                    <th className="py-2.5">Versão</th>
                    <th className="py-2.5">Modificado em</th>
                    <th className="py-2.5 text-right">Tamanho</th>
                    <th className="py-2.5 text-center w-16">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#10213D]">
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#94A3B8] text-xs">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-[#CBD5E1]" />
                          <p>Nenhum documento encontrado nesta pasta.</p>
                          <button
                            type="button"
                            onClick={handleOpenAddDocModal}
                            className="mt-1 px-3 py-1.5 rounded-lg bg-[#EAF2FF] text-[#1264F3] font-bold text-xs hover:bg-[#DBEAFE]"
                          >
                            + Adicionar documento aqui
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <tr
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`cursor-pointer transition group relative ${
                          isSelected ? "bg-[#EAF2FF]/70 font-bold" : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <td className="py-3 font-bold">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#EF4444] shrink-0" />
                            <span className="truncate max-w-[190px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-md text-[10px] font-bold">
                            {file.folder}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-[#1264F3] font-bold">
                          {file.linkedItem}
                        </td>
                        <td className="py-3 text-[#64748B]">{file.responsible}</td>
                        <td className="py-3">
                          <span className="bg-[#EAF2FF] text-[#1264F3] px-2 py-0.5 rounded text-[10px] font-black">
                            {file.version}
                          </span>
                        </td>
                        <td className="py-3 text-[#64748B] font-mono text-[11px]">{file.modifiedAt}</td>
                        <td className="py-3 text-right font-mono font-bold">{file.size}</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenDeleteFile(file);
                              }}
                              className="p-1 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition cursor-pointer"
                              title="Excluir arquivo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenuFileId(contextMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1 rounded hover:bg-slate-200 transition cursor-pointer text-[#64748B]"
                                title="Mais opções"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                              {contextMenuFileId === file.id && (
                                <div
                                  className="absolute right-0 top-7 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 min-w-[170px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRenameFile(file)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-[#1264F3]" />
                                    Renomear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMoveFile(file)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                                  >
                                    <FolderInput className="h-3.5 w-3.5 text-[#7928F5]" />
                                    Mover pasta
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePreviewFile(file)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-[#008B63]" />
                                    Visualizar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                                  >
                                    <Download className="h-3.5 w-3.5 text-[#0B5FEA]" />
                                    Baixar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleOpenDeleteFile(file);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer border-t border-[#F1F5F9] mt-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Dropzone de Upload Direct In-Page */}
            <input ref={fileInputRef} type="file" onChange={handleQuickFileUpload} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00A978] bg-[#F8FAFC] hover:bg-[#E8F7F1]/30 rounded-xl p-4 text-center transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Upload className="h-4 w-4 text-[#1264F3]" />
              <span className="text-xs font-extrabold text-[#10213D]">
                Enviar arquivo direto para a pasta:{" "}
                <strong className="text-[#0B5FEA]">
                  {selectedFolder !== "Todos os arquivos" ? selectedFolder : "Documentos técnicos"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 3: Painel Lateral de Detalhes do Arquivo Selecionado */}
        {selectedFile ? (
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
              Detalhes do arquivo
            </h4>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 font-black text-xs flex flex-col items-center justify-center shadow-2xs">
                <FileText className="h-6 w-6" />
                <span className="text-[9px] uppercase font-mono mt-0.5">{selectedFile.type}</span>
              </div>

              <h5 className="font-extrabold text-[#10213D] text-xs leading-snug break-all">
                {selectedFile.name}
              </h5>
              <span className="text-[10px] font-mono text-[#64748B]">
                {selectedFile.size} · {selectedFile.type}
              </span>

              <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verificado</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePreviewFile(selectedFile)}
                className="h-9 rounded-xl bg-[#EAF2FF] hover:bg-[#1264F3] text-[#1264F3] hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Visualizar</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadFile(selectedFile)}
                className="h-9 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-[#008B63]" />
                <span>Baixar</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenMoveFile(selectedFile)}
                className="h-9 rounded-xl bg-[#F3EAFF] hover:bg-[#7928F5] text-[#7928F5] hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FolderInput className="h-3.5 w-3.5" />
                <span>Mover pasta</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenDeleteFile(selectedFile);
                }}
                className="h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#EF4444]/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs border-t border-[#E2E8F0] pt-3 font-medium">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Pasta atual:</span>
                <span className="font-extrabold text-[#7928F5]">{selectedFile.folder}</span>
              </div>

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
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-center text-[#94A3B8] text-xs">
            Selecione um arquivo para ver os detalhes.
          </div>
        )}
      </div>

      {/* MODAL ADICIONAR DOCUMENTO */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#008B63]" />
                Adicionar Novo Documento
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {/* Seleção de arquivo do computador */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Arquivo local</label>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      setDocFileBlob(f);
                      if (!docName) setDocName(f.name);
                    }
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#008B63] bg-[#F8FAFC] rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4 text-[#008B63]" />
                  <span className="font-semibold text-[#10213D]">
                    {docFileBlob ? docFileBlob.name : "Clique para escolher um arquivo do computador"}
                  </span>
                </div>
              </div>

              {/* Nome do documento */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Nome do documento *</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ex.: Memorial_Descritivo_Revisado.pdf"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                />
              </div>

              {/* Pasta de Destino */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Pasta de destino *</label>
                <select
                  value={docFolder}
                  onChange={(e) => setDocFolder(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#10213D]"
                >
                  {existingFolders.map((folder) => (
                    <option key={folder} value={folder}>
                      📁 {folder}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarefa Vinculada e Responsável */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#10213D]">Vinculado a (Tarefa/Item)</label>
                  <input
                    type="text"
                    value={docLinkedItem}
                    onChange={(e) => setDocLinkedItem(e.target.value)}
                    placeholder="ETG-009"
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-bold text-[#1264F3]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#10213D]">Responsável</label>
                  <input
                    type="text"
                    value={docResponsible}
                    onChange={(e) => setDocResponsible(e.target.value)}
                    placeholder="Ana Martins"
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAddDoc}
                className="px-5 py-2 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Salvar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MOVER ARQUIVO DE PASTA */}
      {showMoveFileModal && (() => {
        const fileToMove = files.find((f) => f.id === moveFileId);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-extrabold text-[#10213D] flex items-center gap-2">
                  <FolderInput className="h-5 w-5 text-[#7928F5]" />
                  Mover Documento
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMoveFileModal(false)}
                  className="text-[#64748B] p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-[#64748B]">
                Selecione a nova pasta para o documento{" "}
                <strong className="text-[#10213D]">{fileToMove?.name}</strong>:
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Pasta de destino</label>
                <select
                  value={targetMoveFolder}
                  onChange={(e) => setTargetMoveFolder(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#10213D]"
                >
                  {existingFolders.map((f) => (
                    <option key={f} value={f}>
                      📁 {f} {f === fileToMove?.folder ? "(Pasta Atual)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowMoveFileModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMoveFile}
                  className="px-5 py-2 rounded-xl bg-[#7928F5] text-white font-extrabold text-xs cursor-pointer"
                >
                  Mover Documento
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL NOVA PASTA */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">Criar Nova Pasta</h3>
              <button
                type="button"
                onClick={() => setShowAddFolderModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
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
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="px-5 py-2 rounded-xl bg-[#008B63] text-white font-extrabold cursor-pointer"
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RENOMEAR ARQUIVO */}
      {showRenameFileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D] flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#1264F3]" />
                Renomear arquivo
              </h3>
              <button
                type="button"
                onClick={() => setShowRenameFileModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#10213D]">Novo nome *</label>
              <input
                type="text"
                value={renameFileValue}
                onChange={(e) => setRenameFileValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmRenameFile()}
                className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowRenameFileModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRenameFile}
                className="px-5 py-2 rounded-xl bg-[#1264F3] text-white font-extrabold text-xs cursor-pointer"
              >
                Renomear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR ARQUIVO */}
      {showDeleteFileModal && (() => {
        const fileToDelete = files.find((f) => f.id === deleteFileId);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-extrabold text-[#EF4444] flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir documento
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteFileModal(false)}
                  className="text-[#64748B] p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-[#64748B]">
                Tem certeza que deseja excluir permanentemente o documento{" "}
                <strong className="text-[#10213D]">{fileToDelete?.name}</strong> da pasta{" "}
                <strong className="text-[#7928F5]">{fileToDelete?.folder}</strong>?
                Esta ação será registrada no histórico de auditoria.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowDeleteFileModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFile}
                  className="px-5 py-2 rounded-xl bg-[#EF4444] text-white font-extrabold text-xs cursor-pointer"
                >
                  Excluir documento
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL RENOMEAR PASTA */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D] flex items-center gap-2">
                <FolderEdit className="h-4 w-4 text-[#7928F5]" />
                Renomear pasta
              </h3>
              <button
                type="button"
                onClick={() => setShowRenameFolderModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#10213D]">Novo nome *</label>
              <input
                type="text"
                value={renameFolderValue}
                onChange={(e) => setRenameFolderValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmRenameFolder()}
                className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowRenameFolderModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRenameFolder}
                className="px-5 py-2 rounded-xl bg-[#7928F5] text-white font-extrabold text-xs cursor-pointer"
              >
                Renomear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR PASTA */}
      {showDeleteFolderModal && (() => {
        const filesInFolder = files.filter((f) => f.folder === deleteFolderName);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-extrabold text-[#EF4444] flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir pasta
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteFolderModal(false)}
                  className="text-[#64748B] p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-[#64748B]">
                <p>
                  Tem certeza que deseja excluir a pasta{" "}
                  <strong className="text-[#10213D]">{deleteFolderName}</strong>?
                </p>
                {filesInFolder.length > 0 ? (
                  <div className="p-3 bg-[#FFF7ED] border border-[#F59E0B]/30 rounded-xl text-[#92400E]">
                    <strong>{filesInFolder.length} arquivo(s)</strong> serão movidos para a pasta 'Documentos técnicos'. Esta ação será registrada na auditoria.
                  </div>
                ) : (
                  <p className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    A pasta está vazia. A exclusão será registrada na auditoria.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowDeleteFolderModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFolder}
                  className="px-5 py-2 rounded-xl bg-[#EF4444] text-white font-extrabold text-xs cursor-pointer"
                >
                  Excluir pasta
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
