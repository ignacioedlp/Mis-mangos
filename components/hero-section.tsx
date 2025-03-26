import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
   return (
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
         <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
               Secure Authentication for Your Next.js Applications
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
               A complete authentication system with login, registration, and protected routes built with Next.js 15,
               Tailwind CSS, and ShadCN UI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <Button asChild size="lg">
                  <Link href="/sign-up">
                     Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
               </Button>
               <Button variant="outline" size="lg" asChild>
                  <Link href="/sign-in">Login to Your Account</Link>
               </Button>
            </div>
         </div>
      </section>
   )
}
