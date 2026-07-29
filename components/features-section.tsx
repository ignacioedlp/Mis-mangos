import { BarChart3, ReceiptText, Wallet } from "lucide-react";

const features = [
  {
    number: "01",
    name: "Registrá una vez",
    description: "Definí gastos recurrentes, categorías y cuotas sin repetir trabajo cada mes.",
    icon: ReceiptText,
  },
  {
    number: "02",
    name: "Resolvé el mes",
    description: "Marcá pagos, detectá pendientes y compará el gasto real contra lo estimado.",
    icon: BarChart3,
  },
  {
    number: "03",
    name: "Cuidá lo disponible",
    description: "Entendé presupuesto, ahorro y transferencias en USD desde la misma vista.",
    icon: Wallet,
  },
];

export default function FeaturesSection() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Cómo funciona</p>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Un flujo corto para tener el mes bajo control.
          </h2>
        </div>
        <div className="mt-14 grid border-y border-border md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.number} className="border-b border-border px-1 py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{feature.number}</span>
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-8 font-serif text-xl font-bold">{feature.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
