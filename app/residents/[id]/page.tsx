import Resident from "@/components/resident";

export default function ResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return <Resident {...{ id }} />;
}

export function generateStaticParams() {
  return Array(100).map((_v, index) => ({ id: (index + 1).toString() }));
}
