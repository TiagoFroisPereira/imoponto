import { Building2, Home, TreePine, Factory, Warehouse } from "lucide-react";

export const propertyTypes = [
  { id: "apartment", label: "Apartamento", icon: Building2 },
  { id: "house", label: "Moradia", icon: Home },
  { id: "land", label: "Terreno", icon: TreePine },
  { id: "office", label: "Escritório", icon: Factory },
  { id: "warehouse", label: "Armazém", icon: Warehouse },
];

export const conditions = [
  { id: "new", label: "Novo / Em construção" },
  { id: "used", label: "Usado (Bom estado)" },
  { id: "renovated", label: "Remodelado" },
  { id: "renovation", label: "Para Renovar" },
];

export const energyCertifications = ["A+", "A", "B", "B-", "C", "D", "E", "F"];
