import QRFetchResidents from "@/components/qr-reader";

export default function Home() {
  return (
    <main className="bg-background text-center mx-auto py-32">
      <QRFetchResidents />
    </main>
  );
}
