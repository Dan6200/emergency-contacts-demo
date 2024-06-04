import { ResidentForm } from "@/components/residents-form/resident";

export default function AddResidentPage() {
  return (
    <main className="bg-background container w-full my-8 md:w-2/3 mx-auto md:my-16 max-h-screen">
      <ResidentForm
        {...{ address: "", firstName: "", lastName: "", phone: "" }}
      />
    </main>
  );
}
