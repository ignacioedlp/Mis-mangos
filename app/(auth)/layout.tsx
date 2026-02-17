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
      <main className="relative min-h-screen grain-overlay">
         {/* Background decoration */}
         <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-accent/30 blur-[100px]" />
         </div>
         <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
            {children}
         </div>
      </main>
   );
}
