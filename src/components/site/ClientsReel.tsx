import { useLanguage } from "@/lib/i18n";
import swift from "@/assets/client-logos/swift-cargo.png.asset.json";
import clm from "@/assets/client-logos/clm-cargo.png.asset.json";
import transmares from "@/assets/client-logos/transmares-usa.png.asset.json";
import scit from "@/assets/client-logos/sc-itrading.png.asset.json";
import logsol from "@/assets/client-logos/logistics-solutions.png.asset.json";
import trade from "@/assets/client-logos/trade-business-sas.png.asset.json";
import transint from "@/assets/client-logos/transinternational-cargo.png.asset.json";
import rr from "@/assets/client-logos/rr-logistics.png.asset.json";
import connecta from "@/assets/client-logos/connecta-global-logistics.png.asset.json";
import bsp from "@/assets/client-logos/grupo-bsp.png.asset.json";
import navis from "@/assets/client-logos/navis.png.asset.json";
import globalFreight from "@/assets/client-logos/global-freight.png.asset.json";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";

// Terminal desenfocada de fondo: ambiente de escala; los logos conservan el protagonismo.
const CLIENTS_CLIPS = [CINEMATIC_CLIPS.container_operations];

const logos = [
  { name: "Swift Cargo", src: swift.url, sizing: "swift" },
  { name: "CLM Cargo", src: clm.url, sizing: "clm" },
  { name: "Transmares USA", src: transmares.url, sizing: "transmares" },
  { name: "SC iTrading", src: scit.url, sizing: "scit" },
  { name: "Logistics Solutions", src: logsol.url, sizing: "logsol" },
  { name: "Trade & Business SAS", src: trade.url, sizing: "trade" },
  { name: "Transinternational Cargo LTDA", src: transint.url, sizing: "transint" },
  { name: "R&R Logistics", src: rr.url, sizing: "rr" },
  { name: "Connecta Global Logistics", src: connecta.url, sizing: "connecta" },
  { name: "Grupo BSP", src: bsp.url, sizing: "bsp" },
  { name: "Navis Logistics", src: navis.url, sizing: "navis" },
  { name: "Global Freight SAS", src: globalFreight.url, sizing: "global" },
];

export function ClientsReel() {
  const { content } = useLanguage();
  const { ui } = content;

  return (
    <section aria-labelledby="clientes-reel-title" className="clients-reel-section bg-night amb bgseq-host">
      {FORWARDERS_V2 ? (
        <DataNetworkLayer variant="network" />
      ) : (
        <CinematicBackgroundSequence clips={CLIENTS_CLIPS} className="bgseq-veil-strong" />
      )}
      <div className="mx-auto max-w-[1100px] px-5 text-center md:px-8">
        <h2 id="clientes-reel-title" className="section-title-dark mx-auto">{ui.clientsTitle}</h2>
        <p className="section-lead-dark mx-auto mt-5 max-w-[1100px]">{ui.clientsBody}</p>
      </div>
      <div className="clients-reel clients-reel-mask mt-10" tabIndex={0} aria-label={ui.clientsLabel}>
        <div className="clients-reel-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="clients-reel-group" aria-hidden={copy === 1 ? true : undefined}>
              {logos.map((logo) => (
                <li key={logo.name} className="clients-reel-item" data-logo={logo.sizing}>
                  <img src={logo.src} alt={copy === 0 ? logo.name : ""} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
