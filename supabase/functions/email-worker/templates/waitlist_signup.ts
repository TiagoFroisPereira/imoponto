export function waitlistSignupTemplate(data: any): string {
  const interestLabels: Record<string, string> = {
    comprador: "Comprador",
    vendedor: "Vendedor",
    prestador: "Prestador de Serviços",
  };

  const interests = (data.interests || [])
    .map((i: string) => interestLabels[i] || i)
    .join(", ");

  return `
    <h2 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">
      Nova inscrição na Lista de Espera
    </h2>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Um novo utilizador inscreveu-se na lista de espera da ImoPonto.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Email</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #555;">${data.email || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Interesses</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #555;">${interests || "Nenhum selecionado"}</td>
      </tr>
    </table>
  `;
}
