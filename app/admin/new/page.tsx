import { SignInForm } from "@/components/sign-in-form/";

export default async function RegisterPage() {
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <SignInForm />
    </main>
  );
}
