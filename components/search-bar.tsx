"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { FocusEvent } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Resident } from "@/types/resident";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Minus, Plus } from "lucide-react";

const ResidentSchema = z.object({
  name: z.string(),
  unit_number: z.string(),
  address: z.string(),
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

  const addressOnFocus = (e: FocusEvent<HTMLDivElement, Element>) => {
    e.preventDefault();
    setOpen(true);
    if (isSmallScreen && addressRef && addressRef.current)
      addressRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const unitNumOnFocus = (e: FocusEvent<HTMLDivElement, Element>) => {
    e.preventDefault();
    setOpen(true);
    if (isSmallScreen && unitNumRef && unitNumRef.current)
      unitNumRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const nameOnFocus = () => {
    setOpen(true);
    if (isSmallScreen && nameRef && nameRef.current)
      nameRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const nameRef = useRef<HTMLDivElement | null>(null),
    addressRef = useRef<HTMLDivElement | null>(null),
    unitNumRef = useRef<HTMLDivElement | null>(null);

  const { watch, register, setValue } = form;

  const [showRm, setShowRm] = useState(false);
  const [showAddr, setShowAddr] = useState(false);

  useEffect(() => {
    register("name");
    register("address");
    register("unit_number");
  }, []);

  useEffect(() => {
    document.addEventListener("touchstart", (e) => e.preventDefault());
    document.addEventListener("touchmove", (e) => e.preventDefault());
  }, []);

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
            .replaceAll(/[^a-zA-Z0-9]/g, "") // Ignore non-alphanum chars
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
      <form className="w-full p-4 overflow-x-scroll gap-6 flex flex-col border-2 rounded-md">
        <span className="flex flex-col gap-2 md:gap-5">
          <h3 className="text-base capitalize md:text-xl">
            Enter To Search for resident.
          </h3>
          <p className="text-sm text-foreground/50 capitalize">
            can add more search fields
          </p>
        </span>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <div className="flex items-center gap-2">
                <FormItem
                  tabIndex={5}
                  className="ring-offset-background border-2 border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex place-items-center space-y-0 w-[90%] gap-2 place-self-center"
                >
                  <FormLabel className="text-sm bg-primary w-16 text-primary-foreground rounded-l-sm flex h-10 border-l border-y border-primary p-2">
                    Name:
                  </FormLabel>
                  <FormControl>
                    <div
                      onFocus={nameOnFocus}
                      {...field}
                      onInput={(e) =>
                        setValue("name", e.currentTarget.textContent ?? "")
                      }
                      ref={nameRef}
                      contentEditable
                      tabIndex={0}
                      role="text-box"
                      className="text-left scroll-mt-20 p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            );
          }}
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
                    <div
                      {...field}
                      ref={addressRef}
                      onFocus={addressOnFocus}
                      onInput={(e) =>
                        setValue("address", e.currentTarget.textContent ?? "")
                      }
                      contentEditable
                      tabIndex={0}
                      className="text-left scroll-mt-20 p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <div
                      {...field}
                      ref={unitNumRef}
                      onFocus={unitNumOnFocus}
                      onInput={(e) =>
                        setValue(
                          "unit_number",
                          e.currentTarget.textContent ?? ""
                        )
                      }
                      contentEditable
                      tabIndex={0}
                      className="text-left scroll-mt-20 p-0 m-0 block space-y-0 w-full focus-visible:outline-none overscroll-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
