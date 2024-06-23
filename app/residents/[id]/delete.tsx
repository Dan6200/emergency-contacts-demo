"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { isTypeResident, ResidentData } from "@/types/resident";
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
  const handleDelete = (formData: FormData) => {
    const _id = formData.get("id");
    const resData = formData.get("resident_data");
    if (!resData || !_id) {
      toast({ title: "Unable to Delete Resident", variant: "destructive" });
      return null;
    }
    deleteResidentData(JSON.parse(resData as string), _id as string)
      .catch((err) => {
        console.error(err);
        toast({ title: "Unable to Delete Resident", variant: "destructive" });
      })
      .then((_) => toast({ title: "Successfully Deleted Resident" }));
    router.push("/admin/residents");
  };
  return (
    <form
      action={handleDelete}
      className="md:w-full grow shrink basis-0 text-white"
    >
      <input
        hidden
        type="text"
        value={JSON.stringify(residentData)}
        name="resident_data"
      />
      <input hidden type="text" value={id} name="id" />
      <Button variant="destructive" type="submit" className="bg-red-700 w-full">
        Delete Resident
      </Button>
    </form>
  );
}
