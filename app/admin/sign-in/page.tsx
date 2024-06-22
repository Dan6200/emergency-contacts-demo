import { SignInForm } from "@/components/signin-form/";
import { getAuthenticatedAppForUser } from "@/server";

export default async function SignInPage() {
  const { currentUser } = await getAuthenticatedAppForUser();
  return (
    <main className="bg-background container md:w-2/3 mx-auto py-32 max-h-screen">
      <SignInForm {...{ initialUser: currentUser?.toJSON() }} />
    </main>
  );
}
