import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Landmark, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface Notary {
    id: string;
    name: string;
    address: string;
    slots: string[];
}

const PARTNER_NOTARIES: Notary[] = [
    {
        id: "notary-1",
        name: "Cartório Notarial de Lisboa - Dr. Silva",
        address: "Av. da Liberdade 123, Lisboa",
        slots: ["09:00", "11:30", "14:00", "16:30"]
    },
    {
        id: "notary-2",
        name: "Cartório Notarial de Cascais - Dra. Santos",
        address: "Rua Direita 45, Cascais",
        slots: ["10:00", "12:00", "15:00", "17:00"]
    }
];

interface NotaryBookingInterfaceProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId: string;
    onSuccess?: () => void;
}

export function NotaryBookingInterface({ open, onOpenChange, propertyId, onSuccess }: NotaryBookingInterfaceProps) {
    const [step, setStep] = useState<"notary" | "date" | "confirm" | "success">("notary");
    const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const { toast } = useToast();

    const handleConfirm = async () => {
        setStep("success");
        if (onSuccess) onSuccess();
        toast({
            title: "Agendamento Confirmado!",
            description: `Escritura agendada para ${selectedDate?.toLocaleDateString()} às ${selectedSlot} no ${selectedNotary?.name}.`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setTimeout(() => {
                setStep("notary");
                setSelectedNotary(null);
                setSelectedSlot(null);
            }, 300);
        }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-primary/5 p-6 border-b flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold">Agendamento de Escritura</DialogTitle>
                        <DialogDescription>Reserve o seu horário com um parceiro Imoponto</DialogDescription>
                    </div>
                    <Landmark className="w-8 h-8 text-primary/40" />
                </div>

                <div className="p-6">
                    {step === "notary" && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Selecione um Cartório Parceiro</h4>
                            <div className="grid gap-3">
                                {PARTNER_NOTARIES.map((notary) => (
                                    <div
                                        key={notary.id}
                                        onClick={() => {
                                            setSelectedNotary(notary);
                                            setStep("date");
                                        }}
                                        className="p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                                    >
                                        <div className="font-bold group-hover:text-primary">{notary.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {notary.address}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "date" && selectedNotary && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border shadow"
                                />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Horários Disponíveis</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {selectedNotary.slots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                            className="font-mono text-xs"
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Button
                                disabled={!selectedSlot || !selectedDate}
                                onClick={() => setStep("confirm")}
                                className="w-full h-11 font-bold rounded-xl"
                            >
                                Continuar
                            </Button>
                        </div>
                    )}

                    {step === "confirm" && selectedNotary && (
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <CalendarIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{selectedDate?.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                                        <div className="text-xs text-muted-foreground">Horário: {selectedSlot}</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Landmark className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{selectedNotary.name}</div>
                                        <div className="text-xs text-muted-foreground">{selectedNotary.address}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Partilha automática de documentos do Cofre</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Prioridade no atendimento (Agenda Imediata)</span>
                                </div>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-col gap-3">
                                <Button onClick={handleConfirm} className="w-full h-12 text-base font-bold rounded-xl">
                                    Confirmar Agendamento
                                </Button>
                                <Button variant="ghost" onClick={() => setStep("date")} className="text-xs">
                                    Alterar Data/Hora
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Agendamento Realizado!</h3>
                                <p className="text-sm text-muted-foreground">
                                    O Notário recebeu o seu pedido e os documentos do imóvel. Receberá um lembrete 24h antes da escritura.
                                </p>
                            </div>
                            <Button onClick={() => onOpenChange(false)} className="w-full h-11 font-bold rounded-xl">
                                Fechar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
