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
import { isTypeResident, Resident } from "@/types/resident";
import { collectionWrapper, getDocsWrapper } from "@/firebase/firestore";
import db from "@/firebase/config";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";

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

  const [showRm, setShowRm] = useState(false);
  const [showAddr, setShowAddr] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/residents");
      if (!res.ok) {
        toast({ title: "Failed To Fetch Resident Information" });
      }
      const data = await res.json();
      setSearchData(data);
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
            .slice(0, 25)
            .includes(
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

  return (
    <Form {...form}>
      <form className="w-full p-4 overflow-x-scroll gap-6 flex flex-col border-2 rounded-md">
        <span>
          <h3 className="text-base capitalize">
            Enter To Search for resident.
          </h3>
          <p className="text-sm capitalize">can add more search fields</p>
        </span>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <FormItem
                tabIndex={5}
                className="ring-offset-background border-2 border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-[90%] gap-2 place-self-center"
              >
                <FormLabel className="text-sm bg-primary w-16 text-primary-foreground rounded-l-sm flex h-10 border-l border-y border-primary p-2">
                  Name:
                </FormLabel>
                <FormControl>
                  <Input
                    onFocus={() => setOpen(true)}
                    {...field}
                    type="text"
                    className="p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </FormControl>
              </FormItem>
              {(!showAddr || !showRm) && (
                <span
                  onClick={() =>
                    !showAddr ? setShowAddr(true) : setShowRm(true)
                  }
                  className=""
                >
                  <Plus />
                </span>
              )}
            </div>
          )}
        />
        {showAddr && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <FormItem
                  tabIndex={5}
                  className="ring-offset-background border-2 border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-[90%] gap-2 place-self-center"
                >
                  <FormLabel className="text-sm bg-primary w-18 text-primary-foreground rounded-l-sm flex h-10 border-l border-y border-primary p-2">
                    Address:
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
                <span onClick={() => setShowAddr(false)} className="">
                  <Minus />
                </span>
              </div>
            )}
          />
        )}
        {showRm && (
          <FormField
            control={form.control}
            name="unit_number"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <FormItem
                  tabIndex={5}
                  className="ring-offset-background border-2 border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-[90%] gap-2 place-self-center"
                >
                  <FormLabel className="text-sm bg-primary w-16 text-primary-foreground rounded-l-sm flex h-10 border-l border-y border-primary p-2">
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
                <span onClick={() => setShowRm(false)} className="">
                  <Minus />
                </span>
              </div>
            )}
          />
        )}
      </form>
    </Form>
  );
}
