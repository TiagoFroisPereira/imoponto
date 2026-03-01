import { useMemo } from "react";
import type { PublicProperty } from "@/hooks/usePublicProperties";
import { distritos } from "@/data/portugalLocations";

/**
 * Derives available distritos and concelhos from active properties.
 * Properties store location as "Distrito, Concelho" (e.g. "Lisboa, Sintra").
 */
export function useAvailableLocations(properties: PublicProperty[]) {
  const { availableDistritos, concelhosByDistrito } = useMemo(() => {
    const distritoSet = new Set<string>();
    const concMap = new Map<string, Set<string>>();

    for (const p of properties) {
      if (!p.location) continue;
      // location format: "Distrito, Concelho" or "Distrito"
      const parts = p.location.split(",").map(s => s.trim());
      const distrito = parts[0];
      const concelho = parts[1];

      if (distrito) {
        // Match against known distritos (case-insensitive)
        let matched = distritos.find(d => d.name.toLowerCase() === distrito.toLowerCase());

        // Robustness: If no match and only one part, maybe it's a concelho
        if (!matched && !concelho) {
          const allConcs = distritos.flatMap(d => d.concelhos.map(c => ({ ...c, distritoName: d.name })));
          const foundConc = allConcs.find(c => c.name.toLowerCase() === distrito.toLowerCase());
          if (foundConc) {
            matched = distritos.find(d => d.name === foundConc.distritoName);
            // In this case, the first part was actually a concelho
            const actualConcelho = foundConc.name;
            if (matched) {
              distritoSet.add(matched.name);
              if (!concMap.has(matched.name)) concMap.set(matched.name, new Set());
              concMap.get(matched.name)!.add(actualConcelho);
              continue; // Skip the rest of the loop for this property
            }
          }
        }

        if (matched) {
          distritoSet.add(matched.name);
          if (concelho) {
            if (!concMap.has(matched.name)) concMap.set(matched.name, new Set());
            // Match against known concelhos
            const matchedConc = matched.concelhos.find(c => c.name.toLowerCase() === concelho.toLowerCase());
            if (matchedConc) {
              concMap.get(matched.name)!.add(matchedConc.name);
            }
          }
        }
      }
    }

    return {
      availableDistritos: Array.from(distritoSet).sort((a, b) => a.localeCompare(b)),
      concelhosByDistrito: concMap,
    };
  }, [properties]);

  const getAvailableConcelhos = (distrito: string): string[] => {
    const set = concelhosByDistrito.get(distrito);
    return set ? Array.from(set).sort((a, b) => a.localeCompare(b)) : [];
  };

  return { availableDistritos, getAvailableConcelhos };
}
