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
import peopleAtom from "@/data/people-atom";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";

const ResidentFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "first name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "last name must be at least 2 characters.",
  }),
  phone: z.string().min(7, {
    message: "phone number must be at least 7 digits.",
  }),
  address: z.string().min(5, {
    message: "home address must be at least 5 characters.",
  }),
});

interface initialValProps {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export function ResidentForm({
  firstName,
  lastName,
  phone,
  address,
}: initialValProps) {
  const [people, setPeople] = useAtom(peopleAtom);
  const router = useRouter();
  const form = useForm<z.infer<typeof ResidentFormSchema>>({
    resolver: zodResolver(ResidentFormSchema),
    defaultValues: {
      firstName,
      lastName,
      phone,
      address,
    },
  });

  function onSubmit(data: z.infer<typeof ResidentFormSchema>) {
    setPeople([...people, data]);
    toast({
      title: "New Resident Added Successfully",
    });
    setTimeout(() => router.push("/residents"), 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Residents last name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Resident's phone number</FormDescription>
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
