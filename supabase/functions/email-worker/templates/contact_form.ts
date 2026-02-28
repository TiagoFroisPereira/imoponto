export const contactFormTemplate = (data: any) => `
  <h2>Novo Pedido de Contacto</h2>
  <p>Recebeu uma nova mensagem atráves do formulário de contacto.</p>
  
  <div class="info-card">
    <p style="margin: 0;"><strong>Remetente:</strong> ${data.fullName}</p>
    <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${data.email}</p>
    <p style="margin: 5px 0 0 0;"><strong>Assunto:</strong> ${data.subject || "Sem assunto"}</p>
  </div>
  
  <p><strong>Mensagem do Cliente:</strong></p>
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; font-style: italic; color: #475569;">
    ${data.message.replace(/\n/g, '<br>')}
  </div>
  
  <div class="divider"></div>
  <p style="font-size: 14px; text-align: center; color: #64748b;">
    Pode responder diretamente a este email para iniciar a conversa com o cliente.
  </p>
`;
