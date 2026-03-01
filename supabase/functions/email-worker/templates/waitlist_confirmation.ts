export function waitlistConfirmationTemplate(data: any): string {
  return `
    <h2 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">
      Está na lista de espera! 🎉
    </h2>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Olá,
    </p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      A sua inscrição na lista de espera da <strong>ImoPonto</strong> foi registada com sucesso.
      Será dos primeiros a saber quando a plataforma estiver disponível.
    </p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Obrigado pelo seu interesse!
    </p>
    <p style="color: #999; font-size: 14px; margin-top: 32px;">
      — Equipa ImoPonto
    </p>
  `;
}
