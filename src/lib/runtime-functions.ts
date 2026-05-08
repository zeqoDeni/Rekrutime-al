import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { firebaseApp } from "./firebase";

export const functions = getFunctions(firebaseApp);

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
