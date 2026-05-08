import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function updateUserName(uid: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { name });
}
