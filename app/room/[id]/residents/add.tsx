"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { Resident } from "@/types/resident";
import { useRouter } from "next/navigation";

export default function AddResident() {
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

      <Button className="sm:w-64 w-full">Add New Resident</Button>
    </form>
  );
}
