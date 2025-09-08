import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import FadeInView from "./animate-ui/fade-in-view";

const benefits = [
   "Registro gratuito y sin compromisos",
   "Interfaz intuitiva y fácil de usar", 
   "Datos seguros y privados",
   "Soporte completo en español"
];

export default function CTASection() {
   return (
      <section className="py-20 md:py-32 bg-muted/50">
         <div className="container mx-auto">
            <FadeInView className="text-center space-y-6 mx-auto max-w-4xl">
               <Badge className="px-4 py-1.5 text-sm font-medium">
                  <Smartphone className="mr-2 size-4" />
                  ¡Comienza Hoy!
               </Badge>
               
               <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl tracking-tight">
                  Toma el control de tus finanzas <br />
                  <span className="text-transparent bg-gradient-to-r from-primary bg-clip-text">
                     en minutos
                  </span>
               </h2>
               
               <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Únete a miles de usuarios que ya están mejorando su salud financiera con Mis Mangos
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  {benefits.map((benefit, index) => (
                     <FadeInView 
                        key={index}
                        delay={0.1 * (index + 1)}
                        className="flex items-center gap-3"
                     >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                     </FadeInView>
                  ))}
               </div>
               
               <FadeInView delay={0.6} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <Button asChild size="lg" className="group">
                     <Link href="/sign-up" className="flex items-center gap-2">
                        <span>Crear Cuenta Gratis</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                     </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild>
                     <Link href="/sign-in">
                        Ya tengo cuenta
                     </Link>
                  </Button>
               </FadeInView>
               
               <p className="text-sm text-muted-foreground pt-4">
                  * No se requiere tarjeta de crédito • Cancela en cualquier momento
               </p>
            </FadeInView>
         </div>
      </section>
   );
}
