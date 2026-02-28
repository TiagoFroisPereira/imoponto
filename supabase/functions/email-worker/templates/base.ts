export const baseLayout = (content: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ImoPonto</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    /* Global Styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      width: 100% !important;
      background-color: #f8fafc;
      font-family: 'Outfit', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-spacing: 0;
      font-family: 'Outfit', Arial, sans-serif;
      color: #334155;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding-top: 40px;
      padding-bottom: 40px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      border-radius: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    }
    
    /* Elements */
    .button {
      background: #f16432;
      background: linear-gradient(135deg, #f16432 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(241, 100, 50, 0.25);
    }
    .info-card {
      background-color: #f8fafc;
      border-radius: 16px;
      padding: 24px;
      margin: 20px 0;
    }
    h1, h2, h3 {
      color: #1e293b;
      margin: 0 0 20px 0;
      font-weight: 700;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #475569;
    }
    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
    
    /* Gmail/Mobile fixes */
    @media screen and (max-width: 600px) {
      .main {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content {
        padding: 30px 20px !important;
      }
    }
    .divider {
      border-top: 1px solid #f1f5f9;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center" border="0" cellpadding="0" cellspacing="0">
      <!-- Logo/Header Area -->
      <tr>
        <td style="padding: 40px 0 0 0; text-align: center;">
          <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
            <tr>
              <td style="text-align: center; vertical-align: middle;">
                <img src="https://imoponto.pt/logo.png" width="160" style="display: block; margin: 0 auto; border-radius: 14px; max-width: 200px;" alt="ImoPonto" />
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Blue Accent Divider -->
      <tr>
        <td style="padding-top: 30px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td height="4" style="background: linear-gradient(to right, #1e293b 0%, #3b82f6 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Content area -->
      <tr>
        <td class="content" style="padding: 50px 40px;">
          ${content}
        </td>
      </tr>

      <!-- Footer Area -->
      <tr>
        <td style="padding: 0 40px 40px 40px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-top: 1px solid #f1f5f9; padding-top: 30px;">
            <tr>
              <td align="center" class="footer-text">
                <p style="margin-bottom: 4px; font-weight: 700; color: #64748b;">ImoPonto &copy; ${new Date().getFullYear()}</p>
                <p style="margin-bottom: 20px;">Venda a sua casa sem comissões e com máxima transparência.</p>
                
                <table border="0" cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    <td style="padding: 0 10px;">
                      <a href="https://imoponto.pt" style="color: #f16432; text-decoration: none; font-weight: 600;">Website</a>
                    </td>
                    <td style="color: #e2e8f0;">|</td>
                    <td style="padding: 0 10px;">
                      <a href="https://imoponto.pt/ajuda" style="color: #64748b; text-decoration: none;">Ajuda</a>
                    </td>
                  </tr>
                </table>
                
                <p style="margin-top: 25px; font-size: 11px; color: #cbd5e1;">Este é um email prioritário do sistema ImoPonto. Por favor, não responda a este endereço.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
