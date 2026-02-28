import ListingOptionsSection from "@/components/property/ListingOptionsSection";

export default function ListingOptions() {
  return (
    <div className="bg-background">
      <main className="pt-8 pb-16">
        <ListingOptionsSection isStandalone={true} />
      </main>
    </div>
  );
}
