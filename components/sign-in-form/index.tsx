"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { redirect, useRouter } from "next/navigation";
import { signInWithEmailAndPasswordWrapper } from "@/firebase/auth";
import { useLayoutEffect, useState } from "react";
import { useUserSession } from "@/auth/user";
import { User } from "firebase/auth";

const SignInFormSchema = z.object({
  email: z.string().min(2, {
    message: "email must be provided.",
  }),
  password: z.string().min(2, {
    message: "must provide password.",
  }),
});

interface initialValProps {}

export function SignInForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const user = useUserSession(null);
  const [canRedirect, setCanRedirect] = useState(false);
  const {
    setError,
    formState: { errors },
  } = form;

  useLayoutEffect(() => {
    let t: any;
    if (!user && canRedirect) {
      redirect("/");
    }
    t = setTimeout(() => {
      setCanRedirect(true);
    }, 1000);
    return () => t;
  }, [user]);

  async function onSubmit(data: z.infer<typeof SignInFormSchema>) {
    const [error, user] = await signInWithEmailAndPasswordWrapper(
      data.email,
      data.password
    );
    toast({
      title: error ? "Failed to Sign In User" : "User Signed In Successfully",
    });
    setTimeout(() => router.push("/"), 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
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
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
