export const welcomeTemplate = (data: any) => `
  <h2>Bem-vindo à ImoPonto!</h2>
  <p>Olá <strong>${data.userName}</strong>,</p>
  
  <p>É um prazer ter-te connosco! A tua conta foi criada com sucesso e agora já podes explorar todas as vantagens da nossa plataforma.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 600;">O que podes fazer agora?</p>
    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
      <li>Publicar o teu imóvel gratuitamente</li>
      <li>Explorar oportunidades sem comissões</li>
      <li>Contactar profissionais especializados</li>
      <li>Gerir toda a documentação no teu Vault</li>
    </ul>
  </div>
  
  <p>Na ImoPonto, o nosso objetivo é devolver-te o controlo da venda do teu imóvel. Simples, transparente e sem intermediários.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center;">
    <a href="https://imoponto.pt/publicar" class="button">Publicar Primeiro Imóvel</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Até já,<br>
    A Equipa ImoPonto
  </p>
`;
