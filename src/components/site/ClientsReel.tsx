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

const logos = [
  { name: "Swift Cargo", src: swift.url },
  { name: "CLM Cargo", src: clm.url },
  { name: "Transmares USA", src: transmares.url },
  { name: "SC iTrading", src: scit.url },
  { name: "Logistics Solutions", src: logsol.url },
  { name: "Trade & Business SAS", src: trade.url },
  { name: "Transinternational Cargo LTDA", src: transint.url },
  { name: "R&R Logistics", src: rr.url },
  { name: "Connecta Global Logistics", src: connecta.url },
  { name: "Grupo BSP", src: bsp.url },
  { name: "Navis Logistics", src: navis.url },
  { name: "Global Freight SAS", src: globalFreight.url },
];

export function ClientsReel() {
  const { content } = useLanguage();
  const { ui } = content;

  return (
    <section aria-labelledby="clientes-reel-title" className="clients-reel-section bg-night">
      <div className="mx-auto max-w-[1100px] px-5 text-center md:px-8">
        <h2 id="clientes-reel-title" className="section-title-dark">{ui.clientsTitle}</h2>
        <p className="section-lead-dark mx-auto mt-5 max-w-[1100px]">{ui.clientsBody}</p>
      </div>
      <div className="clients-reel clients-reel-mask mt-10" tabIndex={0} aria-label={ui.clientsLabel}>
        <div className="clients-reel-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="clients-reel-group" aria-hidden={copy === 1 ? true : undefined}>
              {logos.map((logo) => (
                <li key={logo.name} className="clients-reel-item">
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
