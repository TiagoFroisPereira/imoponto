export const visitRequestTemplate = (data: any) => `
  <h2>Novo Pedido de Visita!</h2>
  <p>Olá <strong>${data.sellerName}</strong>,</p>
  
  <p>Recebeu um novo pedido de agendamento para o seu imóvel: <strong>${data.propertyTitle}</strong>.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 600;">Detalhes do Pedido:</p>
    <p style="margin: 5px 0 0 0;"><strong>Comprador:</strong> ${data.visitorName}</p>
    <p style="margin: 2px 0 0 0;"><strong>Data Sugerida:</strong> ${data.date}</p>
    <p style="margin: 2px 0 0 0;"><strong>Hora Sugerida:</strong> ${data.time}</p>
  </div>
  
  <p>Por favor, aceda ao seu painel de mensagens para confirmar ou sugerir um novo horário.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/agenda" class="button">Responder ao Pedido</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Até já,<br>
    A Equipa ImoPonto
  </p>
`;
