import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Utilizador não encontrado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    console.log(`[delete-account] Deleting account for user: ${userId}`);

    // Use service role to delete all user data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Delete in order to respect foreign key constraints
    const tables = [
      { table: "messages", column: "sender_id" },
      { table: "conversations", column: "buyer_id" },
      { table: "conversations", column: "seller_id" },
      { table: "favorites", column: "user_id" },
      { table: "notifications", column: "user_id" },
      { table: "vault_documents", column: "user_id" },
      { table: "vault_buyer_access", column: "buyer_id" },
      { table: "vault_buyer_access", column: "owner_id" },
      { table: "vault_access_requests", column: "requester_id" },
      { table: "vault_consent_acceptances", column: "user_id" },
      { table: "visit_bookings", column: "visitor_id" },
      { table: "visit_bookings", column: "seller_id" },
      { table: "visit_availability", column: "seller_id" },
      { table: "contact_requests", column: "user_id" },
      { table: "professional_event_participants", column: "user_id" },
      { table: "professional_reviews", column: "user_id" },
      { table: "professional_relationships", column: "user_id" },
      { table: "professional_legal_acceptances", column: "user_id" },
      { table: "user_legal_acceptances", column: "user_id" },
      { table: "property_proposals", column: "user_id" },
      { table: "sms_notifications", column: "user_id" },
      { table: "user_roles", column: "user_id" },
      { table: "admin_logs", column: "admin_id" },
    ];

    for (const { table, column } of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq(column, userId);
      if (error) {
        console.warn(`[delete-account] Warning deleting from ${table}.${column}:`, error.message);
      }
    }

    // Delete professional events created by user
    const { data: events } = await supabaseAdmin
      .from("professional_events")
      .select("id")
      .eq("created_by", userId);
    
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      await supabaseAdmin
        .from("professional_event_participants")
        .delete()
        .in("event_id", eventIds);
      await supabaseAdmin
        .from("professional_events")
        .delete()
        .eq("created_by", userId);
    }

    // Delete properties and related data
    const { data: properties } = await supabaseAdmin
      .from("properties")
      .select("id")
      .eq("user_id", userId);

    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id);
      const propertyIdStrings = propertyIds.map(id => id.toString());

      // Delete all FK references to these properties
      await supabaseAdmin.from("property_addons").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("favorites").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("vault_documents").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("vault_buyer_access").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("vault_consent_acceptances").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("visit_availability").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("notifications").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("professional_events").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("professional_relationships").delete().in("property_id", propertyIds);
      await supabaseAdmin.from("property_proposals").delete().in("property_id", propertyIds);
      // Tables with property_id as text
      await supabaseAdmin.from("vault_access_requests").delete().in("property_id", propertyIdStrings);
      await supabaseAdmin.from("visit_bookings").delete().in("property_id", propertyIdStrings);
      await supabaseAdmin.from("conversations").delete().in("property_id", propertyIdStrings);
      await supabaseAdmin.from("contact_requests").delete().in("property_id", propertyIds);

      // Finally delete the properties
      await supabaseAdmin.from("properties").delete().eq("user_id", userId);
      console.log(`[delete-account] Deleted ${propertyIds.length} properties and all related data`);
    }

    // Delete professional profile
    await supabaseAdmin.from("professionals").delete().eq("user_id", userId);

    // Delete user profile
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Delete storage files
    const { data: storageFiles } = await supabaseAdmin.storage
      .from("vault-documents")
      .list(userId);
    
    if (storageFiles && storageFiles.length > 0) {
      const filePaths = storageFiles.map(f => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from("vault-documents").remove(filePaths);
    }

    // Sign out from all devices before deleting
    await supabaseAdmin.auth.admin.signOut(userId, "global");

    // Finally delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[delete-account] Error deleting auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Erro ao eliminar conta de autenticação" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[delete-account] Successfully deleted user: ${userId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[delete-account] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
