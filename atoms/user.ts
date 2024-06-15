import { User } from "firebase/auth";
import { atomWithStorage } from "jotai/utils";

const userAtom = atomWithStorage<User | null>("user", null);
export default userAtom;
