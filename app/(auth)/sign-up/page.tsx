import SignUpForm from '@/components/sign-up-form'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export default function SignUp() {
   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="w-full max-w-sm space-y-6">
            <Link href="/" className="flex items-center justify-center gap-2">
               <Lock className="h-10 w-10" />
               <span className='font-bold text-primary text-2xl'>AuthSystem</span>
            </Link>
            <SignUpForm />
         </div>
      </div>
   )
}
