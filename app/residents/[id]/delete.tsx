"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ResidentData } from "@/types/resident";
import { useRouter } from "next/navigation";

export default function DeleteResident({
  id,
  residentData,
  deleteResidentData,
}: {
  id: string;
  residentData: ResidentData;
  deleteResidentData: (
    residentData: ResidentData,
    id: string
  ) => Promise<
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
  const router = useRouter();
  const handleDelete = (residentData: ResidentData, id: string) => {
    deleteResidentData(residentData, id)
      .catch((err) => {
        console.error(err);
        toast({ title: "Unable to Delete Resident", variant: "destructive" });
      })
      .then((_) => toast({ title: "Successfully Deleted Resident" }));
    router.back();
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
