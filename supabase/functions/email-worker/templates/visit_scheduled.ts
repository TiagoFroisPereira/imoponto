export const visitScheduledTemplate = (data: any) => `
  <h2>Visita Confirmada!</h2>
  <p>Olá <strong>${data.userName}</strong>,</p>
  
  <p>Temos o prazer de confirmar o agendamento da sua visita ao imóvel <strong>${data.propertyTitle}</strong>.</p>
  
  <div class="info-card">
    <p style="margin: 0;"><strong>Data:</strong> ${data.date}</p>
    <p style="margin: 5px 0 0 0;"><strong>Hora:</strong> ${data.time}</p>
  </div>
  
  <p>O proprietário já foi notificado e aguarda o seu contacto. Caso necessite de alterar ou cancelar este agendamento, por favor aceda à sua área pessoal.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/dashboard" class="button">Gerir Agendamento</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Até breve,<br>
    A Equipa ImoPonto
  </p>
`;
