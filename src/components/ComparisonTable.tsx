import { ArrowRight, Sparkles, Target } from "lucide-react";

const comparisonPoints = [
    { label: "Comissão de Venda", agency: "5% a 6% + IVA", imoponto: "0% (Zero)" },
    { label: "Controlo das Visitas", agency: "Agente Decide", imoponto: "Você Decide" },
    { label: "Documentação", agency: "Tratada por Terceiros", imoponto: "Cofre Digital Seguro" },
    { label: "Custo Fixo", agency: "Milhares de Euros", imoponto: "Baixo Custo / Grátis" },
    { label: "Transparência", agency: "Intermediários", imoponto: "Contacto Direto" },
];

const ComparisonTable = () => {
    return (
        <section className="py-12 md:py-20 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                        <Target className="w-3 h-3" />
                        <span>Transparência Máxima</span>
                    </div>
                    <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6 leading-tight">ImoPonto vs. Agência Tradicional</h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                        Veja porque milhares de proprietários escolhem tomar o controlo da sua venda.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-border/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-card relative">
                    <div className="absolute top-0 right-0 py-1 px-2 md:py-2 md:px-8 bg-accent text-white text-[9px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-bl-lg md:rounded-bl-2xl shadow-lg z-20 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                        <span className="hidden md:inline">Escolha Inteligente</span>
                    </div>

                    <div className="w-full">
                        <table className="w-full text-left border-collapse table-fixed md:table-auto">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="p-3 md:p-10 font-black text-[10px] md:text-xl text-muted-foreground uppercase tracking-wider w-[35%] md:w-auto">Vantagens</th>
                                    <th className="p-3 md:p-10 font-black text-[10px] md:text-xl text-destructive text-center opacity-40 w-[30%] md:w-auto">Agência</th>
                                    <th className="p-3 md:p-10 font-black text-[11px] md:text-2xl text-accent text-center bg-accent/5 relative w-[35%] md:w-auto">
                                        ImoPonto
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {comparisonPoints.map((point, i) => (
                                    <tr key={i} className="group hover:bg-muted/20 transition-all duration-300">
                                        <td className="p-3 md:p-10 text-[11px] md:text-lg font-bold text-foreground/80 leading-tight">
                                            {point.label}
                                        </td>
                                        <td className="p-3 md:p-10 text-[10px] md:text-lg text-destructive/50 text-center font-medium line-through decoration-destructive/20 leading-tight">
                                            {point.agency}
                                        </td>
                                        <td className="p-3 md:p-10 text-[11px] md:text-lg text-accent font-black text-center bg-accent/[0.02] group-hover:bg-accent/[0.05] transition-colors leading-tight">
                                            {point.imoponto}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 md:p-10 bg-accent text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        <p className="text-white font-black text-base md:text-3xl relative z-10 flex items-center justify-center gap-2 md:gap-3">
                            <Sparkles className="w-4 h-4 md:w-8 md:h-8 fill-current" />
                            O Lucro é Todo Seu.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComparisonTable;
