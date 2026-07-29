"use client"

import { useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { useSetUser } from '@/context/UserContext'

export default function SignOutForm() {
   const router = useRouter()
   const setUser = useSetUser();
   const handleLogout = async () => {
      await authClient.signOut({
         fetchOptions: {
            onRequest: () => {
               toast.loading('Cerrando sesión...')
            },
            onSuccess: () => {
               toast.dismiss()
               setUser(null);
               router.push('/');
               toast.success('Sesión cerrada')
            },
            onError: (ctx) => {
               toast.dismiss()
               toast.error(ctx.error.message)
            },
         },
      })
   }
   return (
      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-destructive">
         <LogOut className="h-4 w-4" />
         Cerrar sesión
      </Button>
   )
}
