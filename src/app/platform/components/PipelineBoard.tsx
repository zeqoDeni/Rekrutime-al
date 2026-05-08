import { Applicant, CandidateProfile, PipelineStage } from "@/lib/types/ats";
import { Badge } from "@/app/shared/ui/badge";
import { Button } from "@/app/shared/ui/button";

const STAGES: PipelineStage[] = [
  "sourced",
  "screened",
  "interview",
  "offer",
  "hired",
  "rejected",
];

const STAGE_LABELS: Record<PipelineStage, string> = {
  sourced: "Gjetur",
  screened: "Selektuar",
  interview: "Intervistë",
  offer: "Ofertë",
  hired: "Punësuar",
  rejected: "Refuzuar",
};

const NEXT_STAGES: Record<PipelineStage, PipelineStage[]> = {
  sourced: ["screened", "rejected"],
  screened: ["interview", "rejected"],
  interview: ["offer", "rejected"],
  offer: ["hired", "rejected"],
  hired: [],
  rejected: ["sourced"],
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  sourced: "text-blue-600 bg-blue-50 border-blue-200",
  screened: "text-violet-600 bg-violet-50 border-violet-200",
  interview: "text-amber-600 bg-amber-50 border-amber-200",
  offer: "text-orange-600 bg-orange-50 border-orange-200",
  hired: "text-green-600 bg-green-50 border-green-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
};

export function PipelineBoard({
  applicants,
  candidates = {},
  onMove,
}: {
  applicants: Applicant[];
  candidates?: Record<string, CandidateProfile>;
  onMove: (applicantId: string, stage: PipelineStage) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {STAGES.map((stage) => {
        const items = applicants.filter((a) => a.stage === stage);
        return (
          <section key={stage} className="rounded-lg border bg-muted/30 p-3 min-h-[120px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {STAGE_LABELS[stage]}
              </h3>
              {items.length > 0 && (
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-3">
                  Bosh
                </p>
              ) : (
                items.map((item) => {
                  const candidate = candidates[item.candidateId];
                  return (
                    <div
                      key={item.id}
                      className="rounded-md border bg-card p-2.5 shadow-sm"
                    >
                      <p className="text-xs font-medium leading-tight truncate">
                        {candidate?.fullName ?? item.candidateId}
                      </p>
                      {candidate?.email && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {candidate.email}
                        </p>
                      )}
                      {NEXT_STAGES[stage].length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {NEXT_STAGES[stage].map((next) => (
                            <Button
                              key={next}
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-1.5 py-0"
                              onClick={() => onMove(item.id, next)}
                            >
                              → {STAGE_LABELS[next]}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className={`mt-3 -mx-3 -mb-3 px-3 py-1.5 rounded-b-lg border-t text-[10px] font-medium text-center ${STAGE_COLORS[stage]}`}>
              {STAGE_LABELS[stage]}
            </div>
          </section>
        );
      })}
    </div>
  );
}
