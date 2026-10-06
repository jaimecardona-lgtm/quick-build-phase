import { useLanguage } from "@/lib/i18n";
import costPhoto from "@/assets/operational-challenges/cost-analysis.jpg.asset.json";
import teamPhoto from "@/assets/operational-challenges/team-collaboration.jpg.asset.json";
import paperworkPhoto from "@/assets/operational-challenges/fragmented-paperwork.jpg.asset.json";

const photos = [costPhoto.url, teamPhoto.url, paperworkPhoto.url];

export function OperationalChallenges() {
  const { content } = useLanguage();
  const { challenges } = content;

  return (
    <section id="desafios-operativos" aria-labelledby="challenges-title" className="operational-challenges">
      <div className="challenge-layout mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="challenge-heading">
          <div data-reveal className="reveal-item">
            <p className="challenge-kicker">{challenges.kicker}</p>
            <h2 id="challenges-title" className="challenge-title">{challenges.title}</h2>
          </div>
        </div>
        <div className="challenge-list">
          {challenges.challenges.map((challenge, index) => (
            <article key={index} data-reveal className="challenge-card reveal-item" aria-labelledby={`challenge-${index + 1}`}>
              <div className="challenge-card-media">
                <img src={photos[index]} alt={challenge.alt} loading="lazy" decoding="async" />
              </div>
              <div className="challenge-card-copy">
                <span className="challenge-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3 id={`challenge-${index + 1}`}>{challenge.title}</h3>
                <p>{challenge.before}{challenge.emphasis ? <strong>{challenge.emphasis}</strong> : null}{challenge.after}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}