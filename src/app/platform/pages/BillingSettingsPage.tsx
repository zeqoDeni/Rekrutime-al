import { CreditCard, Zap, Shield } from "lucide-react";
import { Button } from "@/app/shared/ui/button";

const PLANS = [
  {
    name: "Starter",
    price: "€49",
    period: "/ muaj",
    description: "Për agjenci të vogla me volume të ulët rekrutimi.",
    features: ["Deri në 3 rekrutues", "100 kandidatë", "2 punë aktive", "Pipeline bazë"],
    cta: "Fillo falas",
    highlight: false,
  },
  {
    name: "Agency",
    price: "€149",
    period: "/ muaj",
    description: "Zgjidhja e plotë për agjenci me volume të mesëm dhe të lartë.",
    features: ["Rekrutues të pakufizuar", "Kandidatë të pakufizuar", "Punë të pakufizuara", "Pipeline i avancuar", "Raporte & analitikë", "Prioritet në support"],
    cta: "Fillo provën falas",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Me marrëveshje",
    period: "",
    description: "Zgjidhje e personalizuar për grupe të mëdha me nevoja specifike.",
    features: ["Gjithçka nga Agency", "SLA i garantuar", "Onboarding i dedikuar", "Integrim me sisteme ekzistuese"],
    cta: "Kontakto ne",
    highlight: false,
  },
];

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Abonimi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Zgjidhni planin që i përshtatet volumit të agjencisë suaj.
        </p>
      </div>

      {/* Current plan notice */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
        <Shield className="size-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Aktualisht jeni në periudhën e provës. Aktivizimi i pagesave do të jetë i disponueshëm së shpejti.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={[
              "rounded-xl border p-5 flex flex-col gap-4",
              plan.highlight ? "border-primary bg-primary/5 shadow-md" : "bg-card",
            ].join(" ")}
          >
            {plan.highlight && (
              <span className="w-fit rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                Më i popullarizuar
              </span>
            )}
            <div>
              <h2 className="text-base font-bold text-foreground">{plan.name}</h2>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
            </div>

            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Zap className="size-3 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? "default" : "outline"}
              size="sm"
              className="mt-auto w-full"
              disabled
            >
              <CreditCard className="size-3.5 mr-1.5" />
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Për aktivizim të hershëm të abonimit, kontaktoni <a href="mailto:support@rekrutime.al" className="text-primary hover:underline">support@rekrutime.al</a>
      </p>
    </div>
  );
}
