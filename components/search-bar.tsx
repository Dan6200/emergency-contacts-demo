"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { QueryConstraint, query, where } from "firebase/firestore";

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
import type { Resident } from "@/components/resident";
import { collectionWrapper, getDocsWrapper } from "@/firebase/firestore";
import db from "@/firebase/config";
import { Dispatch, SetStateAction } from "react";

const ResidentSchema = z.object({
  name: z.string(),
  unit_number: z.string(),
  address: z.string(),
});

export function SearchBar({
  setResidents,
}: {
  setResidents: Dispatch<SetStateAction<Resident[] | null>>;
}) {
  const form = useForm<Resident>({
    resolver: zodResolver(ResidentSchema),
    defaultValues: {
      name: "",
      unit_number: "",
      address: "",
    },
  });
  const {
    setError,
    watch,
    formState: { errors },
  } = form;

  Send(watch);
  async function Send(watch: UseFormWatch<Resident>) {
    console.log(watch("name"));
    console.log(watch("unit_number"));
    console.log(watch("address"));
    const queryList: QueryConstraint[] = [];
    if (watch("name")) queryList.push(where("name", "==", watch("name")));
    if (watch("unit_number"))
      queryList.push(where("unit_number", "==", watch("unit_number")));
    if (watch("address"))
      queryList.push(where("address", "==", watch("address")));
    if (!watch("name") && !watch("address") && !watch("unit_number"))
      queryList.length = 0;
    console.log("query list", queryList);

    const [resErr, resRef] = collectionWrapper(db, "residents");
    let fetchErr = null;
    if (resRef !== null && queryList.length) {
      const q = query(resRef, ...queryList);
      const [err, residents] = await getDocsWrapper(q);
      if (residents === null) fetchErr = err;
      else
        setResidents(
          residents.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        );
    }
    if (resErr || fetchErr)
      toast({
        title: fetchErr ?? resErr ?? "",
      });
  }

  return (
    <Form {...form}>
      <form className="w-full p-4 overflow-x-scroll gap-6 flex flex-col border-2 rounded-md">
        <h3 className="text-lg font-semibold">
          Enter at least one field to search
        </h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem
              tabIndex={5}
              className="ring-offset-background border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
            >
              <FormLabel className="text-sm bg-blue-300 rounded-sm flex h-10 p-2">
                Name:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  className="p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_number"
          render={({ field }) => (
            <FormItem
              tabIndex={5}
              className="ring-offset-background border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
            >
              <FormLabel className="text-sm bg-blue-300 rounded-sm flex h-10 p-2">
                Room:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  className="p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem
              tabIndex={5}
              className="ring-offset-background border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
            >
              <FormLabel className="text-sm bg-blue-300 rounded-sm flex h-10 p-2">
                Address:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  className="p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
