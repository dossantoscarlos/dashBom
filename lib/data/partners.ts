import type { Partner } from "./types";

export const initialPartners: Partner[] = [
  {
    id: "par-1",
    name: "Gráfica União",
    type: "fornecedor",
    contact: "contato@graficauniao.com.br",
    phone: "(11) 3456-7890",
    regionId: "reg-4",
    status: "ativo",
  },
  {
    id: "par-2",
    name: "Rádio Cidade FM",
    type: "mídia",
    contact: "comercial@radiocidade.com.br",
    phone: "(11) 2345-6789",
    regionId: "reg-1",
    status: "ativo",
  },
  {
    id: "par-3",
    name: "Sindicato dos Comerciários",
    type: "institucional",
    contact: "presidencia@sindcomercio.org.br",
    phone: "(11) 4567-8901",
    regionId: "reg-2",
    status: "ativo",
  },
  {
    id: "par-4",
    name: "Rede de Voluntários Unidos",
    type: "voluntário",
    contact: "coordenacao@rvu.org.br",
    phone: "(11) 5678-9012",
    regionId: "reg-3",
    status: "pendente",
  },
];
