import { signIn } from "@/app/residents/functions";
import { SignInForm } from "@/components/signin-form/";

export default async function SignInPage() {
  return (
    <main className="bg-background container md:w-2/3 mx-auto py-32 max-h-screen">
      <SignInForm {...{ signIn }} />
    </main>
  );
}
