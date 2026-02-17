import React from 'react'

export default function Footer() {
   return (
      <footer className="relative border-t border-border/60 overflow-hidden">
         {/* Giant background text */}
         <div className="flex items-center justify-center overflow-hidden py-8 md:py-0">
            <div className="text-[7rem] md:text-[11rem] lg:text-[15rem] font-serif font-extrabold select-none pointer-events-none leading-none bg-gradient-to-b from-primary/15 to-transparent bg-clip-text text-transparent tracking-tighter">
               MANGOS
            </div>
         </div>

         <div className="container flex flex-col items-center justify-center gap-2 pb-8 -mt-4 md:-mt-8">
            <div className="flex items-center gap-2 text-primary">
               <span className="text-xs">◆</span>
               <span className="text-xs">◆</span>
               <span className="text-xs">◆</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
               &copy; {new Date().getFullYear()} Mis Mangos. Todos los derechos reservados.
            </p>
         </div>
      </footer>
   )
}
