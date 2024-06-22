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
import { useLayoutEffect } from "react";
import { useAtom } from "jotai";
import userAtom from "@/atoms/user";

const SignInFormSchema = z.object({
  email: z.string().min(2, {
    message: "email must be provided.",
  }),
  password: z.string().min(2, {
    message: "must provide password.",
  }),
});

type Authenticate = (data: { email: string; password: string }) => Promise<{
  result?: string;
  success: boolean;
  message: string;
}>;

interface SignInForm {
  signIn: Authenticate;
}

export function SignInForm({ signIn }: SignInForm) {
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [admin, setAdmin] = useAtom(userAtom);

  useLayoutEffect(() => {
    if (admin) {
      redirect("/");
    }
  }, [admin]);

  async function onSubmit(
    sign_in: Authenticate,
    data: z.infer<typeof SignInFormSchema>
  ) {
    const { result, message, success } = await sign_in(data);
    if (result) setAdmin(JSON.parse(result));
    toast({ title: message, variant: success ? "default" : "destructive" });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit.bind(null, signIn))}
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
