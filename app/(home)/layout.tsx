import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function HomeLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <main>
         <Navbar />
         <div>
            {children}
         </div>
         <Footer />
      </main>
   );
}
