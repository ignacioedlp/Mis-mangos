import { Code, Database, Layers, Lock, Zap } from 'lucide-react'
import React from 'react'
import FadeInView from './animate-ui/fade-in-view';

const stack = [
   {
      name: "Next.js 15",
      icon: <Zap className="h-5 w-5" />,
      description: "Framework React con rendimiento de última generación",
   },
   {
      name: "Tailwind CSS",
      icon: <Code className="h-5 w-5" />,
      description: "Framework CSS utility-first para interfaces rápidas",
   },
   {
      name: "Shadcn UI",
      icon: <Layers className="h-5 w-5" />,
      description: "Componentes accesibles con Radix UI y Tailwind",
   },
   {
      name: "Better-Auth",
      icon: <Lock className="h-5 w-5" />,
      description: "Autenticación avanzada con seguridad integrada",
   },
   {
      name: "Prisma",
      icon: <Code className="h-5 w-5" />,
      description: "ORM de nueva generación para TypeScript",
   },
   {
      name: "PostgreSQL",
      icon: <Database className="h-5 w-5" />,
      description: "Base de datos potente y de código abierto",
   },
]

export default function TechStackSection() {
   return (
      <section className="relative py-24 md:py-36 overflow-hidden">
         <div className="container mx-auto">
            <FadeInView className="text-center space-y-3 pb-16 mx-auto max-w-2xl">
               <span className="text-sm font-semibold uppercase tracking-widest text-primary">Stack Tecnológico</span>
               <h2 className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Construido con lo mejor
               </h2>
               <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                  Tecnologías modernas, confiables y de alto rendimiento.
               </p>
            </FadeInView>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
               {stack.map((item, index) => (
                  <FadeInView
                     key={index}
                     delay={0.08 * (index + 1)}
                  >
                     <div className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:bg-accent/30">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                           {item.icon}
                        </div>
                        <div>
                           <h3 className="font-serif font-bold text-sm mb-0.5 group-hover:text-primary transition-colors">
                              {item.name}
                           </h3>
                           <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                           </p>
                        </div>
                     </div>
                  </FadeInView>
               ))}
            </div>
         </div>
      </section>
   )
}
