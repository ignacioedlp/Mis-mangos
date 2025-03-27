"use client"

import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Check, Clock, LogOut, Mail, MapPin, Shield } from "lucide-react"
import { useUser } from "@/context/UserContext"

export default function ProfileCard() {
   const user = useUser();
   return (
      <Card className="overflow-hidden">
         <CardHeader className="relative p-0">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40"></div>
            <div className="absolute -bottom-12 left-4">
               <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background">
                     <AvatarImage src="/placeholder.svg" alt="John Doe" />
                     <AvatarFallback className="text-6xl font-bold">
                        {user?.name.charAt(0)}
                     </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                     <Camera className="h-4 w-4" />
                     <span className="sr-only">Change profile picture</span>
                  </Button>
               </div>
            </div>
         </CardHeader>
         <CardContent className="pt-14">
            <div className="space-y-1">
               <h3 className="font-semibold text-xl">
                  {user?.name}
               </h3>
               <p className="text-sm text-muted-foreground">
                  {user?.email}
               </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
               <Badge variant="outline" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Verified
               </Badge>
               <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Member since 2025
               </Badge>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
               <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                     <p className="text-sm font-medium">Location</p>
                     <p className="text-sm text-muted-foreground">New York, USA</p>
                  </div>
               </div>
               <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                     <p className="text-sm font-medium">Email</p>
                     <p className="text-sm text-muted-foreground">
                        {user?.email}
                     </p>
                  </div>
               </div>
               <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                     <p className="text-sm font-medium">Account Security</p>
                     <p className="text-sm text-muted-foreground">2FA Enabled</p>
                  </div>
               </div>
            </div>
         </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full">
               <LogOut className="mr-2 h-4 w-4" />
               Sign out
            </Button>
         </CardFooter>
      </Card>
   )
}
