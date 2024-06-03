"use client";
import peopleAtom from "@/data/people-atom";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Residents() {
  const people = useAtomValue(peopleAtom);
  return (
    <main className="bg-background container w-full px-8 mx-auto py-8 max-h-screen">
      <div className="w-full justify-between flex mb-8">
        <h1 className="font-bold text-2xl">Sunrise Care Residents</h1>
        <Link href="/residents/add">
          <Button>Add a new Resident</Button>
        </Link>
      </div>
      <ul className=" flex flex-col flex-wrap h-[80vh] py-4">
        {people.map((person, index) => (
          <Link key={index} href={`/residents/${index + 1}`} className="">
            <li className="list-disc">
              <span className="text-blue-700 underline">
                ROOM {101 + index}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </main>
  );
}
