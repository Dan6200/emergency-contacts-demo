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
import type { Resident } from "@/types/resident";
import { collectionWrapper, getDocsWrapper } from "@/firebase/firestore";
import db from "@/firebase/config";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

const ResidentSchema = z.object({
  name: z.string(),
  unit_number: z.string(),
  address: z.string(),
});

export function SearchBar({
  setResidents,
  setOpen,
}: {
  setResidents: Dispatch<SetStateAction<Resident[] | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [searchData, setSearchData] = useState<Resident[] | []>([]);
  const [debounced, setDebounced] = useState(false);
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

  useEffect(() => {
    (async () => {
      const [resErr, resRef] = collectionWrapper(db, "residents");
      if (resRef === null) {
        toast({ title: "could not access database" });
        console.log(resErr);
      } else {
        const q = query(resRef);
        const [err, residents] = await getDocsWrapper(q);
        console.log(err);
        if (residents === null) {
          toast({ title: "Could not fetch data" });
        } else
          setSearchData(
            residents.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as any),
            }))
          );
      }
    })();
  }, []);
  // for medium data
  useMemo(
    () => Send(watch),
    [watch("name"), watch("address"), watch("unit_number")]
  );

  async function Send(watch: UseFormWatch<Resident>) {
    let residents: Resident[] = [];
    if (watch("name") || watch("address") || watch("unit_number")) {
      residents = searchData.filter(
        (data) =>
          data.address
            .toLowerCase() // Ignore case
            .replaceAll(/[^a-zA-Z0-9]/g, "") // Ignore non-alnum chars
            .startsWith(
              watch("address")
                .toLowerCase()
                .replaceAll(/[^a-zA-Z0-9]/g, "")
            ) &&
          data.unit_number.startsWith(watch("unit_number")) &&
          data.name.toLowerCase().startsWith(watch("name").toLowerCase())
      );
      setResidents(residents);
    }
  }

  /* for very large data
		*
  SendRealTime(watch);
  async function SendRealTime(watch: UseFormWatch<Resident>) {
    const queryList: QueryConstraint[] = [];
    if (watch("name")) queryList.push(where("name", "==", watch("name")));
    if (watch("unit_number"))
      queryList.push(where("unit_number", "==", watch("unit_number")));
    if (watch("address"))
      queryList.push(where("address", "==", watch("address")));
    if (!watch("name") && !watch("address") && !watch("unit_number")) {
      queryList.length = 0;
      setResidents(null);
    }

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
	 *
	 */

  return (
    <Form {...form}>
      <form className="w-full p-4 overflow-x-scroll gap-6 flex flex-col border-2 rounded-md">
        <h3 className="text-lg font-semibold">
          Enter at least one field to search
        </h3>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem
              tabIndex={5}
              className="ring-offset-background border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
            >
              <FormLabel className="text-sm bg-blue-300/50 rounded-sm flex h-10 p-2">
                Address:
              </FormLabel>
              <FormControl>
                <Input
                  onFocus={() => setOpen(true)}
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
              <FormLabel className="text-sm bg-blue-300/50 rounded-sm flex h-10 p-2">
                Room:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onFocus={() => setOpen(true)}
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
          name="name"
          render={({ field }) => (
            <FormItem
              tabIndex={5}
              className="ring-offset-background border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
            >
              <FormLabel className="text-sm bg-blue-300/50 rounded-sm flex h-10 p-2">
                Name:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onFocus={() => setOpen(true)}
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
