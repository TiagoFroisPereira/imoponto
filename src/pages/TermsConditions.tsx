import {
  FileText, 
  Building2, 
  ShieldX, 
  CreditCard, 
  Megaphone, 
  Lock, 
  BarChart3, 
  AlertTriangle, 
  Scale,
  UserCheck,
  Briefcase,
  FolderLock,
  CheckCircle2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const TermsConditions = () => {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Termos e Condições
            </h1>
            <p className="text-muted-foreground mb-2">
              Dossier Legal e Operacional — ImoPonto
            </p>
            <p className="text-sm text-muted-foreground">
              Versão 1.1 • Última atualização: 7 de Fevereiro de 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            
            {/* PARTE I */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE I — Termos e Condições da Plataforma ImoPonto
                </h2>
              </div>

              {/* 1. Identificação */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">1. Identificação da Plataforma</h3>
                </div>
                <div className="pl-13 text-muted-foreground space-y-3">
                  <p>
                    A ImoPonto é uma plataforma digital que funciona como marketplace de serviços essenciais 
                    relacionados com imóveis, disponibilizando exclusivamente infraestrutura tecnológica.
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-700 dark:text-amber-400 font-medium">
                      A ImoPonto não é uma empresa de mediação imobiliária, não se encontra sujeita ao 
                      Decreto-Lei n.º 15/2013, nem exerce qualquer atividade de intermediação, representação 
                      ou acompanhamento de negócios imobiliários.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Objeto */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">2. Objeto</h3>
                </div>
                <div className="pl-13 text-muted-foreground space-y-3">
                  <p>A plataforma permite:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Criação de anúncios por utilizadores</li>
                    <li>Organização documental através de Cofre Digital</li>
                    <li>Acesso a profissionais independentes</li>
                    <li>Consulta de informação estatística agregada</li>
                  </ul>
                  <p className="font-medium text-foreground">A ImoPonto não presta serviços profissionais.</p>
                </div>
              </div>

              {/* 3. Atividades Excluídas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldX className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">3. Atividades Expressamente Excluídas</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">A ImoPonto <strong>não</strong>:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Angaria imóveis ou clientes",
                      "Negocia preços ou condições",
                      "Representa compradores ou vendedores",
                      "Recebe comissões",
                      "Aconselha juridicamente ou financeiramente",
                      "Acompanha processos de compra e venda"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <ShieldX className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Subscrições */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">4. Subscrições</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">O modelo económico baseia-se em:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Subscrições mensais ou anuais</li>
                    <li>Valores fixos</li>
                    <li>Sem remuneração variável</li>
                    <li>Sem dependência da conclusão de negócios</li>
                  </ul>
                </div>
              </div>

              {/* 5. Anúncios */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">5. Anúncios</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">Os anúncios:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>São criados pelos utilizadores</li>
                    <li>São da sua exclusiva responsabilidade</li>
                    <li>Têm caráter informativo</li>
                    <li>Não constituem proposta contratual</li>
                  </ul>
                  <div className="bg-muted/50 border border-border rounded-xl p-4 mt-4">
                    <p className="text-sm">
                      A ordenação, destaque ou prioridade de perfis e anúncios na plataforma resulta 
                      exclusivamente de critérios técnicos e comerciais, nomeadamente do tipo de plano 
                      subscrito, não constituindo qualquer forma de recomendação, validação, aconselhamento 
                      ou garantia por parte da ImoPonto.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Cofre Digital */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">6. Cofre Digital</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">Ferramenta de armazenamento e organização documental.</p>
                  <p>A ImoPonto:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Não valida documentos</li>
                    <li>Não garante conformidade legal</li>
                    <li>Não analisa conteúdos</li>
                  </ul>
                </div>
              </div>

              {/* 7. Informação Estatística */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">7. Informação Estatística (€/m²)</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">Os alertas de valores médios:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>São informativos</li>
                    <li>Baseiam-se em dados agregados</li>
                    <li>Não constituem avaliação imobiliária</li>
                  </ul>
                </div>
              </div>

              {/* 8. Limitação de Responsabilidade */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">8. Limitação de Responsabilidade</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">A ImoPonto não se responsabiliza por:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Conteúdos publicados</li>
                    <li>Serviços prestados por terceiros</li>
                    <li>Decisões dos utilizadores</li>
                    <li>Resultados de negócios</li>
                  </ul>
                </div>
              </div>

              {/* 9. Lei Aplicável */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">9. Lei Aplicável</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p>Lei portuguesa.</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* PARTE II */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE II — Fluxo de Aceitação Legal na Plataforma
                </h2>
              </div>

              <div className="grid gap-6">
                {/* Registo */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">1. Registo de Utilizador</h3>
                  <p className="text-muted-foreground">Aceitação obrigatória:</p>
                  <div className="space-y-2">
                    {["Termos da Plataforma", "Política de Privacidade", "Política de Isenção de Mediação"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Criação de Anúncio */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">2. Criação de Anúncio</h3>
                  <p className="text-muted-foreground">Declarações obrigatórias:</p>
                  <div className="space-y-2">
                    {[
                      "Responsabilidade pelo conteúdo",
                      "Reconhecimento de ausência de aconselhamento",
                      "Aceitação do caráter informativo"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cofre Digital */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">3. Cofre Digital</h3>
                  <p className="text-muted-foreground">Declarações obrigatórias:</p>
                  <div className="space-y-2">
                    {[
                      "Documentos carregados por iniciativa própria",
                      "Validação apenas por profissionais independentes"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pedido de Serviço */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">4. Pedido de Serviço Profissional</h3>
                  <p className="text-muted-foreground">Aceitação cumulativa:</p>
                  <div className="space-y-2">
                    {["Termos da Plataforma", "Termos do Profissional"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 mt-4">
                    <p className="text-sm text-primary font-medium">
                      "A ImoPonto não é parte do contrato de prestação de serviços."
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* PARTE III */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE III — Política de Isenção de Mediação Imobiliária
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">1. Enquadramento Legal</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p>
                    Nos termos do Decreto-Lei n.º 15/2013, a atividade da ImoPonto não se enquadra 
                    na definição legal de mediação imobiliária.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldX className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">2. Exclusões Claras</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="mb-3">A ImoPonto não:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Promove negócios</li>
                    <li>Negocia valores</li>
                    <li>Acompanha processos</li>
                    <li>Representa partes</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">3. Modelo Económico</h3>
                </div>
                <div className="pl-13 text-muted-foreground">
                  <p className="font-medium">Subscrições fixas, sem comissão.</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* PARTE IV */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE IV — Modelo-Base de Termos de Prestação de Serviços do Profissional
                </h2>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-amber-700 dark:text-amber-400 font-medium text-center">
                  A ImoPonto não é parte do contrato.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">1. Identificação do Profissional</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Nome</li>
                      <li>NIF</li>
                      <li>Cédula / Registo</li>
                      <li>Entidade reguladora</li>
                      <li>Contacto</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">2. Objeto</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground">
                    <p>Prestação de serviços solicitados diretamente pelo Utilizador ao Profissional.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">3. Natureza da Relação</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground space-y-3">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Profissional independente</li>
                      <li>Sem vínculo à ImoPonto</li>
                      <li>Responsabilidade exclusiva do Profissional</li>
                    </ul>
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <p className="text-sm italic">
                        "Declaro que organizo a minha atividade profissional de forma autónoma, 
                        definindo honorários, prazos e condições sem qualquer intervenção da ImoPonto."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">4. Honorários</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Definidos pelo Profissional</li>
                      <li>Pagos diretamente pelo Utilizador</li>
                      <li>Sem comissão da ImoPonto</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">5. Responsabilidade e Seguro</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground space-y-3">
                    <p>O Profissional responde integralmente pelos atos praticados.</p>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm italic">
                        "Declaro possuir seguro de responsabilidade civil profissional válido, 
                        conforme exigido legalmente."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">6. Lei Aplicável</h3>
                  </div>
                  <div className="pl-13 text-muted-foreground">
                    <p>Lei portuguesa.</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* PARTE V */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE V — Cláusulas Específicas por Tipo de Profissional
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">A) Advogados</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Atuação nos termos do Estatuto da OA</li>
                    <li>Seguro de responsabilidade profissional</li>
                    <li>Relação advogado-cliente autónoma</li>
                  </ul>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">B) Notários</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Exercício de função pública</li>
                    <li>Atos notariais independentes</li>
                  </ul>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">C) Intermediários de Crédito</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Registo no Banco de Portugal</li>
                    <li>Decisão final do cliente e do banco</li>
                  </ul>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">D) Técnicos de Certificação Energética</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Habilitação no SCE / ADENE</li>
                    <li>Responsabilidade técnica exclusiva</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* PARTE VI */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE VI — Termos e Condições Específicos do Cofre Digital
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    num: "1",
                    title: "Definição",
                    content: "O Cofre Digital ImoPonto é uma funcionalidade tecnológica destinada ao armazenamento, organização e partilha controlada de documentos relacionados com imóveis e utilizadores."
                  },
                  {
                    num: "2",
                    title: "Natureza do Serviço",
                    list: ["Serviço meramente tecnológico", "Não constitui arquivo legal certificado", "Não substitui entidades públicas ou profissionais"]
                  },
                  {
                    num: "3",
                    title: "Titularidade dos Documentos",
                    list: ["Os documentos pertencem exclusivamente ao Utilizador", "A ImoPonto não adquire qualquer direito sobre os conteúdos"]
                  },
                  {
                    num: "4",
                    title: "Upload e Gestão",
                    list: ["O carregamento é voluntário", "A organização é da responsabilidade do Utilizador", "A ImoPonto não verifica autenticidade, validade ou atualidade"]
                  },
                  {
                    num: "5",
                    title: "Acesso e Partilha",
                    list: ["O acesso é controlado pelo Utilizador", "Pode ser concedido a profissionais independentes", "A ImoPonto não acede ao conteúdo salvo por obrigação legal"]
                  },
                  {
                    num: "6",
                    title: "Validação de Documentos",
                    list: ["Apenas profissionais independentes podem validar", "A validação não vincula a ImoPonto", "A ImoPonto não certifica documentos"]
                  },
                  {
                    num: "7",
                    title: "Segurança da Informação",
                    list: ["Medidas técnicas e organizativas adequadas", "Sem garantia absoluta contra acessos indevidos"]
                  },
                  {
                    num: "8",
                    title: "Disponibilidade",
                    list: ["Serviço \"as is\"", "Pode ser suspenso para manutenção", "Sem responsabilidade por perdas indiretas"]
                  },
                  {
                    num: "9",
                    title: "Eliminação de Dados",
                    list: ["O Utilizador pode eliminar documentos", "A ImoPonto pode eliminar após encerramento de conta", "Cumprimento de obrigações legais de retenção"]
                  },
                  {
                    num: "10",
                    title: "Limitação de Responsabilidade",
                    content: "A ImoPonto não responde por:",
                    list: ["Uso indevido de documentos", "Consequências legais do conteúdo", "Erros ou omissões nos ficheiros"]
                  }
                ].map((section) => (
                  <div key={section.num} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FolderLock className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{section.num}. {section.title}</h3>
                    </div>
                    <div className="pl-13 text-muted-foreground">
                      {section.content && <p className="mb-2">{section.content}</p>}
                      {section.list && (
                        <ul className="list-disc pl-6 space-y-1">
                          {section.list.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* PARTE VII */}
            <section className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PARTE VII — Conclusão Operacional
                </h2>
              </div>

              <div className="bg-primary/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">A ImoPonto é:</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    "Plataforma tecnológica",
                    "Marketplace neutro",
                    "Sem intermediação",
                    "Sem aconselhamento",
                    "Sem responsabilidade sobre serviços"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 bg-background rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer notice */}
            <section className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Estes termos podem ser atualizados periodicamente. Recomendamos que os consulte regularmente 
                para se manter informado sobre as condições de utilização da plataforma.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;
