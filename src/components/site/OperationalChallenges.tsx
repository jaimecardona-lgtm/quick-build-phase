import { TrendingDown, Users, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const icons = [TrendingDown, Users, FileSpreadsheet];

export function OperationalChallenges() {
  const { content } = useLanguage();
  const { challenges } = content;

  return (
    <section id="desafios-operativos" aria-labelledby="challenges-title" className="operational-challenges">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item challenge-heading">
          <p className="section-kicker">{challenges.kicker}</p>
          <h2 id="challenges-title" className="section-title-dark mt-4">{challenges.title}</h2>
        </div>
        <div className="challenge-list">
          {challenges.challenges.map((challenge, index) => {
            const Icon = icons[index] ?? FileSpreadsheet;
            return (
              <article key={index} data-reveal tabIndex={0} className="challenge-card reveal-item focus-ring" aria-labelledby={`challenge-${index + 1}`}>
                <span className="challenge-icon" aria-hidden="true"><Icon /></span>
                <h3 id={`challenge-${index + 1}`} className="title-h3 text-on-dark">{challenge.title}</h3>
                <p>{challenge.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
