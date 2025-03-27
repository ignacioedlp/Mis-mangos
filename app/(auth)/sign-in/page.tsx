import SignInForm from "@/components/sign-in-form"
import { Lock } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="flex w-full max-w-sm flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 self-center font-medium">
               <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Lock className="size-4" />
               </div>
               AuthSystem
            </Link>
            <SignInForm />
         </div>
      </div>
   )
}
