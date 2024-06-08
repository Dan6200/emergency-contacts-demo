import { User } from "firebase/auth";
import { atom } from "jotai";

export const UserAtom = atom<User | null>(null);
