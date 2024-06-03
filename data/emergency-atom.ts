"use client";
import { atom } from "jotai";

export default atom<
  | {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
    }[]
  | null
>(null);
