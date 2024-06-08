import Residents from "@/components/residents";
import Link from "next/link";
import QRFetchResidents from "@/components/qr";

export default function Home() {
  return (
    <main className="bg-background text-center mx-auto py-8">
      <QRFetchResidents />
    </main>
  );
}
