export interface DocumentCategory {
  value: string;
  label: string;
  whereToGet: string;
}

export interface GuideStep {
  title: string;
  description: string;
  link?: { url: string; label: string };
  imageUrl?: string;
}

export interface DocumentGuide {
  title: string;
  steps: GuideStep[];
}

export interface DocumentInfo {
  description: string;
  whereToGet: string;
  additionalInfo: string;
  link?: { url: string; label: string };
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    value: 'certidao',
    label: 'Certidão Permanente do Registo Predial',
    whereToGet: 'Online: portal oficial da Conservatória do Registo Predial → PredialOnline. Presencial: em qualquer Conservatória do Registo Predial.'
  },
  {
    value: 'caderneta',
    label: 'Caderneta Predial',
    whereToGet: 'Portal das Finanças (online gratuitamente). Presencial: repartições de Finanças.'
  },
  {
    value: 'licenca',
    label: 'Licença de Utilização / Licença de Habitação',
    whereToGet: 'Câmara Municipal da área do imóvel (serviço de urbanismo).'
  },
  {
    value: 'ficha',
    label: 'Ficha Técnica de Habitação (FTH)',
    whereToGet: 'Proprietário ou seu representante (normalmente entregue pela entidade que fez a obra e depositada na Câmara Municipal).'
  },
  {
    value: 'certificado',
    label: 'Certificado Energético',
    whereToGet: 'Emitido por técnicos autorizados (consultores ou empresas certificadas pela ADENE).'
  },
  {
    value: 'impostos',
    label: 'Comprovativos dos Impostos Pagos',
    whereToGet: 'Pagamentos feitos através das Finanças (Portal das Finanças ou presencialmente).'
  },
  {
    value: 'outros',
    label: 'Outros Documentos',
    whereToGet: 'Documentos adicionais relevantes para a transação do imóvel.'
  },
];

export const DOCUMENT_GUIDES: Record<string, DocumentGuide> = {
  certidao: {
    title: "Como obter a Certidão Permanente do Registo Predial",
    steps: [
      {
        title: "Aceder ao Portal Predial Online",
        description: "Aceda ao portal oficial da Conservatória do Registo Predial através do link abaixo. Necessita de autenticação com Chave Móvel Digital ou Cartão de Cidadão.",
        link: { url: "https://www.predialonline.pt/", label: "Abrir Predial Online" }
      },
      {
        title: "Pesquisar o Imóvel",
        description: "Utilize o número de descrição predial ou a morada do imóvel para localizar a propriedade no sistema. O número de descrição encontra-se em escrituras anteriores ou na caderneta predial.",
      },
      {
        title: "Solicitar a Certidão Permanente",
        description: "Selecione a opção 'Certidão Permanente' que tem validade de 6 meses e pode ser consultada online por qualquer pessoa com o código de acesso.",
      },
      {
        title: "Efetuar o Pagamento",
        description: "O custo é de aproximadamente €15. Após pagamento, receberá um código de acesso que permite a consulta online da certidão por entidades interessadas.",
      }
    ]
  },
  caderneta: {
    title: "Como obter a Caderneta Predial",
    steps: [
      {
        title: "Aceder ao Portal das Finanças",
        description: "Entre no Portal das Finanças com as suas credenciais de acesso (NIF e senha). Se não tiver conta, pode registar-se gratuitamente.",
        link: { url: "https://www.portaldasfinancas.gov.pt/", label: "Abrir Portal das Finanças" }
      },
      {
        title: "Navegar para Património",
        description: "No menu principal, selecione 'Cidadãos' > 'Património' > 'Consultar Património' para visualizar todos os imóveis registados em seu nome.",
      },
      {
        title: "Selecionar o Imóvel",
        description: "Localize o imóvel pretendido na lista e clique para ver os detalhes. Certifique-se que os dados estão atualizados.",
      },
      {
        title: "Emitir a Caderneta",
        description: "Clique em 'Emitir Caderneta Predial Urbana' para gerar o documento em PDF. O download é gratuito e imediato.",
      }
    ]
  }
};

export const DOCUMENT_INFO: Record<string, DocumentInfo> = {
  licenca: {
    description: "Documento que comprova que o imóvel está autorizado para habitação e cumpre todas as normas urbanísticas.",
    whereToGet: "Câmara Municipal da área do imóvel, no serviço de urbanismo.",
    additionalInfo: "Para imóveis anteriores a 1951 pode não existir. Nesse caso, solicite uma certidão de antiguidade.",
    link: { url: "https://eportugal.gov.pt/", label: "Portal ePortugal" }
  },
  ficha: {
    description: "Documento técnico obrigatório para imóveis construídos após 2004 que descreve as características da construção.",
    whereToGet: "Normalmente entregue pelo construtor/promotor. Cópia disponível na Câmara Municipal.",
    additionalInfo: "Apenas obrigatória para imóveis construídos ou reconstruídos após 30 de março de 2004."
  },
  certificado: {
    description: "Documento que classifica a eficiência energética do imóvel numa escala de A+ (mais eficiente) a F (menos eficiente).",
    whereToGet: "Emitido por técnicos autorizados pela ADENE. Pode pesquisar técnicos no site da ADENE.",
    additionalInfo: "Obrigatório para venda ou arrendamento. Válido por 10 anos. Custo varia entre €50-€300 dependendo da área.",
    link: { url: "https://www.sce.pt/", label: "Portal SCE - ADENE" }
  },
  impostos: {
    description: "Comprovativos de pagamento de IMI e outros impostos associados ao imóvel.",
    whereToGet: "Portal das Finanças ou presencialmente nas repartições de Finanças.",
    additionalInfo: "Mantenha os últimos 3 anos de comprovativos para demonstrar a situação fiscal regularizada."
  },
  outros: {
    description: "Documentos adicionais relevantes para a transação do imóvel.",
    whereToGet: "Varia conforme o tipo de documento.",
    additionalInfo: "Pode incluir plantas, contratos anteriores, certificados de conformidade, entre outros."
  }
};

export const getCategoryLabel = (value: string | null): string => {
  const cat = DOCUMENT_CATEGORIES.find(c => c.value === value);
  return cat?.label || 'Outros Documentos';
};

export const getCategoryWhereToGet = (value: string | null): string => {
  const cat = DOCUMENT_CATEGORIES.find(c => c.value === value);
  return cat?.whereToGet || '';
};
