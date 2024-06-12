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
import { useUserSession } from "@/auth/user";
import { useLayoutEffect, useState } from "react";
import { collectionWrapper } from "@/firebase/firestore";
import db from "@/firebase/config";

const ResidentFormSchema = z.object({
  name: z.string().min(2, {
    message: "first name must be at least 2 characters.",
  }),
  unit_number: z.string(),
  address: z.string().min(5, {
    message: "home address must be at least 5 characters.",
  }),
});

interface initialValProps {
  address: string;
  name: string;
  unit_number: string;
}

export function ResidentForm({ address, name, unit_number }: initialValProps) {
  const router = useRouter();
  const [user, userLoaded] = useUserSession(null);
  const form = useForm<z.infer<typeof ResidentFormSchema>>({
    resolver: zodResolver(ResidentFormSchema),
    defaultValues: {
      address,
      name,
      unit_number,
    },
  });

  useLayoutEffect(() => {
    if (userLoaded && !user) {
      redirect("/");
    }
  }, [user, userLoaded]);

  function onSubmit(data: z.infer<typeof ResidentFormSchema>) {
    toast({
      title: "Successfully Added New Resident",
    });
    const [colError, colRef] = collectionWrapper(db, "residents");
    router.push(
      `/admin/residents/print-qr/${encodeURIComponent(
        "https://www.google.com"
      )}`
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Residents first name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Resident's room number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Resident's address</FormDescription>
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
