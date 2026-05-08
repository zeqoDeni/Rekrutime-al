import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { createRecord } from "./base";

export async function uploadResume(orgId: string, candidateId: string, file: File) {
  const path = `orgs/${orgId}/candidates/${candidateId}/resumes/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  const result = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(result.ref);
  await createRecord(orgId, "resumes", {
    candidateId,
    fileName: file.name,
    storagePath: path,
    contentType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    downloadUrl: url,
  });
  return { path, url };
}
