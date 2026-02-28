import { Shield, Users, Database, Lock, FileText, Scale, Clock, Share2, Globe, UserCheck, Mail, AlertTriangle, Building } from "lucide-react";

const RGPD = () => {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              RGPD — Informação sobre o Tratamento de Dados
            </h1>
            <p className="text-xl text-primary font-semibold mb-4">ImoPonto</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Última atualização: 2026</span>
              <span className="hidden sm:inline">•</span>
              <span>Base legal: Regulamento (UE) 2016/679 (RGPD)</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Section 1 - Enquadramento */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">1. Enquadramento</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  O presente documento tem por objetivo informar, de forma clara e transparente, sobre o tratamento 
                  de dados pessoais realizado pela plataforma <strong>ImoPonto</strong>, nos termos dos artigos 12.º, 
                  13.º e 14.º do Regulamento (UE) 2016/679.
                </p>
                <p>
                  Este documento constitui um <strong>aviso RGPD autónomo</strong>, complementando a Política de 
                  Privacidade e os Termos e Condições já existentes, sem os substituir.
                </p>
              </div>
            </section>

            {/* Section 2 - Responsável pelo Tratamento */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">2. Responsável pelo Tratamento</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  A ImoPonto é uma plataforma digital de intermediação e serviços no setor imobiliário, atuando 
                  como responsável pelo tratamento dos dados pessoais recolhidos diretamente no âmbito do 
                  funcionamento da plataforma.
                </p>
                <p>
                  Em determinados fluxos, a ImoPonto atua exclusivamente como <strong>intermediária técnica</strong>, 
                  não determinando as finalidades nem os meios do tratamento efetuado por terceiros.
                </p>
              </div>
            </section>

            {/* Section 3 - Titulares dos Dados */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">3. Titulares dos Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Este documento aplica-se aos seguintes titulares de dados:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilizadores particulares</li>
                  <li>Profissionais registados</li>
                  <li>Vendedores</li>
                  <li>Visitantes do website ou aplicação</li>
                  <li>Pessoas que submetem pedidos ou formulários de contacto</li>
                </ul>
              </div>
            </section>

            {/* Section 4 - Categorias de Dados */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">4. Categorias de Dados Pessoais Tratados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>A ImoPonto trata apenas dados pessoais adequados, pertinentes e limitados ao necessário, nomeadamente:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dados de identificação (nome, email, telefone)</li>
                  <li>Dados de conta e perfil</li>
                  <li>Dados profissionais tornados públicos por iniciativa do titular</li>
                  <li>Dados de contacto e pedidos de serviço</li>
                  <li>Dados contratuais, de faturação e pagamento</li>
                  <li>Dados técnicos de acesso, segurança e logs</li>
                  <li>Documentos armazenados no cofre digital, quando autorizado</li>
                </ul>
                <p className="mt-4 text-sm bg-muted/50 p-4 rounded-lg">
                  Os dados profissionais tornados públicos na plataforma são disponibilizados por iniciativa 
                  exclusiva do próprio profissional, que declara possuir legitimidade legal para a sua divulgação, 
                  assumindo inteira responsabilidade pela licitude dos mesmos.
                </p>
              </div>
            </section>

            {/* Section 5 - Finalidades do Tratamento */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">5. Finalidades do Tratamento</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criação e gestão de contas</li>
                  <li>Publicação e gestão de anúncios</li>
                  <li>Contacto entre utilizadores, vendedores e profissionais</li>
                  <li>Prestação e intermediação de serviços</li>
                  <li>Gestão de pagamentos e faturação</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Segurança, prevenção de fraude e abuso</li>
                  <li>Funcionamento técnico da plataforma</li>
                  <li>Disponibilização do cofre digital, quando solicitado</li>
                </ul>
              </div>
            </section>

            {/* Section 5.1 - Cofre Digital */}
            <section className="space-y-4 ml-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">5.1. Cofre Digital</h3>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  O cofre digital da ImoPonto constitui uma funcionalidade técnica destinada exclusivamente ao 
                  armazenamento seguro e à partilha controlada de documentos entre utilizadores, vendedores e 
                  profissionais, mediante autorização expressa do titular dos dados.
                </p>
                <p>
                  No âmbito desta funcionalidade, a ImoPonto atua exclusivamente como <strong>prestadora técnica 
                  da infraestrutura</strong>, não acedendo, analisando ou tratando o conteúdo dos documentos 
                  armazenados, salvo quando tal seja estritamente necessário para efeitos de manutenção técnica, 
                  segurança do sistema ou cumprimento de obrigação legal.
                </p>
                <p>
                  O controlo, a decisão sobre o conteúdo dos documentos, bem como a legitimidade do respetivo 
                  tratamento, pertencem exclusivamente ao titular que os carrega ou autoriza a partilha, não 
                  assumindo a ImoPonto qualquer responsabilidade pelo conteúdo armazenado.
                </p>
              </div>
            </section>

            {/* Section 6 - Fundamentos Legais */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">6. Fundamentos Legais do Tratamento</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>O tratamento de dados pessoais pela ImoPonto assenta nos seguintes fundamentos legais:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Execução de contrato ou diligências pré-contratuais</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Interesse legítimo da plataforma (segurança, funcionamento e prevenção de abuso)</li>
                  <li>Consentimento explícito do titular, quando aplicável</li>
                </ul>
              </div>
            </section>

            {/* Section 7 - Conservação dos Dados */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">7. Conservação dos Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Os dados pessoais são conservados apenas pelo período necessário às finalidades que motivaram a sua recolha:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contas ativas:</strong> durante a relação com o utilizador</li>
                  <li><strong>Dados contratuais e fiscais:</strong> até 10 anos</li>
                  <li><strong>Logs de segurança e acesso:</strong> até 12 meses</li>
                  <li><strong>Dados tratados com base em consentimento:</strong> até retirada do consentimento</li>
                </ul>
              </div>
            </section>

            {/* Section 8 - Partilha de Dados */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">8. Partilha de Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Os dados pessoais podem ser partilhados apenas:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Com profissionais ou vendedores expressamente autorizados pelo utilizador</li>
                  <li>Com prestadores de serviços tecnológicos essenciais ao funcionamento da plataforma</li>
                  <li>Com autoridades públicas, quando legalmente exigido</li>
                </ul>
                <p className="mt-4">
                  No contexto do cofre digital, a partilha de documentos ocorre exclusivamente entre as partes 
                  autorizadas pelo titular dos dados.
                </p>
                <p className="font-medium text-foreground">
                  A ImoPonto não vende nem cede dados pessoais a terceiros para fins comerciais.
                </p>
              </div>
            </section>

            {/* Section 9 - Transferências Internacionais */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">9. Transferências Internacionais de Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  Sempre que ocorram transferências de dados para fora da União Europeia, estas serão efetuadas 
                  apenas quando exista decisão de adequação da Comissão Europeia ou mediante a aplicação de 
                  garantias adequadas, nos termos do RGPD.
                </p>
              </div>
            </section>

            {/* Section 10 - Direitos dos Titulares */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">10. Direitos dos Titulares dos Dados</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>Nos termos do RGPD, o titular dos dados pode exercer os seguintes direitos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Direito de acesso</li>
                  <li>Direito de retificação</li>
                  <li>Direito ao apagamento</li>
                  <li>Direito à limitação do tratamento</li>
                  <li>Direito de portabilidade</li>
                  <li>Direito de oposição</li>
                  <li>Direito de retirar o consentimento</li>
                </ul>
              </div>
            </section>

            {/* Section 11 - Exercício de Direitos */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">11. Exercício de Direitos</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>O exercício dos direitos pode ser efetuado mediante pedido escrito, devidamente identificado.</p>
                <p>A ImoPonto responderá aos pedidos no prazo máximo de <strong>30 dias</strong>, nos termos legais.</p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4 space-y-2">
                  <p><strong>Contacto para exercício de direitos:</strong></p>
                  <p>Email: <a href="mailto:privacidade@imoponto.pt" className="text-primary hover:underline">privacidade@imoponto.pt</a></p>
                </div>
              </div>
            </section>

            {/* Section 12 - Medidas de Segurança */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">12. Medidas de Segurança</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>A ImoPonto implementa medidas técnicas e organizativas adequadas para proteger os dados pessoais, incluindo:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Controlo de acessos</li>
                  <li>Registo e monitorização de atividades</li>
                  <li>Encriptação e segregação lógica de dados</li>
                  <li>Limitação de permissões</li>
                  <li>Proteção específica do cofre digital</li>
                </ul>
                <p className="mt-4">
                  Estas medidas visam assegurar um nível de segurança adequado ao risco, nos termos do artigo 32.º do RGPD.
                </p>
              </div>
            </section>

            {/* Section 13 - Autoridade de Controlo */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">13. Autoridade de Controlo</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>O titular dos dados tem o direito de apresentar reclamação junto da autoridade de controlo competente:</p>
                <div className="bg-muted/50 rounded-xl p-6 mt-4 space-y-2">
                  <p><strong>CNPD — Comissão Nacional de Proteção de Dados</strong></p>
                  <p>
                    <a 
                      href="https://www.cnpd.pt" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      https://www.cnpd.pt
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14 - Disposições Finais */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">14. Disposições Finais</h2>
              </div>
              <div className="pl-13 space-y-3 text-muted-foreground">
                <p>
                  A ImoPonto reserva-se o direito de atualizar o presente documento sempre que necessário para 
                  garantir conformidade legal e operacional, sendo as alterações devidamente publicadas na plataforma.
                </p>
              </div>
            </section>

            {/* Update notice */}
            <section className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Este documento complementa a <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a> e 
                os <a href="/termos-servico" className="text-primary hover:underline">Termos e Condições</a> da plataforma ImoPonto.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RGPD;
