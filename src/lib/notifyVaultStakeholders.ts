import { supabase } from "@/integrations/supabase/client";

type VaultAction = "upload" | "delete" | "validated" | "rejected_doc" | "updated";

interface NotifyVaultStakeholdersOptions {
  propertyId: string;
  propertyTitle?: string;
  documentName: string;
  action: VaultAction;
  actorUserId: string; // who performed the action
}

const actionMessages: Record<VaultAction, string> = {
  upload: "foi adicionado ao cofre",
  delete: "foi removido do cofre",
  validated: "foi validado por um profissional",
  rejected_doc: "foi rejeitado por um profissional",
  updated: "foi atualizado no cofre",
};

const actionTitles: Record<VaultAction, string> = {
  upload: "Novo documento no cofre",
  delete: "Documento removido do cofre",
  validated: "Documento validado",
  rejected_doc: "Documento rejeitado",
  updated: "Documento atualizado",
};

/**
 * Notifies the property owner and all professionals with active vault access
 * when a document is changed (uploaded, deleted, validated, etc.).
 * The actor (person who performed the action) is excluded from notifications.
 */
export async function notifyVaultStakeholders({
  propertyId,
  propertyTitle,
  documentName,
  action,
  actorUserId,
}: NotifyVaultStakeholdersOptions): Promise<void> {
  try {
    // 1. Get property owner
    const { data: property } = await supabase
      .from("properties")
      .select("user_id, title")
      .eq("id", propertyId)
      .maybeSingle();

    const title = propertyTitle || property?.title || "Imóvel";
    const ownerId = property?.user_id;

    // 2. Get all professionals with active vault_access for this property
    const { data: relationships } = await supabase
      .from("professional_relationships")
      .select("professional_id, user_id")
      .eq("property_id", propertyId)
      .eq("relationship_type", "vault_access")
      .eq("is_active", true);

    // 3. Get professional user_ids (the professionals themselves)
    const professionalIds = (relationships || []).map((r) => r.professional_id);
    let professionalUserIds: string[] = [];

    if (professionalIds.length > 0) {
      const { data: professionals } = await supabase
        .from("professionals")
        .select("user_id")
        .in("id", professionalIds);

      professionalUserIds = (professionals || [])
        .map((p) => p.user_id)
        .filter((id): id is string => id !== null);
    }

    // 4. Get buyers with paid vault access for this property
    const { data: buyerAccess } = await supabase
      .from("vault_buyer_access")
      .select("buyer_id")
      .eq("property_id", propertyId)
      .eq("status", "paid");

    const buyerUserIds = (buyerAccess || []).map((b) => b.buyer_id);

    // 5. Also get the requester user_ids from relationships (the property users who granted access)
    const requesterUserIds = (relationships || []).map((r) => r.user_id);

    // 6. Combine all stakeholder IDs, remove duplicates and exclude the actor
    const allStakeholderIds = new Set<string>();
    if (ownerId) allStakeholderIds.add(ownerId);
    professionalUserIds.forEach((id) => allStakeholderIds.add(id));
    requesterUserIds.forEach((id) => allStakeholderIds.add(id));
    buyerUserIds.forEach((id) => allStakeholderIds.add(id));
    allStakeholderIds.delete(actorUserId);

    if (allStakeholderIds.size === 0) {
      console.log("No stakeholders to notify for vault change");
      return;
    }

    // 6. Create notifications for all stakeholders
    const notifications = Array.from(allStakeholderIds).map((userId) => ({
      user_id: userId,
      property_id: propertyId,
      type: `vault_${action}`,
      title: actionTitles[action],
      message: `O documento "${documentName}" ${actionMessages[action]} do imóvel "${title}".`,
      metadata: {
        document_name: documentName,
        action,
        actor_id: actorUserId,
      },
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      console.error("Error sending vault notifications:", error);
    } else {
      console.log(`Vault notifications sent to ${notifications.length} stakeholder(s)`);
    }
  } catch (error) {
    console.error("Error in notifyVaultStakeholders:", error);
  }
}
