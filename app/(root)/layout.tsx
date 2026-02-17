import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProvider } from "@/context/UserContext";

export default async function HomeLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   const session = await auth.api.getSession({
      headers: await headers()
   });
   const user = session?.user ?? null;
   return (
      <UserProvider user={user}>
         <div className="relative grain-overlay">
            {/* Warm gradient mesh background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
               <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
               <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-accent/30 blur-[100px]" />
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[80px]" />
            </div>
            <Navbar />
            <main>
               {children}
            </main>
            <Footer />
         </div>
      </UserProvider>
   );
}
