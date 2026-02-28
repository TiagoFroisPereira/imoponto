import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Info,
  Plus,
  Check,
  X,
  Eye,
  Trash2,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { usePropertyProposals, CreateProposalData } from "@/hooks/usePropertyProposals";
import { cn } from "@/lib/utils";

interface ProposalsManagerProps {
  propertyId: string;
  propertyPrice?: number;
  onProposalAccepted?: () => void;
}

export function ProposalsManager({
  propertyId,
  propertyPrice,
  onProposalAccepted
}: ProposalsManagerProps) {
  const {
    proposals,
    isLoading,
    createProposal,
    acceptProposal,
    rejectProposal,
    resetProposalStatus,
    deleteProposal,
    hasAcceptedProposal,
    acceptedProposal,
    canAdvanceWizard,
    highestProposal,
  } = usePropertyProposals(propertyId);

  const [showForm, setShowForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProposalData>({
    property_id: propertyId,
    name: "",
    amount: 0,
    deadline: "",
    requires_financing: false,
    has_written_proposal: true,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      property_id: propertyId,
      name: "",
      amount: 0,
      deadline: "",
      requires_financing: false,
      has_written_proposal: true,
      notes: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProposal.mutateAsync(formData);
    resetForm();
  };

  const handleAccept = async (proposalId: string) => {
    await acceptProposal.mutateAsync(proposalId);
    setConfirmAccept(null);
    onProposalAccepted?.();
  };

  const handleDelete = async (proposalId: string) => {
    await deleteProposal.mutateAsync(proposalId);
    setConfirmDelete(null);
  };

  const handleResetStatus = async (proposalId: string) => {
    await resetProposalStatus.mutateAsync(proposalId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aceite
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Em análise
          </Badge>
        );
    }
  };

  const selectedProposalData = proposals.find((p) => p.id === selectedProposal);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Message */}
      {!canAdvanceWizard && proposals.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {!hasAcceptedProposal ? (
              "Para avançar, aceite uma proposta."
            ) : !acceptedProposal?.has_written_proposal ? (
              "A proposta aceite deve ter documentação escrita para avançar."
            ) : !acceptedProposal?.amount || !acceptedProposal?.deadline ? (
              "A proposta aceite deve ter valor e prazo definidos."
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {hasAcceptedProposal && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Tem uma proposta aceite. Pode adicionar mais propostas ou alterar o estado das existentes se necessário.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Proposal Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Proposta
        </Button>
      </div>

      {/* Add Proposal Form */}
      {showForm && (
        <div className="border rounded-lg p-6 bg-card space-y-6">
          <h3 className="font-semibold text-lg">Nova Proposta</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da proposta *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Casal jovem, Investidor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor da proposta (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  placeholder={propertyPrice ? propertyPrice.toString() : "250000"}
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo *</Label>
                <Input
                  id="deadline"
                  placeholder="Ex: 90 dias, 31/03/2025"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Financing */}
            <div className="space-y-2">
              <Label>Necessita de financiamento? *</Label>
              <RadioGroup
                value={formData.requires_financing ? "yes" : "no"}
                onValueChange={(value) =>
                  setFormData({ ...formData, requires_financing: value === "yes" })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="financing-no" />
                  <Label htmlFor="financing-no" className="cursor-pointer">
                    Não
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="financing-yes" />
                  <Label htmlFor="financing-yes" className="cursor-pointer">
                    Sim
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.requires_financing && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Propostas com financiamento podem demorar mais tempo a concluir.
                </AlertDescription>
              </Alert>
            )}

            {/* Written Proposal */}
            <div className="space-y-2">
              <Label>Existe proposta escrita? *</Label>
              <RadioGroup
                value={formData.has_written_proposal ? "yes" : "no"}
                onValueChange={(value) =>
                  setFormData({ ...formData, has_written_proposal: value === "yes" })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="written-yes" />
                  <Label htmlFor="written-yes" className="cursor-pointer">
                    Sim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="written-no" />
                  <Label htmlFor="written-no" className="cursor-pointer">
                    Não
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {!formData.has_written_proposal && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Recomendamos nunca aceitar propostas verbais. Peça sempre uma proposta escrita
                  antes de avançar.
                </AlertDescription>
              </Alert>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionais sobre a proposta..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProposal.isPending}>
                {createProposal.isPending ? "A guardar..." : "Guardar Proposta"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Proposals Table (Desktop) / Cards (Mobile) */}
      {proposals.length > 0 ? (
        <div className="space-y-4">
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-center">Financiamento</TableHead>
                  <TableHead className="text-center">Proposta Escrita</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow
                    key={proposal.id}
                    className={cn(
                      proposal.status === "accepted" && "bg-green-50",
                      proposal.status === "rejected" && "opacity-60"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {proposal.name}
                        {highestProposal?.id === proposal.id && proposal.status !== "rejected" && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Mais alta
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">{formatCurrency(proposal.amount)}</span>
                        {propertyPrice && propertyPrice > 0 && (
                          <span className={cn(
                            "text-[10px] font-medium",
                            proposal.amount >= propertyPrice ? "text-green-600" : "text-amber-600"
                          )}>
                            {proposal.amount >= propertyPrice ? "+" : ""}
                            {(((proposal.amount - propertyPrice) / propertyPrice) * 100).toFixed(1)}% vs pedido
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{proposal.deadline}</TableCell>
                    <TableCell className="text-center">
                      {proposal.requires_financing ? (
                        <span className="text-amber-600">Sim</span>
                      ) : (
                        <span className="text-green-600 flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          Não
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {proposal.has_written_proposal ? (
                        <span className="text-green-600 flex items-center justify-center gap-1">
                          <FileText className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedProposal(proposal.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {proposal.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => setConfirmAccept(proposal.id)}
                              title="Aceitar proposta"
                              disabled={hasAcceptedProposal}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setConfirmDelete(proposal.id)}
                              title="Eliminar proposta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {(proposal.status === "accepted" || proposal.status === "rejected") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleResetStatus(proposal.id)}
                              title="Marcar como pendente"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setConfirmDelete(proposal.id)}
                              title="Eliminar proposta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className={cn(
                  "p-4 rounded-lg border bg-card space-y-3",
                  proposal.status === "accepted" && "border-green-200 bg-green-50/50",
                  proposal.status === "rejected" && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{proposal.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(proposal.status)}
                      {highestProposal?.id === proposal.id && proposal.status !== "rejected" && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Mais alta
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(proposal.amount)}</p>
                    {propertyPrice && propertyPrice > 0 && (
                      <p className={cn(
                        "text-[10px] font-medium",
                        proposal.amount >= propertyPrice ? "text-green-600" : "text-amber-600"
                      )}>
                        {proposal.amount >= propertyPrice ? "+" : ""}
                        {(((proposal.amount - propertyPrice) / propertyPrice) * 100).toFixed(1)}% vs pedido
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div className="text-muted-foreground">Prazo:</div>
                  <div className="font-medium text-right">{proposal.deadline}</div>

                  <div className="text-muted-foreground">Financiamento:</div>
                  <div className="text-right">
                    {proposal.requires_financing ? (
                      <span className="text-amber-600">Sim</span>
                    ) : (
                      <span className="text-green-600">Não</span>
                    )}
                  </div>

                  <div className="text-muted-foreground">Documentação:</div>
                  <div className="text-right">
                    {proposal.has_written_proposal ? (
                      <span className="text-green-600">Escrita</span>
                    ) : (
                      <span className="text-amber-600">Verbal</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedProposal(proposal.id)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Detalhes
                  </Button>
                  {proposal.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setConfirmAccept(proposal.id)}
                        disabled={hasAcceptedProposal}
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Aceitar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 text-xs px-2"
                        onClick={() => setConfirmDelete(proposal.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {(proposal.status === "accepted" || proposal.status === "rejected") && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleResetStatus(proposal.id)}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Pendente
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 text-xs px-2"
                        onClick={() => setConfirmDelete(proposal.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Sem propostas</h3>
          <p className="text-muted-foreground mb-4">
            Adicione as propostas que receber para as poder comparar.
          </p>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Proposta</DialogTitle>
          </DialogHeader>
          {selectedProposalData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-medium">{selectedProposalData.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Valor</Label>
                  <p className="font-semibold text-lg">
                    {formatCurrency(selectedProposalData.amount)}
                  </p>
                  {propertyPrice && propertyPrice > 0 && (
                    <p className={cn(
                      "text-sm font-medium",
                      selectedProposalData.amount >= propertyPrice ? "text-green-600" : "text-amber-600"
                    )}>
                      {selectedProposalData.amount >= propertyPrice ? "+" : ""}
                      {formatCurrency(selectedProposalData.amount - propertyPrice)}
                      ({(((selectedProposalData.amount - propertyPrice) / propertyPrice) * 100).toFixed(1)}%) vs preço pedido
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Prazo</Label>
                  <p>{selectedProposalData.deadline}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedProposalData.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Financiamento</Label>
                  <p>{selectedProposalData.requires_financing ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Proposta Escrita</Label>
                  <p>{selectedProposalData.has_written_proposal ? "Sim" : "Não"}</p>
                </div>
              </div>
              {selectedProposalData.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Observações</Label>
                  <p className="mt-1 text-sm">{selectedProposalData.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Accept Dialog */}
      <Dialog open={!!confirmAccept} onOpenChange={() => setConfirmAccept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar Proposta</DialogTitle>
            <DialogDescription>
              Ao aceitar esta proposta, todas as outras serão automaticamente rejeitadas. Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAccept(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => confirmAccept && handleAccept(confirmAccept)}
              disabled={acceptProposal.isPending}
            >
              {acceptProposal.isPending ? "A processar..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Proposta</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar esta proposta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              disabled={deleteProposal.isPending}
            >
              {deleteProposal.isPending ? "A eliminar..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
