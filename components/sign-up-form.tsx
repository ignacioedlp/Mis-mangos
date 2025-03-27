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
import { authClient } from "@/lib/auth-client"
import { formSchema } from "@/lib/auth-schema"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"


export default function SignUpForm() {
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
         email: "",
         password: "",
      },
   })

   async function onSubmit(values: z.infer<typeof formSchema>) {
      const { name, email, password } = values;
      const { data, error } = await authClient.signUp.email({
         email,
         password,
         name,
         callbackURL: "/sign-in"
      }, {
         onRequest: (ctx) => {
            toast("Signing up...")
         },
         onSuccess: (ctx) => {
            form.reset()
         },
         onError: (ctx) => {
            toast.error(ctx.error.message);
         },
      });
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
