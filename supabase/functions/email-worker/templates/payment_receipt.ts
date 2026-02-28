export const paymentReceiptTemplate = (data: any) => `
  <h2>Confirmação de Pagamento</h2>
  <p>Olá <strong>${data.userName}</strong>,</p>
  
  <p>Confirmamos a receção do seu pagamento referente ao serviço <strong>${data.serviceName}</strong> na ImoPonto.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 600;">Detalhes da Transação:</p>
    <p style="margin: 5px 0 0 0;"><strong>Valor:</strong> ${data.amount}</p>
    <p style="margin: 2px 0 0 0;"><strong>Data:</strong> ${data.date}</p>
    <p style="margin: 2px 0 0 0;"><strong>ID da Transação:</strong> ${data.transactionId}</p>
  </div>
  
  <p>Poderá consultar e descarregar a sua fatura a qualquer momento na sua área de cliente em "Pagamentos".</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/dashboard/pagamentos" class="button">Ver Meus Pagamentos</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Obrigado pela confiança,<br>
    A Equipa ImoPonto
  </p>
`;
