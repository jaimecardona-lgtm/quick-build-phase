import { useLanguage, type Locale } from "@/lib/i18n";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import "@/components/experience/multimodal.css";

/*
 * Trazabilidad multimodal. Fondo narrativo: marítimo → ferroviario, en secuencia continua.
 * El terrestre (camion.mp4) está excluido del fondo a pantalla completa: su master es vertical (9:16)
 * y recortarlo a 16:9 lo volvería irreconocible. Textos demostrativos, localizados y marcados como tales.
 */

type Key = "es" | "en" | "pt";
const keyOf = (locale: Locale): Key =>
  locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";

const COPY = {
  es: {
    kicker: "Trazabilidad multimodal · demostrativo",
    note: "Datos demostrativos · no son operaciones reales",
    modes: { sea: "Marítimo", air: "Aéreo", rail: "Ferroviario", road: "Terrestre" },
    status: { transit: "En tránsito", stop: "En escala", control: "Control documental" },
    eta: "ETA",
  },
  en: {
    kicker: "Multimodal traceability · illustrative",
    note: "Demo data · not real operations",
    modes: { sea: "Sea", air: "Air", rail: "Rail", road: "Road" },
    status: { transit: "In transit", stop: "Transshipment", control: "Document control" },
    eta: "ETA",
  },
  pt: {
    kicker: "Rastreabilidade multimodal · demonstrativo",
    note: "Dados demonstrativos · não são operações reais",
    modes: { sea: "Marítimo", air: "Aéreo", rail: "Ferroviário", road: "Rodoviário" },
    status: { transit: "Em trânsito", stop: "Em escala", control: "Controle documental" },
    eta: "ETA",
  },
} as const;

// Secuencia de fondo: marítimo → ferroviario. El aéreo (avion.mp4) se excluye del fondo hasta revisar la marca
// visible del carguero; el terrestre (camion.mp4) es vertical (9:16) y no se recorta a 16:9.
const BACKGROUND_CLIPS = [CINEMATIC_CLIPS.sea, CINEMATIC_CLIPS.rail];

const SHIPMENTS = [
  {
    route: ["Shanghái", "Panamá", "Colombia"],
    mode: "sea",
    status: "stop",
    eta: "18 nov",
    progress: 0.6,
  },
  {
    route: ["Valencia", "Panamá", "Colombia"],
    mode: "air",
    status: "transit",
    eta: "21 nov",
    progress: 0.4,
  },
  { route: ["Miami", "Colombia"], mode: "road", status: "control", eta: "14 nov", progress: 0.9 },
] as const;

const ROUTE_LABELS: Record<string, Record<Key, string>> = {
  Shanghái: { es: "Shanghái", en: "Shanghai", pt: "Xangai" },
  Valencia: { es: "Valencia", en: "Valencia", pt: "Valência" },
  Miami: { es: "Miami", en: "Miami", pt: "Miami" },
  Panamá: { es: "Panamá", en: "Panama", pt: "Panamá" },
  Colombia: { es: "Colombia", en: "Colombia", pt: "Colômbia" },
};

export function MultimodalTracking() {
  const { locale } = useLanguage();
  const k = keyOf(locale);
  const t = COPY[k];

  return (
    <section className="mt-section bgseq-host" aria-label={t.kicker}>
      <CinematicBackgroundSequence clips={BACKGROUND_CLIPS} />
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <p className="mt-kicker font-ui">{t.kicker}</p>
        <ol className="mt-cards">
          {SHIPMENTS.map((s, i) => (
            <li key={i} className="mt-card" data-status={s.status}>
              <div className="mt-card-head font-ui">
                <span className="mt-chip">{t.status[s.status]}</span>
                <span className="mt-mode">{t.modes[s.mode]}</span>
              </div>
              <p className="mt-route font-ui">
                {s.route.map((city, j) => (
                  <span key={`${city}-${j}`}>
                    {j > 0 ? <span className="mt-arrow"> → </span> : null}
                    {ROUTE_LABELS[city]?.[k] ?? city}
                  </span>
                ))}
              </p>
              <div className="mt-bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${s.progress})` }} />
              </div>
              <p className="mt-meta font-ui">
                {t.eta} · {s.eta}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-note font-ui">{t.note}</p>
      </div>
    </section>
  );
}
