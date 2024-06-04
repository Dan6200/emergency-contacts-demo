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
import { useAtom, useSetAtom } from "jotai";
import emergencyAtom from "@/data/emergency-atom";
import { useRouter } from "next/navigation";

const EmergencyContactFormSchema = z.object({
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
  relationship: z.string(),
});

export function EmergencyContactForm({ id }: { id: string }) {
  const [emergencyContacts, setEmergencyContacts] = useAtom(emergencyAtom);
  const router = useRouter();
  const form = useForm<z.infer<typeof EmergencyContactFormSchema>>({
    resolver: zodResolver(EmergencyContactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      relationship: "",
    },
  });

  function onSubmit(data: z.infer<typeof EmergencyContactFormSchema>) {
    if (emergencyContacts === null)
      setEmergencyContacts(new Map([[id, [data]]]));
    else if (emergencyContacts.has(id))
      setEmergencyContacts(
        emergencyContacts?.set(id, [...emergencyContacts.get(id)!, data])
      );
    toast({
      title: "Emergency Contact Added Successfully",
    });
    setTimeout(() => router.push(`/residents/${id}`), 1000);
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
              <FormDescription>Emergency contacts first name.</FormDescription>
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
              <FormDescription>Emergency contacts last name.</FormDescription>
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
              <FormDescription>
                Emergency contact's phone number
              </FormDescription>
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
              <FormDescription>Emergency contact's address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Relationship to Patient</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
