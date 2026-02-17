"use client"

import { signInWithGoogle } from "@/actions/google-auth-action"
import Logo from "@/components/logo"
import SignInForm from "@/components/sign-in-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { JSX, SVGProps } from "react"

const GoogleIcon = (
   props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => (
   <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
   </svg>
);

export default function SignInSection() {
   return (
      <div className="w-full max-w-md mx-auto">
         <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
               <Logo />
               <span className="font-serif text-lg font-bold tracking-tight">Mis Mangos</span>
            </div>

            <h1 className="font-serif text-2xl font-extrabold tracking-tight">
               Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
               ¿No tenés cuenta?{" "}
               <Link
                  href="/sign-up"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
               >
                  Registrate
               </Link>
            </p>

            <div className="mt-7">
               <Button
                  variant="outline"
                  className="w-full h-11 font-medium border-border/60 hover:bg-accent/50 transition-all"
                  onClick={signInWithGoogle}
               >
                  <GoogleIcon className="size-4 mr-2" aria-hidden={true} />
                  Continuar con Google
               </Button>
            </div>

            <div className="py-6">
               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-border/60"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                     <span className="bg-card px-3 text-muted-foreground font-medium">
                        o con tu correo
                     </span>
                  </div>
               </div>
            </div>

            <SignInForm />
         </div>

         <p className="pt-6 text-center text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Al continuar, aceptás nuestros{" "}
            <Link href="#" className="text-foreground hover:text-primary transition-colors underline underline-offset-4">
               Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="#" className="text-foreground hover:text-primary transition-colors underline underline-offset-4">
               Política de Privacidad
            </Link>
         </p>
      </div>
   )
}
