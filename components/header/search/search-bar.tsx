"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction, useMemo, useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Resident } from "@/types/resident";

const ResidentSchema = z.object({
  name: z.string(),
});

export function SearchBar({
  residents,
  setMatchingResidents,
  setOpen,
}: {
  residents: Resident[];
  setMatchingResidents: Dispatch<SetStateAction<Resident[] | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm<Resident>({
    resolver: zodResolver(ResidentSchema),
    defaultValues: {
      name: "",
      unit_number: "",
      address: "",
    },
  });

  let isSmallScreen = true;
  if (typeof self !== "undefined") isSmallScreen = self.innerWidth < 1024;

  const nameOnFocus = () => {
    setOpen(true);
    if (isSmallScreen && nameRef && nameRef.current)
      nameRef.current.classList.add("transform", "-translate-y-{10000}");
    setTimeout(() => {
      if (isSmallScreen && nameRef && nameRef.current) {
        nameRef.current.classList.remove("transform", "-translate-y-{10000}");
      }
    }, 50);
    setTimeout(() => {
      if (isSmallScreen && nameRef && nameRef.current) {
        nameRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 500);
  };

  const nameRef = useRef<HTMLInputElement | null>(null);

  const { watch } = form;

  // for medium data
  useMemo(
    () => Send(watch),
    [watch("name"), watch("address"), watch("unit_number")]
  );

  async function Send(watch: UseFormWatch<Resident>) {
    let matchingResidents: Resident[] = [];
    if (watch("name") || watch("address") || watch("unit_number")) {
      matchingResidents = residents.filter(
        (resident) =>
          resident.address
            .toLowerCase() // Ignore case
            .replaceAll(/[^a-zA-Z0-9]/g, "") // Ignore non-alnum chars
            .slice(0, 25)
            .includes(
              watch("address")
                .toLowerCase()
                .replaceAll(/[^a-zA-Z0-9]/g, "")
            ) &&
          resident.unit_number.startsWith(watch("unit_number")) &&
          resident.name.toLowerCase().startsWith(watch("name").toLowerCase())
      );
      setMatchingResidents(matchingResidents);
    }
  }

  return (
    <Form {...form}>
      <form className="w-full overflow-x-scroll flex flex-col">
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
                    onFocus={nameOnFocus}
                    {...field}
                    ref={nameRef}
                    type="text"
                    className="p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </FormControl>
              </FormItem>
            </div>
          )}
        />
      </form>
    </Form>
  );
}
