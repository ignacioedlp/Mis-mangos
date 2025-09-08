import { BarChart3, Bell, CreditCard, PieChart, Shield, Smartphone, Target, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import FadeInView from './animate-ui/fade-in-view';

const features = [
   {
      name: "Gestión de Gastos",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      description: "Registra y categoriza tus gastos de manera fácil e intuitiva",
   },
   {
      name: "Control de Presupuesto",
      icon: <Target className="h-6 w-6 text-green-500" />,
      description: "Establece presupuestos por categoría y mantente dentro de tus límites",
   },
   {
      name: "Reportes Inteligentes",
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      description: "Visualiza tus patrones de gasto con gráficos y reportes detallados",
   },
   {
      name: "Notificaciones",
      icon: <Bell className="h-6 w-6 text-yellow-500" />,
      description: "Recibe alertas cuando te acerques a los límites de tu presupuesto",
   },
   {
      name: "Análisis de Tendencias",
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      description: "Identifica patrones en tus gastos y mejora tus hábitos financieros",
   },
   {
      name: "Seguridad Avanzada",
      icon: <Shield className="h-6 w-6 text-red-500" />,
      description: "Tus datos financieros están protegidos con autenticación segura",
   },
   {
      name: "Interfaz Intuitiva",
      icon: <Smartphone className="h-6 w-6 text-indigo-500" />,
      description: "Diseño moderno y responsivo que funciona en todos tus dispositivos",
   },
   {
      name: "Comparaciones",
      icon: <PieChart className="h-6 w-6 text-pink-500" />,
      description: "Compara tus gastos entre diferentes períodos y categorías",
   },
]

export default function FeaturesSection() {
   return (
      <section className="pb-20 pt-20 md:pb-32 md:pt-32 container mx-auto">
         <FadeInView className="text-center space-y-4 pb-16 mx-auto max-w-4xl">
            <Badge className='px-4 py-1.5 text-sm font-medium'>Características</Badge>
            <h2 className="mx-auto mt-4 text-3xl font-bold sm:text-5xl tracking-tight">
               Todo lo que necesitas para controlar tus finanzas
            </h2>
            <p className="text-xl text-muted-foreground pt-1">
               Herramientas poderosas y fáciles de usar para gestionar tu dinero de manera inteligente
            </p>
         </FadeInView>

         <Card className="grid divide-x divide-y overflow-hidden rounded-3xl border border-card sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0">
            {features.map((feature, index) => (
               <FadeInView
                  key={index}
                  delay={0.1 * (index + 2)}
                  className="group relative transition-shadow duration-300 hover:z-[1] hover:shadow-2xl hover:shadow-primary"
               >
                  <div className="relative space-y-8 py-12 p-8">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {feature.icon}
                     </div>
                     <div className="space-y-2">
                        <h5 className="text-xl text-muted-foreground font-semibold transition group-hover:text-primary">
                           {feature.name}
                        </h5>
                        <p className="text-muted-foreground text-sm">
                           {feature.description}
                        </p>
                     </div>
                  </div>
               </FadeInView>
            ))}
         </Card>
      </section>
   )
}
