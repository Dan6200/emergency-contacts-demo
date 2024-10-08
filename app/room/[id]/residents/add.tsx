"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { Resident } from "@/types/resident";
import { useRouter } from "next/navigation";

export default function AddResident({
  addResidentData,
}: {
  addResidentData: (newResident: Resident) => Promise<
    | {
        success: boolean;
        message?: undefined;
      }
    | {
        success: boolean;
        message: string;
      }
  >;
}) {
  const handleAdd = (formData: FormData) => {
    console.log(formData.entries());
    //addResidentData()
    //  .catch((err) => {
    //    console.error(err);
    //    toast({ title: "Unable to Add Resident", variant: "destructive" });
    //  })
    //  .then((_) => toast({ title: "Successfully Addd Resident" }));
  };
  return (
    <form
      action={handleAdd}
      className="md:w-full grow shrink basis-0 text-white"
    >
      <input type="text" hidden />
      <Button variant="destructive" type="submit" className="bg-red-700 w-full">
        Add Resident
      </Button>
    </form>
  );
}
