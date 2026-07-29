import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="grid items-end gap-8 border-b border-border pb-12 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Empezá con el próximo mes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Menos tiempo armando cuentas. Más claridad para decidir.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Crear cuenta
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
