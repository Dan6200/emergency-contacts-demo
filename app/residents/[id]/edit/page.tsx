import { ResidentForm } from "@/components/residents-form/resident";
import { useAtomValue } from "jotai";
import peopleAtom from "@/data/people-atom";

export default function EditResidentPage() {
  const people = useAtomValue(peopleAtom);
  return (
    <main className="bg-background container w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm
        {...{ address: "", firstName: "", lastName: "", phone: "" }}
      />
    </main>
  );
}
