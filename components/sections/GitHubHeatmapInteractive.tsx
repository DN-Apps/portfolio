"use client";

import { useState } from "react";
import type { ContributionWeek } from "@/lib/github";

interface GitHubHeatmapInteractiveProps {
  weeks: ContributionWeek[];
  hasGraphData: boolean;
  username: string;
  heatmapLabel: string;
  lessLabel: string;
  moreLabel: string;
  zoomHintLabel: string;
}

function HeatmapGrid({
  weeks,
  dayClassName,
}: {
  weeks: ContributionWeek[];
  dayClassName?: string;
}) {
  return (
    <div className="github-heatmap-grid" aria-hidden="true">
      {weeks.map((week, weekIndex) =>
        week.days.map((day) => (
          <span
            key={`${weekIndex}-${day.date}-${dayClassName ?? "default"}`}
            className={`github-day level-${day.level}${dayClassName ? ` ${dayClassName}` : ""}`}
            title={`${day.date}: ${day.count}`}
          />
        )),
      )}
    </div>
  );
}

export default function GitHubHeatmapInteractive({
  weeks,
  hasGraphData,
  username,
  heatmapLabel,
  lessLabel,
  moreLabel,
  zoomHintLabel,
}: GitHubHeatmapInteractiveProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="github-heatmap-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={heatmapLabel}
      >
        {hasGraphData ? (
          <HeatmapGrid weeks={weeks} />
        ) : (
          <img
            className="github-heatmap-image"
            src={`https://ghchart.rshah.org/216477/${username}`}
            alt={heatmapLabel}
            loading="lazy"
          />
        )}
      </button>

      <div className="github-legend" aria-hidden="true">
        <span>{lessLabel}</span>
        <span className="github-day level-0" />
        <span className="github-day level-1" />
        <span className="github-day level-2" />
        <span className="github-day level-3" />
        <span className="github-day level-4" />
        <span>{moreLabel}</span>
      </div>

      <p className="github-zoom-hint">
        {zoomHintLabel}
      </p>

      {isOpen ? (
        <div
          className="github-heatmap-modal-backdrop"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            className="github-heatmap-modal"
            role="dialog"
            aria-modal="true"
            aria-label={heatmapLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="github-heatmap-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close heatmap"
            >
              x
            </button>

            <div className="github-heatmap-modal-content">
              {hasGraphData ? (
                <HeatmapGrid weeks={weeks} dayClassName="github-day-large" />
              ) : (
                <img
                  className="github-heatmap-image github-heatmap-image-large"
                  src={`https://ghchart.rshah.org/216477/${username}`}
                  alt={heatmapLabel}
                  loading="lazy"
                />
              )}
            </div>

            <div className="github-legend" aria-hidden="true">
              <span>{lessLabel}</span>
              <span className="github-day level-0 github-day-large" />
              <span className="github-day level-1 github-day-large" />
              <span className="github-day level-2 github-day-large" />
              <span className="github-day level-3 github-day-large" />
              <span className="github-day level-4 github-day-large" />
              <span>{moreLabel}</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
