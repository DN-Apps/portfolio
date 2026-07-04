import { getTranslations } from "next-intl/server";
import { getGitHubOverview } from "@/lib/github";
import GitHubHeatmapInteractive from "@/components/sections/GitHubHeatmapInteractive";
import "./GitHubActivitySection.css";

interface GitHubActivitySectionProps {
  locale: string;
}

function formatMonthLabel(monthKey: string, locale: string): string {
  const [year, month] = monthKey.split("-");
  const yearNumber = Number(year);
  const monthNumber = Number(month);

  if (!yearNumber || !monthNumber) {
    return monthKey;
  }

  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function GitHubActivitySection({
  locale,
}: GitHubActivitySectionProps) {
  const t = await getTranslations({ locale, namespace: "github" });
  const github = await getGitHubOverview();

  return (
    <section className="github-section" id="github-activity">
      <div className="container github-container">
        <h2>{t("title")}</h2>
        <p className="github-subtitle">{t("subtitle")}</p>

        <div className="github-heatmap-wrap">
          <div className="github-heatmap-header">
            <p>
              {github.hasGraphData
                ? `${github.totalContributions} ${t("contributions_last_year")}`
                : t("contributions_public_preview")}
            </p>
            <a
              href={`https://github.com/${github.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("view_profile")}
            </a>
          </div>

          <GitHubHeatmapInteractive
            weeks={github.weeks}
            hasGraphData={github.hasGraphData}
            username={github.username}
            heatmapLabel={t("heatmap_label")}
            lessLabel={t("less")}
            moreLabel={t("more")}
            zoomHintLabel={t("zoom_hint")}
          />
        </div>

        <div className="github-activity-wrap">
          <h3>{t("activity_title")}</h3>

          {github.monthlyActivity.length === 0 ? (
            <p className="github-no-activity">{t("no_data")}</p>
          ) : (
            <div className="github-month-list">
              {github.monthlyActivity.slice(0, 3).map((month) => (
                <article key={month.monthKey} className="github-month-card">
                  <h4>{formatMonthLabel(month.monthKey, locale)}</h4>

                  {month.totalCommits > 0 ? (
                    <div className="github-activity-block">
                      <p className="github-activity-headline">
                        {month.totalCommits} {t("commits_created")}
                      </p>
                      <ul>
                        {month.commitRepositories.slice(0, 5).map((repo) => (
                          <li key={repo.repo}>
                            <span>{repo.repo}</span>
                            <strong>{repo.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {month.createdRepositories.length > 0 ? (
                    <div className="github-activity-block">
                      <p className="github-activity-headline">
                        {month.createdRepositories.length} {t("repositories_created")}
                      </p>
                      <ul>
                        {month.createdRepositories.slice(0, 5).map((repo) => (
                          <li key={repo}>
                            <span>{repo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {month.openedPullRequests.length > 0 ? (
                    <div className="github-activity-block">
                      <p className="github-activity-headline">
                        {month.openedPullRequests.reduce(
                          (sum, entry) => sum + entry.count,
                          0,
                        )}{" "}
                        {t("pull_requests_opened")}
                      </p>
                      <ul>
                        {month.openedPullRequests.slice(0, 5).map((repo) => (
                          <li key={repo.repo}>
                            <span>{repo.repo}</span>
                            <strong>{repo.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {month.mergedPullRequests.length > 0 ? (
                    <div className="github-activity-block">
                      <p className="github-activity-headline">
                        {month.mergedPullRequests.reduce(
                          (sum, entry) => sum + entry.count,
                          0,
                        )}{" "}
                        {t("pull_requests_merged")}
                      </p>
                      <ul>
                        {month.mergedPullRequests.slice(0, 5).map((repo) => (
                          <li key={repo.repo}>
                            <span>{repo.repo}</span>
                            <strong>{repo.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
