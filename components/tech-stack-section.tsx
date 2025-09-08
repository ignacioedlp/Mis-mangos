import { Code, Database, Layers, Lock, Zap } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import FadeInView from './animate-ui/fade-in-view';


const stack = [
   {
      name: "Next.js 15",
      icon: <Zap className="h-6 w-6 text-primary" />,
      description: "La última versión del framework React con rendimiento y características mejoradas",
   },
   {
      name: "Tailwind CSS",
      icon: <Code className="h-6 w-6 text-blue-500" />,
      description: "Framework CSS utility-first para desarrollo rápido de interfaces",
   },
   {
      name: "Shadcn UI",
      icon: <Layers className="h-6 w-6 text-sky-500" />,
      description: "Componentes bellamente diseñados construidos con Radix UI y Tailwind",
   },
   {
      name: "Better-Auth",
      icon: <Lock className="h-6 w-6 text-primary" />,
      description: "Sistema de autenticación avanzado con características de seguridad integradas",
   },
   {
      name: "Prisma",
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      description: "ORM de nueva generación para Node.js y TypeScript",
   },
   {
      name: "PostgreSQL",
      icon: <Database className="h-6 w-6 text-blue-600" />,
      description: "Sistema de base de datos objeto-relacional potente y de código abierto",
   },
]

export default function TechStackSection() {

   return (
      <section className="pb-20 pt-20 md:pb-32 md:pt-32 container mx-auto">
         <FadeInView className="text-center space-y-4 pb-16 mx-auto max-w-4xl">
            <Badge className='px-4 py-1.5 text-sm font-medium'>Tecnología</Badge>
            <h2 className="mx-auto mt-4 text-3xl font-bold sm:text-5xl tracking-tight">
               Construido con Tecnología Moderna
            </h2>
            <p className="text-xl text-muted-foreground pt-1">
               Desarrollado con las tecnologías más avanzadas y confiables de la industria
            </p>
         </FadeInView>

         <Card className="grid divide-x divide-y overflow-hidden rounded-3xl border border-card sm:grid-cols-2 lg:grid-cols-3 lg:divide-y-0">
            {stack.map((item, index) => (
               <FadeInView
                  key={index}
                  delay={0.1 * (index + 2)}
                  className="group relative transition-shadow duration-300 hover:z-[1] hover:shadow-2xl hover:shadow-primary"
               >
                  <div className="relative space-y-8 py-12 p-8">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {item.icon}
                     </div>
                     <div className="space-y-2">
                        <h5 className="text-xl text-muted-foreground font-semibold transition group-hover:text-primary">
                           {item.name}
                        </h5>
                        <p className="text-muted-foreground">
                           {item.description}
                        </p>
                     </div>
                  </div>
               </FadeInView>
            ))}
         </Card>
      </section>
   )
}
