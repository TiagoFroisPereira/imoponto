import { Building2, Home, TreePine, Factory, Warehouse } from "lucide-react";

export interface PropertyFormProps {
  mode: 'create' | 'edit' | 'publish';
  propertyId?: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  preview: string;
  isMain: boolean;
}

export const propertyTypes = [
  { id: "apartment", label: "Apartamento", icon: Building2 },
  { id: "house", label: "Moradia", icon: Home },
  { id: "land", label: "Terreno", icon: TreePine },
  { id: "office", label: "Escritório", icon: Factory },
  { id: "warehouse", label: "Armazém", icon: Warehouse },
];

export const defaultTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];
