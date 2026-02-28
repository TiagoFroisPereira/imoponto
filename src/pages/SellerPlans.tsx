import { SellerPlansContent } from "@/components/property/SellerPlansContent";

export default function SellerPlans() {
    return (
        <div className="bg-background selection:bg-primary/10">
            <main className="pt-20 pb-24">
                <div className="container mx-auto px-4">
                    <SellerPlansContent />
                </div>
            </main>
        </div>
    );
}
