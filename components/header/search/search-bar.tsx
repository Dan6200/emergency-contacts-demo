"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Resident } from "@/types/resident";

const SearchValueSchema = z.object({
  searchValue: z.string(),
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
  const form = useForm<z.infer<typeof SearchValueSchema>>({
    resolver: zodResolver(SearchValueSchema),
    defaultValues: {
      searchValue: "",
    },
  });

  const nameRef = useRef<HTMLInputElement | null>(null);

  const { watch } = form;

  // Run effect when searchValue changes
  useEffect(() => {
    const searchValue = watch("searchValue");
    Send(searchValue);
  }, [watch("searchValue")]); // useEffect instead of useMemo

  async function Send(searchValue: string) {
    let matchingResidents: Resident[] = [];
    if (searchValue) {
      matchingResidents = residents.filter(
        (resident) =>
          resident.address
            .toLowerCase() // Ignore case
            .replaceAll(/[^a-zA-Z0-9]/g, "") // Ignore non-alnum chars
            .slice(0, 25)
            .includes(
              searchValue.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, "")
            ) ||
          resident.unit_number
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          resident.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Update matchingResidents state
    setMatchingResidents(matchingResidents);
  }

  return (
    <Form {...form}>
      <form className="w-full mx-auto overflow-x-scroll flex flex-col">
        <FormField
          control={form.control}
          name="searchValue"
          render={({ field }) => (
            <div className="w-full flex items-center gap-2">
              <FormItem
                tabIndex={5}
                className="ring-offset-background border-2 border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-full gap-2 place-self-center"
              >
                <FormControl>
                  <Input
                    onFocus={() => setOpen(true)}
                    {...field}
                    ref={nameRef}
                    type="text"
                    className="p-2 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
