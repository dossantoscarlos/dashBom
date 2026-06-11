import type { Region } from "./types";

export const initialRegions: Region[] = [
  {
    id: "reg-1",
    name: "Zona Norte",
    uf: "SP",
    municipalities: 12,
    population: 850000,
    coordinator: "Maria Silva",
    voteGoal: 95000,
    votesProjected: 74200,
  },
  {
    id: "reg-2",
    name: "Zona Sul",
    uf: "SP",
    municipalities: 8,
    population: 620000,
    coordinator: "Carlos Mendes",
    voteGoal: 72000,
    votesProjected: 51800,
  },
  {
    id: "reg-3",
    name: "Interior Oeste",
    uf: "SP",
    municipalities: 24,
    population: 430000,
    coordinator: "Fernanda Lima",
    voteGoal: 68000,
    votesProjected: 42100,
  },
  {
    id: "reg-4",
    name: "Capital",
    uf: "SP",
    municipalities: 1,
    population: 1200000,
    coordinator: "Roberto Alves",
    voteGoal: 265000,
    votesProjected: 198400,
  },
];
