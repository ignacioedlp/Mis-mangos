import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-border/60">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
            <WifiOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle className="font-serif text-xl font-bold">Estás sin conexión</CardTitle>
          <CardDescription>
            Parece que perdiste tu conexión a internet. Algunas funciones podrían no funcionar correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-sm text-muted-foreground text-left bg-muted/30 rounded-xl p-4">
            <p className="font-medium text-foreground mb-2">¡No te preocupes! Todavía podés:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Ver datos cargados previamente</li>
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Navegar entre páginas cacheadas</li>
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Agregar gastos (se sincronizan al volver)</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ir al Panel
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tus datos se sincronizarán automáticamente cuando se restablezca tu conexión.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
