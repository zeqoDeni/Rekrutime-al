import { getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { NoteRecord } from "../types/ats";
import { createRecord, listRecords, orgCollection } from "./base";

export function listNotes(orgId: string) {
  return listRecords<NoteRecord>(orgId, "notes");
}

export async function listNotesForRef(orgId: string, refId: string): Promise<NoteRecord[]> {
  const q = query(
    orgCollection(orgId, "notes"),
    where("refId", "==", refId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as NoteRecord));
}

export async function createNote(orgId: string, payload: Omit<NoteRecord, "id">) {
  const docRef = await createRecord(orgId, "notes", payload);
  return docRef.id;
}
