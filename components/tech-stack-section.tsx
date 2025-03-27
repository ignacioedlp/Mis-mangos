import { Code, Database, Layers, Lock, Zap } from 'lucide-react'
import React from 'react'

export default function TechStackSection() {
   return (
      <section className="bg-muted/50 py-16">
         <div className="container space-y-8">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
               <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl">Powered by Modern Technology</h2>
               <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                  Built with the latest and most reliable technologies in the industry
               </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                     <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Next.js 15</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     The latest version of the React framework with improved performance and features
                  </p>
               </div>

               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                     <svg
                        className="h-6 w-6 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           d="M12 6.75V8.25"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M12 15.75V17.25"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M8.25 12H6.75"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M17.25 12H15.75"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M9.34 9.34L8.25 8.25"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M15.66 15.66L14.57 14.57"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M9.34 14.66L8.25 15.75"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                        <path
                           d="M15.66 8.34L14.57 9.43"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                     </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Tailwind CSS</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     Utility-first CSS framework for rapid UI development
                  </p>
               </div>

               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/10">
                     <Layers className="h-6 w-6 text-slate-800" />
                  </div>
                  <h3 className="text-xl font-semibold">ShadCN UI</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     Beautifully designed components built with Radix UI and Tailwind
                  </p>
               </div>

               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                     <Lock className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Better-Auth</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     Advanced authentication library with built-in security features
                  </p>
               </div>

               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                     <Code className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Prisma</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     Next-generation ORM for Node.js and TypeScript
                  </p>
               </div>

               <div className="flex flex-col items-center gap-3 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10">
                     <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">PostgreSQL</h3>
                  <p className="text-center text-sm text-muted-foreground">
                     Powerful, open source object-relational database system
                  </p>
               </div>
            </div>
         </div>
      </section>
   )
}
