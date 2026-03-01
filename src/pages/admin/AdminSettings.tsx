import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAdminLogs } from "@/hooks/useAdminLogs";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { logAction } = useAdminLogs();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      return map;
    },
  });

  const updateSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Erro ao atualizar definição",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    await logAction("update_setting", undefined, key, { value });
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    toast({ title: "Definição atualizada" });
  };

  const parseBool = (v: any) => v === true || v === "true";

  const parseAutoBlock = (v: any) => {
    if (typeof v === "object" && v !== null) return v;
    try { return JSON.parse(v); } catch { return { enabled: false, threshold: 3 }; }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const autoBlock = parseAutoBlock(settings?.auto_block_reports);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Definições</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Comunicação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Envio automático de emails"
            description="Emails enviados automaticamente após ações"
            checked={parseBool(settings?.auto_email)}
            onChange={(v) => updateSetting("auto_email", v)}
          />
          <SettingToggle
            label="Envio de SMS"
            description="Ativa integração futura de API SMS"
            checked={parseBool(settings?.sms_enabled)}
            onChange={(v) => updateSetting("sms_enabled", v)}
          />
          <SettingToggle
            label="Notificações Push"
            description="Notificações push ativas"
            checked={parseBool(settings?.push_notifications)}
            onChange={(v) => updateSetting("push_notifications", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Publicação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Aprovação manual de anúncios"
            description="Anúncios ficam 'Pendentes' até aprovação manual"
            checked={parseBool(settings?.manual_approval)}
            onChange={(v) => updateSetting("manual_approval", v)}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Bloqueio automático após denúncias</p>
              <p className="text-xs text-muted-foreground">Sistema bloqueia automaticamente após X denúncias</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                className="w-16 h-8 text-center"
                value={autoBlock.threshold}
                onChange={(e) =>
                  updateSetting("auto_block_reports", { ...autoBlock, threshold: +e.target.value })
                }
                min={1}
              />
              <Switch
                checked={autoBlock.enabled}
                onCheckedChange={(v) =>
                  updateSetting("auto_block_reports", { ...autoBlock, enabled: v })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Registo</CardTitle></CardHeader>
        <CardContent>
          <SettingToggle
            label="Registo de utilizadores"
            description="Permite que novos utilizadores criem conta. Quando desligado, aparece uma lista de espera."
            checked={parseBool(settings?.registration_enabled)}
            onChange={(v) => updateSetting("registration_enabled", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Segurança</CardTitle></CardHeader>
        <CardContent>
          <SettingToggle
            label="2FA obrigatório"
            description="Forçar segundo fator no login"
            checked={parseBool(settings?.require_2fa)}
            onChange={(v) => updateSetting("require_2fa", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
