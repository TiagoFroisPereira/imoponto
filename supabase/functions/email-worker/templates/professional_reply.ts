export const professionalReplyTemplate = (data: any) => `
  <h2>Um Profissional respondeu ao seu pedido!</h2>
  <p>Olá <strong>${data.userName}</strong>,</p>
  
  <p>O profissional <strong>${data.professionalName}</strong> enviou uma resposta ao seu pedido de contacto relacionado com o imóvel <strong>${data.propertyTitle}</strong>.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 600;">Mensagem do Profissional:</p>
    <p style="margin: 10px 0 0 0; font-style: italic;">"${data.messagePreview}..."</p>
  </div>
  
  <p>Pode agora visualizar a resposta completa e continuar a conversação no seu painel privado.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/mensagens" class="button">Ver Detalhes do Serviço</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Até já,<br>
    A Equipa ImoPonto
  </p>
`;
