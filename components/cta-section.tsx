import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import FadeInView from "./animate-ui/fade-in-view";

const benefits = [
   "Registro gratuito y sin compromisos",
   "Interfaz intuitiva y fácil de usar",
   "Datos seguros y privados",
   "Soporte completo en español"
];

export default function CTASection() {
   return (
      <section className="relative py-24 md:py-36 overflow-hidden">
         {/* Warm gradient background */}
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/40 to-primary/5 pointer-events-none" />
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
         <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

         <div className="container mx-auto relative">
            <div className="max-w-3xl mx-auto text-center">
               <FadeInView>
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary">¡Empezá hoy!</span>
               </FadeInView>

               <FadeInView delay={0.1}>
                  <h2 className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mt-4">
                     Tomá el control de tus finanzas{" "}
                     <span className="text-transparent bg-gradient-to-r from-primary via-gold-300 to-primary bg-clip-text">
                        en minutos
                     </span>
                  </h2>
               </FadeInView>

               <FadeInView delay={0.2}>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
                     Unite a usuarios que ya están mejorando su salud financiera con Mis Mangos.
                  </p>
               </FadeInView>

               <FadeInView delay={0.3}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mt-10 text-left">
                     {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2.5">
                           <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-3 w-3 text-primary" />
                           </div>
                           <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                     ))}
                  </div>
               </FadeInView>

               <FadeInView delay={0.4} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                  <Button asChild size="lg" className="group h-13 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                     <Link href="/sign-up" className="flex items-center gap-2">
                        <span>Crear cuenta gratis</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                     </Link>
                  </Button>

                  <Button variant="ghost" size="lg" asChild className="h-13 px-8 text-base text-muted-foreground hover:text-foreground">
                     <Link href="/sign-in">
                        Ya tengo cuenta
                     </Link>
                  </Button>
               </FadeInView>

               <FadeInView delay={0.5}>
                  <p className="text-xs text-muted-foreground mt-8">
                     Sin tarjeta de crédito · Cancelá cuando quieras
                  </p>
               </FadeInView>
            </div>
         </div>
      </section>
   );
}
