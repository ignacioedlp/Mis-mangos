"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import FadeInView from "./animate-ui/fade-in-view";

export default function HeroSection() {
   return (
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-40">
         {/* Decorative geometric elements */}
         <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
         <div className="absolute bottom-10 left-[5%] w-96 h-96 rounded-full bg-primary/3 blur-3xl pointer-events-none" />

         <div className="container relative flex flex-col items-center gap-8 text-center">
            <FadeInView>
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
                  <Sparkles className="size-3.5" />
                  <span>Gestión Financiera Personal</span>
               </div>
            </FadeInView>

            <FadeInView delay={0.15}>
               <h1 className="font-serif text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-4xl leading-[0.9]">
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

            <FadeInView delay={0.45} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
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
            <FadeInView delay={0.6} className="flex flex-wrap items-center justify-center gap-6 pt-8">
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
      </section>
   );
}
