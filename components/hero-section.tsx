"use client";

import { ArrowRight, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import Link from "next/link";

import FadeInView from "./animate-ui/fade-in-view";
import { Button } from "@/components/ui/button";

const ledgerRows = [
  { name: "Alquiler", category: "Hogar", value: "$ 485.000", status: "Pagado" },
  { name: "Tarjeta", category: "Gastos personales", value: "$ 186.420", status: "Pendiente" },
  { name: "Internet", category: "Servicios", value: "$ 32.800", status: "Pendiente" },
];

export default function HeroSection() {
  return (
    <section className="border-b border-border">
      <div className="container grid min-h-[82vh] items-center gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_34rem] lg:py-24">
        <FadeInView className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Finanzas personales, sin ruido
          </p>
          <h1 className="font-serif text-5xl font-bold leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Sabé qué pagaste.
            <span className="block text-muted-foreground">Y qué falta pagar.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Organizá gastos, presupuesto y fondos en dólares desde un libro
            financiero claro, pensado para el día a día en Argentina.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Crear cuenta
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Ingresar</Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>Sin tarjeta</span>
            <span>Datos privados</span>
            <span>ARS y USD</span>
          </div>
        </FadeInView>

        <FadeInView delay={0.15}>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Julio de 2026
                </p>
                <p className="mt-1 font-serif text-xl font-bold">Libro mensual</p>
              </div>
              <ReceiptText className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-3 border-b border-border">
              <PreviewMetric label="Pendiente" value="$ 219.220" icon={Clock3} />
              <PreviewMetric label="Pagado" value="$ 1.827.308" icon={CheckCircle2} />
              <PreviewMetric label="Avance" value="22 / 27" icon={ReceiptText} />
            </div>
            <div>
              {ledgerRows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{row.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{row.value}</p>
                    <p className={row.status === "Pagado" ? "mt-0.5 text-xs text-chart-5" : "mt-0.5 text-xs text-primary"}>
                      {row.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}

function PreviewMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="min-w-0 border-r border-border p-4 last:border-r-0">
      <Icon className="mb-3 size-4 text-primary" aria-hidden="true" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
