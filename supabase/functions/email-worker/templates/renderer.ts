import { baseLayout } from "./base.ts";
import { contactFormTemplate } from "./contact_form.ts";
import { contactConfirmationTemplate } from "./contact_confirmation.ts";
import { visitScheduledTemplate } from "./visit_scheduled.ts";
import { welcomeTemplate } from "./welcome.ts";
import { propertyPublishedTemplate } from "./property_published.ts";
import { paymentReceiptTemplate } from "./payment_receipt.ts";
import { visitRequestTemplate } from "./visit_request.ts";
import { professionalReplyTemplate } from "./professional_reply.ts";

export interface RenderResult {
    subject: string;
    html: string;
}

export function renderEmail(templateKey: string, data: any): RenderResult {
    let subject = "";
    let content = "";

    switch (templateKey) {
        case "contact_form":
            subject = `Novo Contacto: ${data.subject || "Sem assunto"} - ImoPonto`;
            content = contactFormTemplate(data);
            break;

        case "contact_confirmation":
            subject = "Recebemos a sua mensagem - ImoPonto";
            content = contactConfirmationTemplate(data);
            break;

        case "visit_scheduled":
            subject = "Confirmação de Agendamento de Visita - ImoPonto";
            content = visitScheduledTemplate(data);
            break;

        case "welcome":
            subject = `Bem-vindo à ImoPonto, ${data.userName}!`;
            content = welcomeTemplate(data);
            break;

        case "property_published":
            subject = "O seu imóvel já está live! - ImoPonto";
            content = propertyPublishedTemplate(data);
            break;

        case "payment_receipt":
            subject = "Confirmação de Pagamento - ImoPonto";
            content = paymentReceiptTemplate(data);
            break;

        case "visit_request":
            subject = "Novo Pedido de Visita Agendado - ImoPonto";
            content = visitRequestTemplate(data);
            break;

        case "professional_reply":
            subject = "Resposta de Profissional Recebida - ImoPonto";
            content = professionalReplyTemplate(data);
            break;

        default:
            throw new Error(`Template não encontrado: ${templateKey}`);
    }

    return {
        subject,
        html: baseLayout(content),
    };
}
