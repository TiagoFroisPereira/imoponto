import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Shield, Bell } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface CompleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CompleteProfileDialog({ 
  open, 
  onOpenChange,
  onComplete 
}: CompleteProfileDialogProps) {
  const { profile, updateProfile } = useProfile();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format for Portuguese numbers
    if (digits.length <= 9) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3').trim();
    }
    return digits.slice(0, 12);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 9) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await updateProfile({
      phone: cleanPhone,
      full_name: fullName || profile?.full_name
    });

    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
      onComplete?.();
    }
  };

  const isValid = phone.replace(/\s/g, '').length >= 9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Complete o seu Perfil
          </DialogTitle>
          <DialogDescription>
            Para publicar anúncios, precisa adicionar o seu número de telefone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="O seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="912 345 678"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: 9 dígitos (ex: 912 345 678)
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Privacidade Garantida</p>
                <p className="text-xs text-muted-foreground">
                  O seu número não será visível para outros utilizadores
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Notificações SMS</p>
                <p className="text-xs text-muted-foreground">
                  Receberá SMS para pedidos de cofre digital e marcações de visitas
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
