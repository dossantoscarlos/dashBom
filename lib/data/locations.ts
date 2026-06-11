import type { Location } from "./types";

export const initialLocations: Location[] = [
  {
    id: "loc-1",
    name: "Comitê Central",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    regionId: "reg-4",
    type: "sede",
    capacity: 80,
    responsible: "Administrador",
  },
  {
    id: "loc-2",
    name: "Comitê Zona Norte",
    address: "Rua Voluntários da Pátria, 500 - Santana, São Paulo/SP",
    regionId: "reg-1",
    type: "comitê",
    capacity: 40,
    responsible: "Maria Silva",
  },
  {
    id: "loc-3",
    name: "Ponto de Apoio Sul",
    address: "Rua Domingos de Morais, 200 - Vila Mariana, São Paulo/SP",
    regionId: "reg-2",
    type: "ponto de apoio",
    capacity: 20,
    responsible: "Carlos Mendes",
  },
  {
    id: "loc-4",
    name: "Comitê Interior",
    address: "Praça da Matriz, 50 - Centro, Campinas/SP",
    regionId: "reg-3",
    type: "comitê",
    capacity: 35,
    responsible: "Fernanda Lima",
  },
];
