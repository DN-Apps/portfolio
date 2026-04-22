"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { pickCmsData } from "@/utils/pickCmsData";
import type { CertificateContent } from "@/lib/directus";
import "./CertificateSection.css";

type CertificateKey = "scrimba" | "mendix" | "kmk" | "stanley";

// Die Zertifikate sind zentral definiert, damit Karte und Modal dieselbe
// Datenquelle nutzen und nicht auseinanderlaufen.
const certificates: Array<{
  key: CertificateKey;
  file: string;
  year: string;
}> = [
  {
    key: "scrimba",
    file: "/certificates/scrimba-fullstack-2026.png",
    year: "2026",
  },
  {
    key: "mendix",
    file: "/certificates/mendix-rapid-application-developer-2023.png",
    year: "2023",
  },
  {
    key: "kmk",
    file: "/certificates/kmk-englisch-b2.png",
    year: "B2",
  },
  {
    key: "stanley",
    file: "/certificates/stanley-security-unison-2018.png",
    year: "2018",
  },
];

interface CertificateSectionProps {
  certificates?: CertificateContent[];
}

export default function CertificateSection({
  certificates: cmsCertificates,
}: CertificateSectionProps) {
  const t = useTranslations("certificates");
  const fallbackCertificates = certificates.map((certificate) => ({
    id: certificate.key,
    title: t(`${certificate.key}.title`),
    subtitle: t(`${certificate.key}.subtitle`),
    file: certificate.file,
    year: certificate.year,
  }));

  const displayCertificates = pickCmsData(
    cmsCertificates,
    fallbackCertificates,
  );

  // selected steuert das Modal, zoom nur die Darstellung im Modal selbst.
  const [selected, setSelected] = useState<CertificateContent | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasZoomed, setHasZoomed] = useState(false);

  const openCertificate = (item: CertificateContent) => {
    // Beim Öffnen wird der Zoom zurückgesetzt, damit jedes Zertifikat immer in
    // einem definierten Ausgangszustand startet.
    setSelected(item);
    setZoom(1);
    setHasZoomed(false);
  };

  const closeModal = () => {
    setSelected(null);
  };

  const zoomOnce = () => {
    // Der Zoom ist absichtlich begrenzt, damit die Bedienung mobil und mit
    // Maus konsistent bleibt statt in beliebige Stufen auszuufern.
    if (hasZoomed) {
      return;
    }

    setZoom(1.8);
    setHasZoomed(true);
  };

  const zoomOutOnce = () => {
    if (!hasZoomed) {
      return;
    }

    setZoom(1);
    setHasZoomed(false);
  };

  return (
    <section id="certificates" className="certificates-section">
      <div className="certificates-container">
        <div className="certificates-header">
          <h2>{t("title")}</h2>
          <p>{t("description")}</p>
        </div>

        <div className="certificate-grid">
          {displayCertificates.map((certificate) => (
            <article key={certificate.id} className="certificate-card">
              <img
                src={certificate.file}
                alt={certificate.title}
                className="certificate-image"
              />
              <div className="certificate-card-top">
                <div>
                  <span className="certificate-tag">{certificate.year}</span>
                  <h3>{certificate.title}</h3>
                </div>
              </div>
              <p>{certificate.subtitle}</p>
              <button
                type="button"
                className="certificate-view"
                onClick={() => openCertificate(certificate)}
              >
                {t("view")}
              </button>
            </article>
          ))}
        </div>
      </div>

      {selected ? (
        // Overlay und gestoppte Event-Bubbles trennen klar zwischen
        // "Modal schließen" und "innerhalb des Modals interagieren".
        <div className="certificate-modal-overlay" onClick={closeModal}>
          <div
            className="certificate-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="certificate-modal-header">
              <div>
                <p className="modal-label">{t("certificate")}</p>
                <h3>{selected.title}</h3>
              </div>
            </div>
            <div className="certificate-modal-body">
              <img
                src={selected.file}
                alt={selected.title}
                style={{ transform: `scale(${zoom})` }}
                className="certificate-preview"
              />
            </div>
            <div className="certificate-modal-actions">
              <button
                type="button"
                className="modal-zoom"
                onClick={zoomOnce}
                disabled={hasZoomed}
                aria-label={t("zoom_in")}
                title={t("zoom_in")}
              >
                🔍
              </button>
              <button
                type="button"
                className="modal-zoom"
                onClick={zoomOutOnce}
                disabled={!hasZoomed}
                aria-label={t("zoom_out")}
                title={t("zoom_out")}
              >
                🔎
              </button>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
