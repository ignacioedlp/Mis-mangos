import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Lock } from 'lucide-react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignOutForm from './sign-out-form'

export default async function Navbar() {
   const session = await auth.api.getSession({
      headers: await headers()
   })
   return (
      <header className="sticky top-0 z-40 border-b bg-background">
         <div className="container flex h-16 items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
               <Lock className="h-5 w-5" />
               <span className='font-bold text-primary'>AuthSystem</span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6">
               {session ? (
                  <>
                     <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                     >
                        Dashboard
                     </Link>
                     <SignOutForm>
                        <Button variant={"destructive"}>
                           SignOut
                        </Button>
                     </SignOutForm>
                  </>
               ) : (
                  <>
                     <Link
                        href="/sign-in"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                     >
                        Login
                     </Link>
                     <Button asChild>
                        <Link href="/sign-up">Sign up</Link>
                     </Button>
                  </>
               )}
            </nav>
         </div>
      </header>
   )
}
