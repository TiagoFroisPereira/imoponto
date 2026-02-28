import { Share, Eye, FileText, CheckCircle, FileSignature, Landmark, CheckCheck, LucideIcon, MessageSquare } from "lucide-react";

export interface WizardStep {
    id: number;
    label: string;
    description: string;
    longDescription: string;
    color: string;
    icon: LucideIcon;
    checklist?: string[];
    cta: string;
    tips?: string[];
    requiredDocuments?: string[];
    integration?: {
        title: string;
        description: string;
        buttonLabel: string;
        actionType: 'modal' | 'navigate' | 'inline';
        componentId?: string;
        targetUrl?: string;
    };
}

export const WIZARD_STEPS: Record<number, WizardStep> = {
    0: {
        id: 0,
        label: "Preparação",
        description: "Prepare o seu imóvel para venda",
        longDescription: "Preparar o imóvel e a documentação antes da publicação.",
        color: "text-slate-500",
        icon: FileText,
        cta: "Publicar anúncio",
        tips: [
            "Verifique a validade de cada documento.",
            "Carregue os documentos no Cofre Digital para partilha segura."
        ],
        requiredDocuments: ['certidao', 'caderneta', 'licenca', 'certificado'],
        integration: {
            title: "Cofre Digital",
            description: "Gerencie toda a documentação do seu imóvel num local seguro e partilhável.",
            buttonLabel: "Abrir Cofre",
            actionType: 'modal',
            componentId: 'vault'
        }
    },
    1: {
        id: 1,
        label: "Anúncio e Propostas",
        description: "Gestão de mercado e ofertas",
        longDescription: "Centralize o estado do seu anúncio, visitas e gestão de propostas.",
        color: "text-blue-500",
        icon: MessageSquare,
        cta: "Gerir propostas e mercado",
        integration: {
            title: "Gestão Integrada",
            description: "Acompanhe as propostas e o estado do seu imóvel no mercado.",
            buttonLabel: "Gestão de Anúncio",
            actionType: 'inline',
            componentId: 'listing-proposals'
        }
    },
    2: {
        id: 2,
        label: "CPCV",
        description: "Preparar documentação para CPCV",
        longDescription: "Organizar informação e documentação necessária para o Contrato Promessa de Compra e Venda.",
        color: "text-purple-500",
        icon: FileSignature,
        cta: "Avançar para Escritura",
        tips: [
            "O CPCV é essencial para garantir o compromisso entre as partes.",
            "Considere apoio jurídico para redigir e validar o contrato.",
            "Certifique-se que todas as condições estão claramente definidas."
        ],
        integration: {
            title: "Preparação de CPCV",
            description: "Organize a informação e documentação necessária para o CPCV com apoio orientativo.",
            buttonLabel: "Preparar CPCV",
            actionType: 'inline',
            componentId: 'cpcv'
        }
    },
    3: {
        id: 3,
        label: "Escritura",
        description: "Formalização da venda",
        longDescription: "Garantir que tudo está pronto para a escritura.",
        color: "text-indigo-500",
        icon: Landmark,
        integration: {
            title: "Preparar Escritura",
            description: "Organize a documentação e serviços para a escritura.",
            buttonLabel: "Preparar Escritura",
            actionType: 'inline',
            componentId: 'escritura'
        },
        cta: "Agendar escritura",
        tips: [
            "Verifique se o comprador tem o financiamento aprovado.",
            "Confirme data e hora com o Cartório/Notário."
        ],
        requiredDocuments: ['impostos']
    },
    4: {
        id: 4,
        label: "Escritura e Pós-Escritura",
        description: "Concluir o processo de venda",
        longDescription: "Garantir que toda a documentação está organizada e o processo encerrado.",
        color: "text-green-600",
        icon: Landmark,
        integration: {
            title: "Pós-Escritura",
            description: "Organize a documentação final e encerre o processo.",
            buttonLabel: "Gerir Pós-Escritura",
            actionType: 'inline',
            componentId: 'post-escritura'
        },
        cta: "Finalizar Processo",
        tips: [
            "Arquive a cópia da escritura no Cofre Digital.",
            "Certifique-se que o distrate de hipoteca foi processado.",
            "Cancele contratos de serviços associados ao imóvel."
        ]
    },
    5: {
        id: 5,
        label: "Vendido",
        description: "Processo concluído com sucesso",
        longDescription: "O imóvel foi vendido e o processo encerrado.",
        color: "text-emerald-500",
        icon: CheckCheck,
        cta: "Sair do assistente"
    }
};

export const getWizardStep = (step: number = 0) => {
    return WIZARD_STEPS[step] || WIZARD_STEPS[0];
};

export const getMaxSteps = () => Object.keys(WIZARD_STEPS).length - 1;
