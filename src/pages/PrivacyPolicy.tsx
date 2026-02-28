import { Shield, Eye, Lock, Database, UserCheck, Mail, Clock, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 7 de Fevereiro de 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Introduction */}
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A ImoPonto está comprometida com a proteção da sua privacidade e dos seus dados pessoais. 
                Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos 
                as suas informações quando utiliza a nossa plataforma.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">1. Dados que Recolhemos</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Recolhemos os seguintes tipos de dados pessoais:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dados de identificação:</strong> nome completo, email, número de telefone</li>
                  <li><strong>Dados de conta:</strong> credenciais de acesso e preferências de utilizador</li>
                  <li><strong>Dados de propriedade:</strong> informações sobre imóveis que publica ou pesquisa</li>
                  <li><strong>Dados de comunicação:</strong> mensagens trocadas através da plataforma</li>
                  <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo utilizado</li>
                  <li><strong>Dados de navegação:</strong> páginas visitadas, tempo de permanência, interações</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">2. Como Utilizamos os Seus Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Os seus dados são utilizados para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criar e gerir a sua conta na plataforma</li>
                  <li>Facilitar a publicação e pesquisa de imóveis</li>
                  <li>Permitir a comunicação entre compradores e vendedores</li>
                  <li>Enviar notificações relevantes sobre a sua atividade</li>
                  <li>Melhorar os nossos serviços e experiência de utilizador</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                  <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">3. Proteção dos Seus Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Implementamos medidas de segurança rigorosas para proteger os seus dados:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encriptação SSL/TLS em todas as comunicações</li>
                  <li>Encriptação de dados sensíveis armazenados nos nossos servidores</li>
                  <li>Controlos de acesso restritos e autenticação segura</li>
                  <li>Monitorização contínua de ameaças e vulnerabilidades</li>
                  <li>Backups regulares e planos de recuperação de desastres</li>
                  <li>Formação regular da equipa em práticas de segurança</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">4. Os Seus Direitos (RGPD)</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Ao abrigo do Regulamento Geral de Proteção de Dados (RGPD), tem os seguintes direitos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Direito de acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
                  <li><strong>Direito de retificação:</strong> corrigir dados incorretos ou incompletos</li>
                  <li><strong>Direito ao apagamento:</strong> solicitar a eliminação dos seus dados</li>
                  <li><strong>Direito à portabilidade:</strong> receber os seus dados num formato estruturado</li>
                  <li><strong>Direito de oposição:</strong> opor-se ao tratamento dos seus dados</li>
                  <li><strong>Direito à limitação:</strong> restringir o tratamento em certas circunstâncias</li>
                </ul>
                <p className="mt-4">
                  Para exercer qualquer destes direitos, contacte-nos através do email 
                  <a href="mailto:privacidade@imoponto.pt" className="text-primary hover:underline ml-1">
                    privacidade@imoponto.pt
                  </a>
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">5. Retenção de Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Mantemos os seus dados pessoais apenas durante o tempo necessário para cumprir 
                  as finalidades para as quais foram recolhidos, incluindo obrigações legais, 
                  contabilísticas ou de reporte.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
                  <li>Dados de transações: mantidos durante 10 anos (obrigação fiscal)</li>
                  <li>Dados de comunicação: mantidos durante 2 anos após a última interação</li>
                  <li>Dados de navegação: mantidos durante 12 meses</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Utilizamos cookies e tecnologias similares para melhorar a sua experiência 
                  na plataforma. Para mais informações, consulte a nossa 
                  <a href="/cookies" className="text-primary hover:underline ml-1">
                    Política de Cookies
                  </a>.
                </p>
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
                <p>Para questões relacionadas com a sua privacidade, pode contactar-nos através de:</p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4 space-y-2">
                  <p><strong>ImoPonto, Lda.</strong></p>
                  <p>Email: <a href="mailto:privacidade@imoponto.pt" className="text-primary hover:underline">privacidade@imoponto.pt</a></p>
                  <p>Telefone: +351 210 000 000</p>
                  <p>Morada: Lisboa, Portugal</p>
                </div>
                <p className="mt-4 text-sm">
                  Se considerar que os seus direitos não foram respeitados, pode apresentar uma reclamação 
                  junto da Comissão Nacional de Proteção de Dados (CNPD).
                </p>
              </div>
            </section>

            {/* Update notice */}
            <section className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Esta política pode ser atualizada periodicamente. Recomendamos que a consulte regularmente 
                para se manter informado sobre como protegemos os seus dados.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
