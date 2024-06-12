import { SignInForm } from "@/components/sign-in-form/";
import { getAuthenticatedAppForUser } from "@/server";

export default async function SignInPage() {
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <SignInForm />
    </main>
  );
}
