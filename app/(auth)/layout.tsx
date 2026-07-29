import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AuthLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   const session = await auth.api.getSession({
      headers: await headers()
   })

   if (session) {
      return redirect("/")
   }
   return (
      <main className="min-h-screen bg-background">
         <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
            {children}
         </div>
      </main>
   );
}
