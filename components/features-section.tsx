import { BarChart3, Bell, CreditCard, PieChart, Shield, Smartphone, Target, TrendingUp } from 'lucide-react'
import React from 'react'
import FadeInView from './animate-ui/fade-in-view';

const features = [
   {
      name: "Gestión de Gastos",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Registra y categoriza tus gastos de manera fácil e intuitiva",
      accent: "from-amber-500/20 to-orange-500/20",
   },
   {
      name: "Control de Presupuesto",
      icon: <Target className="h-5 w-5" />,
      description: "Establecé presupuestos por categoría y mantenete dentro de tus límites",
      accent: "from-emerald-500/20 to-teal-500/20",
   },
   {
      name: "Reportes Inteligentes",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Visualizá tus patrones de gasto con gráficos y reportes detallados",
      accent: "from-blue-500/20 to-indigo-500/20",
   },
   {
      name: "Notificaciones",
      icon: <Bell className="h-5 w-5" />,
      description: "Recibí alertas cuando te acerques a los límites de tu presupuesto",
      accent: "from-rose-500/20 to-pink-500/20",
   },
   {
      name: "Análisis de Tendencias",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Identificá patrones en tus gastos y mejorá tus hábitos financieros",
      accent: "from-violet-500/20 to-purple-500/20",
   },
   {
      name: "Seguridad Avanzada",
      icon: <Shield className="h-5 w-5" />,
      description: "Tus datos financieros están protegidos con autenticación segura",
      accent: "from-red-500/20 to-orange-500/20",
   },
   {
      name: "Interfaz Intuitiva",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Diseño moderno y responsivo que funciona en todos tus dispositivos",
      accent: "from-cyan-500/20 to-blue-500/20",
   },
   {
      name: "Comparaciones",
      icon: <PieChart className="h-5 w-5" />,
      description: "Compará tus gastos entre diferentes períodos y categorías",
      accent: "from-yellow-500/20 to-amber-500/20",
   },
]

export default function FeaturesSection() {
   return (
      <section className="relative py-24 md:py-36">
         {/* Background accent */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />

         <div className="container mx-auto relative">
            <FadeInView className="space-y-3 pb-16 max-w-2xl">
               <span className="text-sm font-semibold uppercase tracking-widest text-primary">Características</span>
               <h2 className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Todo lo que necesitás para{" "}
                  <span className="text-primary">controlar tus finanzas</span>
               </h2>
               <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                  Herramientas poderosas y fáciles de usar para gestionar tu dinero de manera inteligente.
               </p>
            </FadeInView>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
               {features.map((feature, index) => (
                  <FadeInView
                     key={index}
                     delay={0.06 * (index + 1)}
                  >
                     <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-foreground mb-5`}>
                           {feature.icon}
                        </div>
                        <h3 className="font-serif text-base font-bold mb-2 group-hover:text-primary transition-colors">
                           {feature.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                           {feature.description}
                        </p>
                     </div>
                  </FadeInView>
               ))}
            </div>
         </div>
      </section>
   )
}
