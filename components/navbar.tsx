"use client"

import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import SignOutForm from './sign-out-form'
import Logo from './logo'
import { GithubStars } from './github-stars'
import { useUser } from '@/context/UserContext'
import { ThemeToggle } from './theme-toggle'

export default function Navbar() {
   const user = useUser();
   return (
      <header className="sticky top-0 z-100 flex justify-center py-3 px-4">
         <div className="container border border-border/60 rounded-2xl w-full bg-background/80 backdrop-blur-xl py-3 px-5 shadow-sm">
            <nav className="flex items-center justify-between gap-4 sm:gap-6">
               <div className="flex items-center gap-3">
                  <Logo />
                  <span className="font-serif text-lg font-bold tracking-tight hidden sm:block">Mis Mangos</span>
               </div>
               <div className='flex items-center gap-2'>
                  {user ? (
                     <>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                           <Link href="/dashboard">Panel</Link>
                        </Button>
                        <SignOutForm />
                     </>
                  ) : (
                     <>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                           <Link href="/sign-in">Iniciar Sesión</Link>
                        </Button>
                        <Button asChild size="sm" className="font-semibold shadow-sm shadow-primary/20">
                           <Link href="/sign-up">Registrarse</Link>
                        </Button>
                     </>
                  )}
                  <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
                  <GithubStars />
                  <ThemeToggle />
               </div>
            </nav>
         </div>
      </header>
   )
}
