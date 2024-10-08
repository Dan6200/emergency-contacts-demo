"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function DeleteResident({
  resident_id,
  deleteResidentData,
}: {
  resident_id: string;
  deleteResidentData: (resident_id: string) => Promise<
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
  const handleDelete = () => {
    if (!resident_id) {
      toast({ title: "Unable to Delete Resident", variant: "destructive" });
      return null;
    }
    deleteResidentData(resident_id)
      .catch((err) => {
        console.error(err);
        toast({ title: "Unable to Delete Resident", variant: "destructive" });
      })
      .then((_) => toast({ title: "Successfully Deleted Resident" }));
  };
  return (
    <form
      action={handleDelete}
      className="md:w-full grow shrink basis-0 text-white"
    >
      <Button variant="destructive" type="submit" className="bg-red-700 w-full">
        Delete Resident
      </Button>
    </form>
  );
}
