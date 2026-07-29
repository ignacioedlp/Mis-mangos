import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col gap-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-serif font-bold text-foreground">Mis Mangos</span>
          {" · "}Finanzas personales
        </p>
        <div className="flex items-center gap-5">
          <Link href="/sign-in" className="hover:text-foreground">Ingresar</Link>
          <Link href="/sign-up" className="hover:text-foreground">Crear cuenta</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
