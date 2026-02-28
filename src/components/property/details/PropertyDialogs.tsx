import { AddProfessionalDialog } from "@/components/property/AddProfessionalDialog";
import { BookVisitDialog } from "@/components/property/BookVisitDialog";
import { SendMessageDialog } from "@/components/property/SendMessageDialog";
import { VisitScheduler, type TimeSlot } from "@/components/property/VisitScheduler";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvailableDay {
  date: Date;
  slots: TimeSlot[];
}

interface PropertyDialogsProps {
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  propertyStatus: string;
  propertyPrice: number;
  wizardStep: number;
  isOwner: boolean;
  vaultDocumentIds: string[];
  requestedDocumentName?: string;
  availableDays: AvailableDay[];

  showProfessionalDialog: boolean;
  onProfessionalDialogChange: (open: boolean) => void;

  showBookVisitDialog: boolean;
  onBookVisitDialogChange: (open: boolean) => void;
  selectedVisitDate: Date | null;
  selectedVisitSlot: TimeSlot | null;

  showMessageDialog: boolean;
  onMessageDialogChange: (open: boolean) => void;


  showSchedulerDialog: boolean;
  onSchedulerDialogChange: (open: boolean) => void;
  onBookSlot: (date: Date, slot: TimeSlot) => void;

  isAuthOpen: boolean;
  onAuthOpenChange: (open: boolean) => void;
}

export function PropertyDialogs({
  propertyId,
  propertyTitle,
  sellerId,
  propertyStatus,
  propertyPrice,
  wizardStep,
  isOwner,
  vaultDocumentIds,
  requestedDocumentName,
  availableDays,
  showProfessionalDialog,
  onProfessionalDialogChange,
  showBookVisitDialog,
  onBookVisitDialogChange,
  selectedVisitDate,
  selectedVisitSlot,
  showMessageDialog,
  onMessageDialogChange,
  showSchedulerDialog,
  onSchedulerDialogChange,
  onBookSlot,
  isAuthOpen,
  onAuthOpenChange,
}: PropertyDialogsProps) {
  return (
    <>
      <AddProfessionalDialog
        open={showProfessionalDialog}
        onOpenChange={onProfessionalDialogChange}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        vaultDocumentIds={vaultDocumentIds}
        requestedDocumentName={requestedDocumentName}
        ownerId={sellerId}
      />

      <BookVisitDialog
        open={showBookVisitDialog}
        onOpenChange={onBookVisitDialogChange}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        sellerId={sellerId}
        selectedDate={selectedVisitDate}
        selectedSlot={selectedVisitSlot}
      />

      <SendMessageDialog
        open={showMessageDialog}
        onOpenChange={onMessageDialogChange}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        sellerId={sellerId}
      />


      <Dialog open={showSchedulerDialog} onOpenChange={onSchedulerDialogChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
          </DialogHeader>
          <VisitScheduler
            availableDays={availableDays}
            onAvailabilityChange={() => { }}
            mode="view"
            onBookSlot={onBookSlot}
          />
        </DialogContent>
      </Dialog>

      <AuthDialog open={isAuthOpen} onOpenChange={onAuthOpenChange} />
    </>
  );
}
