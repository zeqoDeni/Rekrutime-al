import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "./types/api";

type UserType = "employer" | "candidate" | "admin";

interface UserProfile {
  name: string;
  type: UserType;
  createdAt: string;
}

const USERS_COLLECTION = "users";

function mapFirebaseUser(firebaseUser: FirebaseUser, profile: UserProfile): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: profile.name,
    type: profile.type,
    createdAt: profile.createdAt,
  };
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as UserProfile;
}

async function createUserProfile(
  firebaseUser: FirebaseUser,
  name: string,
  type: UserType
): Promise<UserProfile> {
  const profile: UserProfile = {
    name,
    type,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), profile);
  return profile;
}

export async function signup(
  email: string,
  password: string,
  name: string,
  type: UserType
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await createUserProfile(credential.user, name, type);
  return mapFirebaseUser(credential.user, profile);
}

export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);

  if (!profile) {
    // Backfill a basic profile if account exists without Firestore profile doc.
    const fallbackProfile = await createUserProfile(
      credential.user,
      credential.user.email?.split("@")[0] || "Përdorues",
      "candidate"
    );
    return mapFirebaseUser(credential.user, fallbackProfile);
  }

  return mapFirebaseUser(credential.user, profile);
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  let profile = await getUserProfile(result.user.uid);
  if (!profile) {
    profile = await createUserProfile(
      result.user,
      result.user.displayName || result.user.email?.split("@")[0] || "Përdorues",
      "candidate"
    );
  }
  return mapFirebaseUser(result.user, profile);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function observeAuthState(
  onUser: (user: User | null) => void,
  onError?: (error: Error) => void
): () => void {
  return onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      if (!firebaseUser) {
        onUser(null);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          const fallbackProfile = await createUserProfile(
            firebaseUser,
            firebaseUser.email?.split("@")[0] || "Përdorues",
            "candidate"
          );
          onUser(mapFirebaseUser(firebaseUser, fallbackProfile));
          return;
        }

        onUser(mapFirebaseUser(firebaseUser, profile));
      } catch (error) {
        onError?.(error as Error);
      }
    },
    (error) => onError?.(error as Error)
  );
}
