"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import FadeInView from "./animate-ui/fade-in-view";

export default function HeroSection() {
   return (
      <section className="relative min-h-[92vh] overflow-hidden py-16 md:py-24">
         <div className="fintech-grid pointer-events-none absolute inset-0" />
         <div className="pointer-events-none absolute right-[8%] top-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
         <div className="pointer-events-none absolute bottom-10 left-[5%] h-96 w-96 rounded-full bg-gold-200/10 blur-3xl" />

         <div className="container relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
            <div className="flex flex-col items-start gap-8 text-left">
            <FadeInView>
               <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-2 text-sm font-semibold text-primary shadow-xs backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  <span>Gestión Financiera Personal</span>
               </div>
            </FadeInView>

            <FadeInView delay={0.15}>
               <h1 className="max-w-4xl font-serif text-5xl font-extrabold leading-[0.95] tracking-normal sm:text-6xl md:text-7xl lg:text-8xl">
                  Controlá{" "}
                  <span className="relative inline-block">
                     <span className="relative z-10 text-transparent bg-gradient-to-r from-primary via-gold-300 to-primary bg-clip-text">
                        tus mangos
                     </span>
                     <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 -skew-x-3 rounded-sm" />
                  </span>
               </h1>
            </FadeInView>

            <FadeInView delay={0.3}>
               <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Rastreá tus gastos, controlá presupuestos y recibí alertas inteligentes.
                  <span className="text-foreground font-medium"> Todo en un solo lugar.</span>
               </p>
            </FadeInView>

            <FadeInView delay={0.45} className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row">
               <Button asChild size="lg" className="group h-13 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link href="/sign-up" className="flex items-center gap-2">
                     <span>Empezar gratis</span>
                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
               </Button>
               <Button variant="ghost" size="lg" asChild className="h-13 px-8 text-base text-muted-foreground hover:text-foreground">
                  <Link href="/sign-in">
                     Ya tengo cuenta
                  </Link>
               </Button>
            </FadeInView>

            {/* Floating stats badges */}
            <FadeInView delay={0.6} className="flex flex-wrap items-center gap-6 pt-4">
               {[
                  { label: "100% Gratis", icon: "✦" },
                  { label: "Datos privados", icon: "◆" },
                  { label: "Sin tarjeta requerida", icon: "●" },
               ].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                     <span className="text-primary text-xs">{item.icon}</span>
                     {item.label}
                  </span>
               ))}
            </FadeInView>
            </div>

            <FadeInView delay={0.25}>
               <div className="fintech-panel relative overflow-hidden rounded-2xl p-5">
                  <div className="mb-5 flex items-center justify-between">
                     <div>
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
                           Panel mensual
                        </p>
                        <p className="font-serif text-xl font-bold tracking-normal">
                           Mis Mangos
                        </p>
                     </div>
                     <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
                        LIVE
                     </div>
                  </div>
                  <div className="space-y-3">
                     {[
                        ["Total estimado", "$ 842.500", "78% controlado"],
                        ["Pendiente", "$ 185.200", "6 items"],
                        ["Presupuesto", "$ 1.080.000", "dentro del límite"],
                     ].map(([label, value, meta]) => (
                        <div key={label} className="rounded-xl border border-border/60 bg-background/60 p-4">
                           <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-medium text-muted-foreground">{label}</span>
                              <span className="font-mono text-[11px] font-semibold uppercase text-primary">{meta}</span>
                           </div>
                           <div className="mt-2 font-serif text-2xl font-extrabold tracking-normal">{value}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </FadeInView>
         </div>
      </section>
   );
}
