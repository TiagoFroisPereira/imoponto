export const propertyPublishedTemplate = (data: any) => `
  <h2>O seu imóvel está online!</h2>
  <p>Olá <strong>${data.userName}</strong>,</p>
  
  <p>Boas notícias! O seu anúncio para <strong>${data.propertyTitle}</strong> já está publicado e visível para milhares de potenciais compradores.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 600;">Resumo do Anúncio:</p>
    <p style="margin: 5px 0 0 0;"><strong>Preço:</strong> ${data.price}</p>
    <p style="margin: 2px 0 0 0;"><strong>Localização:</strong> ${data.location}</p>
  </div>
  
  <p>A partir de agora, poderá começar a receber mensagens e pedidos de visita. Lembre-se de manter os seus contactos atualizados no painel de controlo.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/imovel/${data.propertyId}" class="button">Ver Anúncio Público</a>
    <br><br>
    <a href="https://imoponto.pt/dashboard/meus-imoveis" style="color: #64748b; text-decoration: none; font-size: 14px;">Gerir no Dashboard</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Boa venda!<br>
    A Equipa ImoPonto
  </p>
`;
