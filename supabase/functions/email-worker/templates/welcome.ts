export const welcomeTemplate = (data: any) => {
  const isBuyer = data.user_role_preference === 'buyer';
  const isSeller = data.user_role_preference === 'seller';

  let title = "Bem-vindo à ImoPonto!";
  let subtitle = "É um prazer ter-te connosco! A tua conta foi criada com sucesso e agora já podes explorar todas as vantagens da nossa plataforma.";
  let cardTitle = "O que podes fazer agora?";
  let items = [
    "Publicar o teu imóvel gratuitamente",
    "Explorar oportunidades sem comissões",
    "Contactar profissionais especializados",
    "Gerir toda a documentação no teu Cofre"
  ];
  let footerText = "Na ImoPonto, o nosso objetivo é devolver-te o controlo da venda do teu imóvel. Simples, transparente e sem intermediários.";
  let buttonText = "Explorar Plataforma";
  let buttonUrl = "https://imoponto.pt/";

  if (isBuyer) {
    title = "Encontre a sua casa ideal na ImoPonto!";
    subtitle = "Estamos aqui para ajudar a encontrar o seu próximo lar com total transparência e contacto direto com os proprietários.";
    items = [
      "Explorar oportunidades sem comissões",
      "Definir alertas de pesquisa personalizados",
      "Contactar proprietários diretamente",
      "Gerir documentação no teu Cofre Digital"
    ];
    footerText = "Compre com confiança. Na ImoPonto, facilitamos o contacto direto e a transparência em todo o processo.";
    buttonText = "Explorar Imóveis";
    buttonUrl = "https://imoponto.pt/imoveis";
  } else if (isSeller) {
    title = "Venda o seu imóvel com 0% comissões!";
    subtitle = "Parabéns por escolher vender de forma inteligente. Estamos aqui para dar visibilidade ao seu imóvel e apoio profissional.";
    items = [
      "Publicar o teu imóvel gratuitamente",
      "Gerir leads e contactos de interessados",
      "Contratar serviços profissionais (OPCIONAL)",
      "Gerir toda a documentação no teu Cofre"
    ];
    footerText = "Venda sozinho, mas nunca desamparado. A ImoPonto devolve-lhe o controlo e a poupança das comissões.";
    buttonText = "Publicar Primeiro Imóvel";
    buttonUrl = "https://imoponto.pt/publicar";
  }

  return `
    <h2>${title}</h2>
    <p>Olá <strong>${data.userName}</strong>,</p>
    
    <p>${subtitle}</p>
    
    <div class="info-card">
      <p style="margin: 0; font-weight: 600;">${cardTitle}</p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    
    <p>${footerText}</p>
    
    <div class="divider"></div>
    
    <p style="text-align: center;">
      <a href="${buttonUrl}" class="button">${buttonText}</a>
    </p>
    
    <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
      Até já,<br>
      A Equipa ImoPonto
    </p>
  `;
};
