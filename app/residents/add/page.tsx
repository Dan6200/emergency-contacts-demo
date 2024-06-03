import { ResidentForm } from "@/components/residents-form/resident";

export default function AddResidentPage() {
  return (
    <main className="bg-background container w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm
        {...{ address: "", firstName: "", lastName: "", phone: "" }}
      />
    </main>
  );
}
