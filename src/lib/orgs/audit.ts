import { AuditLogRecord } from "../types/ats";
import { listRecords } from "./base";

export function listAuditLogs(orgId: string) {
  return listRecords<AuditLogRecord>(orgId, "auditLog");
}
