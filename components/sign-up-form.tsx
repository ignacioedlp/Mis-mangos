"use client"

import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
   name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(50, { message: 'Name cannot exceed 50 characters' }),

   email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(2)
      .max(50),

   password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password cannot exceed 50 characters" })
})


export default function SignUpForm() {
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
         email: "",
         password: "",
      },
   })

   function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values)
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
               Enter your details below to register an account
            </CardDescription>
         </CardHeader>
         <CardContent>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input placeholder="John Doe" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Email</FormLabel>
                           <FormControl>
                              <Input placeholder="m@example.com" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Password</FormLabel>
                           <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button type="submit" className="w-full">
                     Sign In
                  </Button>
               </form>
            </Form>
         </CardContent>
         <CardFooter className="mx-auto">
            <div className="text-center text-sm">
               Already have an account?{" "}
               <a href="sign-in" className="underline underline-offset-4">
                  Sign In
               </a>
            </div>
         </CardFooter>
      </Card>
   )
}
