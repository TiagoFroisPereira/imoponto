import { Cookie, Shield, Settings, BarChart3, Users, Clock, ToggleLeft, Mail } from "lucide-react";

const Cookies = () => {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Política de Cookies
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 8 de Fevereiro de 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Introduction */}
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A ImoPonto utiliza cookies e tecnologias similares para melhorar a sua experiência 
                de navegação, analisar o tráfego do website e personalizar conteúdos. Esta Política 
                de Cookies explica o que são cookies, como os utilizamos e como pode geri-los.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">1. O Que São Cookies</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo 
                  (computador, tablet ou telemóvel) quando visita um website. Estes ficheiros 
                  permitem que o website reconheça o seu dispositivo e memorize informações sobre 
                  a sua visita, como as suas preferências de idioma e outras configurações.
                </p>
                <p>
                  Os cookies podem ser "persistentes" (permanecem no seu dispositivo até serem 
                  eliminados ou expirarem) ou "de sessão" (são eliminados quando fecha o navegador).
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">2. Tipos de Cookies que Utilizamos</h2>
              </div>
              <div className="pl-13 space-y-4 text-muted-foreground">
                <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cookies Estritamente Necessários</h3>
                    <p className="text-sm">
                      Essenciais para o funcionamento do website. Incluem cookies de autenticação, 
                      segurança e preferências técnicas. Não podem ser desativados.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cookies de Desempenho</h3>
                    <p className="text-sm">
                      Recolhem informações anónimas sobre como os visitantes utilizam o website, 
                      como páginas mais visitadas e erros encontrados. Ajudam-nos a melhorar o funcionamento.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cookies de Funcionalidade</h3>
                    <p className="text-sm">
                      Permitem que o website memorize escolhas que fez (como o seu nome de utilizador, 
                      idioma ou região) e forneça funcionalidades melhoradas e mais personalizadas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cookies de Marketing</h3>
                    <p className="text-sm">
                      Utilizados para apresentar anúncios mais relevantes para si e os seus interesses. 
                      Também são utilizados para limitar o número de vezes que vê um anúncio.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">3. Finalidades de Utilização</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Utilizamos cookies para as seguintes finalidades:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Garantir o funcionamento técnico e seguro da plataforma</li>
                  <li>Manter a sua sessão ativa enquanto navega</li>
                  <li>Memorizar as suas preferências e configurações</li>
                  <li>Analisar o tráfego e comportamento dos utilizadores</li>
                  <li>Melhorar a experiência de navegação</li>
                  <li>Personalizar conteúdos e recomendações</li>
                  <li>Prevenir fraudes e abusos</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">4. Cookies de Terceiros</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas 
                  páginas. Não controlamos a colocação destes cookies. Os terceiros incluem:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Serviços de análise:</strong> para compreender como utiliza o website</li>
                  <li><strong>Mapas:</strong> para apresentar localizações de imóveis</li>
                  <li><strong>Processadores de pagamento:</strong> para transações seguras</li>
                  <li><strong>Redes sociais:</strong> para funcionalidades de partilha</li>
                </ul>
                <p className="mt-4">
                  Recomendamos que consulte as políticas de privacidade destes terceiros para 
                  compreender como utilizam os seus dados.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">5. Duração dos Cookies</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>A duração dos cookies varia consoante o seu tipo:</p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Tipo</th>
                        <th className="text-left py-2 font-semibold text-foreground">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Cookies de sessão</td>
                        <td className="py-2">Até fechar o navegador</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Cookies de autenticação</td>
                        <td className="py-2">30 dias</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Cookies de preferências</td>
                        <td className="py-2">12 meses</td>
                      </tr>
                      <tr>
                        <td className="py-2">Cookies de análise</td>
                        <td className="py-2">24 meses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ToggleLeft className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">6. Como Gerir os Cookies</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Pode controlar e/ou eliminar cookies conforme desejar. A maioria dos navegadores 
                  permite gerir as preferências de cookies. Pode:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ver os cookies armazenados e eliminá-los individualmente</li>
                  <li>Bloquear cookies de terceiros</li>
                  <li>Bloquear cookies de sites específicos</li>
                  <li>Bloquear todos os cookies</li>
                  <li>Eliminar todos os cookies ao fechar o navegador</li>
                </ul>
                <p className="mt-4">
                  <strong>Nota:</strong> Se optar por bloquear cookies, algumas funcionalidades do 
                  website podem não funcionar corretamente, incluindo o acesso à sua conta.
                </p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4 space-y-2">
                  <p className="font-semibold text-foreground">Links para gestão de cookies nos navegadores:</p>
                  <ul className="text-sm space-y-1">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-websites-armazenam-computador" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/pt-pt/windows/eliminar-e-gerir-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">7. Contactos</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Para questões relacionadas com cookies, pode contactar-nos através de:</p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4 space-y-2">
                  <p><strong>ImoPonto, Lda.</strong></p>
                  <p>Email: <a href="mailto:privacidade@imoponto.pt" className="text-primary hover:underline">privacidade@imoponto.pt</a></p>
                  <p>Telefone: +351 210 000 000</p>
                  <p>Morada: Lisboa, Portugal</p>
                </div>
              </div>
            </section>

            {/* Update notice */}
            <section className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Esta política pode ser atualizada periodicamente. Recomendamos que a consulte regularmente 
                para se manter informado sobre como utilizamos cookies.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cookies;
