interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateFreely: boolean;
}

const steps = [
  { num: 1, label: "Informações" },
  { num: 2, label: "Detalhes" },
  { num: 3, label: "Fotografias e Vídeo" },
  { num: 4, label: "Cofre Digital" },
  { num: 5, label: "Agenda" },
];

const StepIndicator = ({ currentStep, onStepClick, canNavigateFreely }: StepIndicatorProps) => {
  return (
    <div className="bg-background border rounded-xl overflow-hidden mb-6">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => onStepClick(s.num)}
                disabled={!canNavigateFreely && currentStep < s.num}
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  currentStep >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                } ${canNavigateFreely ? "cursor-pointer hover:bg-primary/80" : "cursor-default"}`}
              >
                {s.num}
              </button>
              <span className={`ml-2 text-xs sm:text-sm hidden md:inline ${currentStep >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 4 && <div className={`w-6 sm:w-12 md:w-16 h-0.5 mx-1 sm:mx-2 ${currentStep > s.num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
