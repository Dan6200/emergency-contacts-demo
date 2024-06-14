"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ResidentData } from "@/types/resident";

export default function DeleteResident({
  id,
  residentData,
  deleteResidentData,
}: {
  id: string;
  residentData: ResidentData;
  deleteResidentData: (residentData: ResidentData, id: string) => Promise<void>;
}) {
  const handleDelete = (residentData: ResidentData, id: string) => {
    deleteResidentData(residentData, id)
      .catch((err) => {
        console.error(err);
        toast({ title: "Unable to Delete Resident", variant: "destructive" });
      })
      .then((_) => toast({ title: "Successfully Deleted Resident" }));
  };
  return (
    <Button
      variant="destructive"
      className="md:w-full grow shrink basis-0 bg-red-700 text-white"
      onClick={() => handleDelete(residentData, id)}
    >
      Delete Resident
    </Button>
  );
}
