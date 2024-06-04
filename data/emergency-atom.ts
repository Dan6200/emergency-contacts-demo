"use client";
import { atom } from "jotai";

export default atom<Map<
  string,
  | {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      relationship: string;
    }[]
> | null>(null);
