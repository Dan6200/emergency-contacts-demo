import Residents from "@/components/residents";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-background w-[80vw] text-center mx-auto py-16">
      <h1 className="font-bold text-3xl mb-16">Sunrise Senior Care</h1>
      <p>
        <Link href="/residents" className="text-blue-700 underline">
          View residents
        </Link>
      </p>
    </main>
  );
}
