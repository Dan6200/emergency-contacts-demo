"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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

const AuthFormSchema = z.object({
  email: z.string().min(2, {
    message: "email must be provided.",
  }),
  password: z.string().min(2, {
    message: "must provide password.",
  }),
});

type Authenticate = (data: {
  email: string;
  password: string;
}) => Promise<{ success: string | boolean } | { error: string }>;

interface AuthForm {
  signIn?: Authenticate;
  signUp?: Authenticate;
}

export function AuthForm({ signIn, signUp }: AuthForm) {
  const router = useRouter();
  const form = useForm<z.infer<typeof AuthFormSchema>>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [user] = useUserSession(null);

  useLayoutEffect(() => {
    if (user) {
      redirect("/");
    }
  }, [user]);

  async function onSubmit(
    signIn?: Authenticate,
    signUp?: Authenticate,
    data: z.infer<typeof AuthFormSchema>,
  ) {
    if (signIn && signUp)
      throw new Error("Cannot sign up and sign in at the same time");
    if (signIn) {
      const { message, success } = await signIn(data);
      toast({ title: message, variant: success ? "default" : "destructive" });
    }
    if (signUp) {
      const { message, success } = await signUp(data);
      toast({ title: message, variant: success ? "default" : "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit.bind(null, signIn, signUp)}
        className="w-full sm:w-4/5 lg:w-3/4 space-y-6"
      >
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
