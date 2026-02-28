export const contactConfirmationTemplate = (data: any) => `
  <h2>Olá ${data.fullName}!</h2>
  <p>Confirmamos a receção da sua mensagem na <strong>ImoPonto</strong>.</p>
  
  <p>É um prazer saber do seu interesse. Recebemos o seu pedido relativo a: <strong>"${data.subject}"</strong>.</p>
  
  <div class="info-card">
    <p style="margin: 0; font-weight: 500;">
      A nossa equipa já está a analisar os seus detalhes e entraremos em contacto consigo o mais brevemente possível.
    </p>
  </div>
  
  <p>Entrar em contacto é o primeiro passo para o sucesso do seu negócio imobiliário. Estamos aqui para ajudar em cada etapa.</p>
  
  <p>Se tiver alguma questão urgente, pode visitar o nosso website ou responder a este email.</p>
  
  <div class="divider"></div>
  <p style="text-align: center;">
    <a href="https://imoponto.pt" class="button accent-button">Visitar Website</a>
  </p>
  
  <p style="margin-top: 30px; font-weight: 600; color: #1e293b;">
    Melhores cumprimentos,<br>
    A Equipa ImoPonto
  </p>
`;
