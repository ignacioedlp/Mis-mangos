import React from 'react'

export default function FeaturesSection() {
   return (
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
         <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Key Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
               Everything you need to implement authentication in your Next.js application
            </p>
         </div>
         <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">Secure Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                     Industry-standard security practices for user authentication and data protection.
                  </p>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">Modern UI Components</h3>
                  <p className="text-sm text-muted-foreground">
                     Beautiful, accessible UI components built with ShadCN and Tailwind CSS.
                  </p>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">Protected Routes</h3>
                  <p className="text-sm text-muted-foreground">
                     Easily protect routes and content that require authentication.
                  </p>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                     Complete user registration, login, and profile management.
                  </p>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">Responsive Design</h3>
                  <p className="text-sm text-muted-foreground">
                     Works seamlessly on desktop, tablet, and mobile devices.
                  </p>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
               <div className="space-y-2">
                  <h3 className="font-bold">Next.js 15 Ready</h3>
                  <p className="text-sm text-muted-foreground">
                     Built with the latest Next.js features and best practices.
                  </p>
               </div>
            </div>
         </div>
      </section>
   )
}
