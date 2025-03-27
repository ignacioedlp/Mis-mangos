import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
   return (
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
         <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
               Open Source Authentication Starter
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
               Next.js 15 Authentication <span className="text-primary">Starter Template</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
               A complete, open-source authentication starter with login, registration, and protected routes. Available on GitHub.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <Button asChild size="lg">
                  <Link
                     href="https://github.com/devAaus/better-auth"
                     target="_blank"
                     className="flex items-center gap-2"
                  >
                     <Github className="h-5 w-5" />
                     <span>Get the Code</span>
                  </Link>
               </Button>
               <Button variant="outline" size="lg" asChild>
                  <Link href="/sign-up" className="flex items-center gap-2">
                     <ExternalLink className="h-4 w-4" />
                     <span>Try the Demo</span>
                  </Link>
               </Button>
            </div>
         </div>
      </section>
   )
}
