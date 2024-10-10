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
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  EmergencyContact,
  Resident,
  ResidentData,
} from "@/types/resident";
import { Minus, Plus } from "lucide-react";
import { isError } from "@/app/utils";
import { mutateResidentData } from "@/app/admin/residents/data-actions";

const ResidentFormSchema = z.object({
  resident_name: z.string().min(2, {
    message: "resident name must be at least 2 characters.",
  }),
  resident_id: z.string().min(2),
  residence_id: z.string().length(6, {
    message: "residence id must be 6 characters. In the form CCXXXX",
  }),
  emergencyContacts: z.array(
    z.object({
      contact_name: z.string().min(2, {
        message: "contact name must be at least 2 characters.",
      }),
      relationship: z.string().min(2),
      cell_phone: z.string().min(9),
      home_phone: z.string().min(9),
      work_phone: z.string().min(9),
    })
  ),
});

export type MutateResidents =
  | ((
      resident: Resident,
      residentId?: string
    ) => Promise<{ result?: string; success: boolean; message: string }>)
  | ((
      resident: Resident
    ) => Promise<{ result: string; success: boolean; message: string }>);

interface ResidentFormProps {
  resident_name: string;
  resident_id?: string;
  residence_id: string;
  emergencyContacts: {
    contact_name: string;
    cell_phone: string;
    home_phone: string;
    work_phone: string;
    relationship: string;
  }[];
}

export function ResidentForm({
  resident_name,
  resident_id,
  residence_id,
  emergencyContacts,
}: ResidentFormProps) {
  const router = useRouter();
  const [noOfEmContacts, setNoOfEmContacts] = useState(
    emergencyContacts?.length ?? 1
  );
  const form = useForm<z.infer<typeof ResidentFormSchema>>({
    resolver: zodResolver(ResidentFormSchema),
    defaultValues: {
      resident_id,
      resident_name,
      residence_id,
      emergencyContacts,
    },
  });

  async function onSubmit(data: z.infer<typeof ResidentFormSchema>) {
    try {
      if (resident_id) {
        // Edit Resident Information
        let newData = data;
        if (emergencyContacts) {
          emergencyContacts.length = noOfEmContacts;
          newData = { ...data, emergencyContacts };
        }
        const { message, success } = await mutateResidentData(
          newData,
          resident_id
        );
        toast({
          title: message,
          variant: success ? "default" : "destructive",
        });
        router.back();
      } else {
        // Add new residents
        const { message, success } = await mutateResidentData(data);
        if (!success) {
          toast({
            title: success ? "Unable to Add New Resident" : message,
            variant: "destructive",
          });
          return;
        }
        toast({ title: message });
      }
    } catch (err) {
      if (isError(err)) toast({ title: err.message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <h1 className="font-semibold mb-8 text-2xl ">
        {!resident_id ? "Add A New Resident" : "Edit Resident Information"}
      </h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:w-4/5 lg:w-3/4 space-y-6"
      >
        <FormField
          control={form.control}
          name="resident_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Residents Name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="residence_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residence ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Resident's room ID. Usually in the format CCXXXX
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end border-b w-full">
          <h4 className="gap-2 flex pb-4">
            {(noOfEmContacts < 2 ? "Add " : "") + "Emergency Contacts"}
            <span
              onClick={() =>
                setNoOfEmContacts(
                  noOfEmContacts < 5 ? noOfEmContacts + 1 : noOfEmContacts
                )
              }
            >
              <Plus />
            </span>
            {noOfEmContacts > 1 && (
              <span
                onClick={() =>
                  setNoOfEmContacts(
                    noOfEmContacts > 1 ? noOfEmContacts - 1 : noOfEmContacts
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
            <h3 className="font-semibold mb-8">
              Emergency Contact {i > 0 ? i + 1 : ""}
            </h3>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name={`emergencyContacts.${i}.contact_name`}
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
                name={`emergencyContacts.${i}.relationship`}
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
                name={`emergencyContacts.${i}.cell_phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cell Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency Contact's Cell Phone Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${i}.home_phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency Contact's Home Phone Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${i}.work_phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency Contact's Work Phone Number
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
