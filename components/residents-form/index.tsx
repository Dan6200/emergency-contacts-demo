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
import type {
  EmergencyContact,
  Resident,
  ResidentData,
} from "@/types/resident";
import { isError } from "util";
import { Minus, Plus } from "lucide-react";
import { useAtomValue } from "jotai";
import userAtom from "@/atoms/user";

const ResidentFormSchema = z.object({
  name: z.string().min(2, {
    message: "first name must be at least 2 characters.",
  }),
  unit_number: z.string(),
  address: z.string().min(5, {
    message: "home address must be at least 5 characters.",
  }),
  emergency_contacts: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
      phone_number: z.string(),
    })
  ),
});

export type MutateResidents =
  | ((
      resident: ResidentData,
      residentId?: string
    ) => Promise<{ result?: string; success: boolean; message: string }>)
  | ((
      resident: ResidentData
    ) => Promise<{ result: string; success: boolean; message: string }>);

interface ResidentFormProps {
  address: string;
  name: string;
  unit_number: string;
  mutateResidents: MutateResidents;
  residentId?: string;
  emergency_contacts?: EmergencyContact[];
  emergency_contact_id?: string[];
}

export function ResidentForm({
  address,
  name,
  unit_number,
  emergency_contacts,
  emergency_contact_id,
  mutateResidents,
  residentId,
}: ResidentFormProps) {
  const router = useRouter();
  const admin = useAtomValue(userAtom);
  const [noOfEmContacts, setNoOfEmContacts] = useState(
    emergency_contacts?.length ?? 0
  );
  const form = useForm<z.infer<typeof ResidentFormSchema>>({
    resolver: zodResolver(ResidentFormSchema),
    defaultValues: {
      address,
      name,
      unit_number,
      emergency_contacts,
    },
  });

  useLayoutEffect(() => {
    if (!admin) {
      redirect("/");
    }
  }, [admin]);

  async function onSubmit(
    mutateData: MutateResidents,
    data: z.infer<typeof ResidentFormSchema>
  ) {
    try {
      if (residentId) {
        let newData = data;
        if (emergency_contact_id) {
          emergency_contact_id.length = noOfEmContacts;
          newData = { ...data, emergency_contact_id } as ResidentData & {
            emergency_contacts: EmergencyContact[];
            emergency_contact_id: string;
          };
        }
        const { message, success } = await mutateData(newData, residentId);
        toast({
          title: message,
          variant: success ? "default" : "destructive",
        });
        router.back();
      } else {
        const { result: url, message, success } = await mutateData(data);
        if (!url || !success) {
          toast({
            title: success ? "Unable to Add New Resident" : message,
            variant: "destructive",
          });
          return;
        }
        toast({ title: message });
        router.push(
          `/admin/residents/print-qr/${encodeURIComponent(url.toString())}`
        );
      }
    } catch (err) {
      if (isError(err)) toast({ title: err.message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <h1 className="font-semibold mb-8 text-2xl ">
        {!residentId ? "Add A New Resident" : "Edit Resident Information"}
      </h1>
      <form
        onSubmit={form.handleSubmit(onSubmit.bind(null, mutateResidents))}
        className="w-full sm:w-4/5 lg:w-3/4 space-y-6"
      >
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
        <div className="flex justify-end border-b w-full">
          <h4 className="gap-2 flex pb-4">
            {(noOfEmContacts < 1 ? "Add " : "") + "Emergency Contacts"}
            <span
              onClick={() =>
                setNoOfEmContacts(
                  noOfEmContacts < 5 ? noOfEmContacts + 1 : noOfEmContacts
                )
              }
            >
              <Plus />
            </span>
            {noOfEmContacts > 0 && (
              <span
                onClick={() =>
                  setNoOfEmContacts(
                    noOfEmContacts > 0 ? noOfEmContacts - 1 : noOfEmContacts
                  )
                }
              >
                <Minus />
              </span>
            )}
          </h4>
        </div>
        {new Array(noOfEmContacts).fill(null).map((_, i) => (
          <div key={i} className="mb-8 border-b py-4">
            <h3 className="font-semibold mb-8">Emergency Contact {i + 1}</h3>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name={`emergency_contacts.${i}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Emergency Contact's Name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergency_contacts.${i}.relationship`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency Contact's Relationship
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergency_contacts.${i}.phone_number`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency Contact's Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
