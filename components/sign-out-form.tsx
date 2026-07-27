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
               toast.loading('Logging out...')
            },
            onSuccess: () => {
               toast.dismiss()
               setUser(null);
               router.push('/');
               toast.success('Logged out successfully')
            },
            onError: (ctx) => {
               toast.dismiss()
               toast.error(ctx.error.message)
            },
         },
      })
   }
   return (
      <Button variant={"destructive"} onClick={handleLogout} className="w-full justify-start">
         <LogOut className="h-4 w-4" />
         Cerrar sesion
      </Button>
   )
}
