import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nodemailer from "npm:nodemailer@6.9.7";
import { renderEmail } from "./templates/renderer.ts";

// Nodemailer in Supabase/Deno environment sometimes needs some polyfills
// but using npm: prefix often handles this better through Deno's Node compat layer.

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface EmailQueueRecord {
    id: string;
    recipient_email: string;
    template_key: string;
    template_data: any;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recordId: string | null = null;

    try {
        const payload = await req.json();
        console.log("Received payload:", JSON.stringify(payload));

        const record: EmailQueueRecord = payload.record;

        if (!record || !record.recipient_email) {
            throw new Error("Invalid record payload: missing record or recipient_email");
        }

        recordId = record.id;
        const { recipient_email, template_key, template_data } = record;

        // SMTP Config
        const host = Deno.env.get("SMTP_HOST");
        const port = parseInt(Deno.env.get("SMTP_PORT") || "587");
        const user = Deno.env.get("SMTP_USERNAME");
        const pass = Deno.env.get("SMTP_PASSWORD");
        const fromName = Deno.env.get("SMTP_FROM_NAME") || "Casa Direta";
        const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");

        if (!host || !user || !pass || !fromEmail) {
            throw new Error("SMTP configuration is incomplete");
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });

        console.log(`Rendering email for template: ${template_key}...`);
        const { subject, html } = renderEmail(template_key, template_data);

        console.log(`Sending email to ${recipient_email}...`);
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient_email,
            subject: subject,
            html: html,
        });

        console.log("Email sent successfully!");

        if (recordId) {
            await supabase
                .from("email_queue")
                .update({ status: "sent", sent_at: new Date().toISOString() })
                .eq("id", recordId);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Error in email-worker function:", error.message);

        if (recordId) {
            await supabase
                .from("email_queue")
                .update({ status: "error", error_message: error.message })
                .eq("id", recordId);
        }

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
