export default function Pricing({ loaderData }: { loaderData?: any }) {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Pricing</h2>
        <p className="text-center text-muted-foreground mb-8">
          Simple, transparent pricing for accounting services
        </p>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Contact us for pricing information
          </p>
        </div>
      </div>
    </section>
  );
}
