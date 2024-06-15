import { signIn } from "@/app/residents/functions";
import { SignInForm } from "@/components/signin-form/";

export default async function SignInPage() {
  return (
    <main className="bg-background container p-8 sm:px-16 md:w-2/3 mx-auto my-16 max-h-screen">
      <SignInForm {...{ signIn }} />
    </main>
  );
}
