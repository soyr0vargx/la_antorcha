"use client";

import Link from "next/link";
import { useState } from "react";
import { ComposableMap, Geography, Geographies, Graticule, Sphere } from "react-simple-maps";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import type { ConflictRecord, ConflictRegion } from "../lib/conflicts";

const regions: { id: ConflictRegion | "world"; label: string }[] = [
  { id: "world", label: "Mundo" },
  { id: "africa", label: "África" },
  { id: "americas", label: "Américas" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europa" },
  { id: "oceania", label: "Oceanía" },
];

const countriesTopology = worldTopology as unknown as Topology;
const countryGeographies = feature(countriesTopology, countriesTopology.objects.countries);

function ConflictDossier({ conflict }: { conflict: ConflictRecord }) {
  return (
    <article className="conflict-dossier">
      <div className="dossier-heading">
        <p className="eyebrow">FICHA VERIFICADA</p>
        <h3>{conflict.name}</h3>
        <p>{conflict.location.label}</p>
      </div>
      <dl className="conflict-fields">
        <div><dt>Contexto</dt><dd>{conflict.context}</dd></div>
        <div><dt>Inicio</dt><dd>{conflict.startDate ?? "Sin fecha confirmada"}</dd></div>
        <div><dt>Actores</dt><dd>{conflict.actors.join(", ") || "Pendiente de documentar"}</dd></div>
        <div><dt>Cronología</dt><dd>{conflict.chronology.map((item) => `${item.date}: ${item.event}`).join(" · ") || "Pendiente de documentar"}</dd></div>
        <div><dt>Situación</dt><dd>{conflict.currentSituation}</dd></div>
        <div><dt>Impacto humanitario</dt><dd>{conflict.humanitarianImpact}</dd></div>
        <div><dt>Impacto en niños y adolescentes</dt><dd>{conflict.impactOnChildren}</dd></div>
        <div>
          <dt>Fuentes</dt>
          <dd>
            {conflict.sources.length ? conflict.sources.map((source) => (
              <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                {source.organization}: {source.title}
              </a>
            )) : "Pendiente de documentar"}
          </dd>
        </div>
      </dl>
      <Link
        className="text-link"
        href={`/investigar?consulta=${encodeURIComponent(conflict.investigationQuery)}`}
      >
        Investigar este conflicto <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export function ConflictExplorer({ conflicts }: { conflicts: ConflictRecord[] }) {
  const [selectedRegion, setSelectedRegion] = useState<ConflictRegion | "world">("world");
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const visibleConflicts = conflicts.filter((conflict) =>
    (selectedRegion === "world" || conflict.location.region === selectedRegion) &&
    (!selectedCountry || conflict.location.mapName === selectedCountry),
  );
  const selectedConflict = visibleConflicts.find(({ id }) => id === selectedConflictId);
  const regionLabel = regions.find(({ id }) => id === selectedRegion)?.label ?? "esta región";

  function selectRegion(region: ConflictRegion | "world") {
    setSelectedRegion(region);
    setSelectedConflictId(null);
    setSelectedCountry(null);
  }

  function selectCountry(country: string) {
    setSelectedCountry(country);
    setSelectedConflictId(null);
  }

  return (
    <div className="conflict-explorer">
      <section className="map-panel" aria-label="Capa cartográfica">
        <div className="map-surface">
          <ComposableMap
            aria-label="Mapa mundial interactivo. Selecciona un país para consultar el archivo."
            className="world-map"
            projection="geoEqualEarth"
            projectionConfig={{ scale: 150 }}
            role="group"
          >
            <Sphere fill="#151716" pointerEvents="none" stroke="#505451" strokeWidth={0.7} />
            <Graticule pointerEvents="none" stroke="#343835" strokeWidth={0.45} step={[30, 30]} />
            <Geographies geography={countryGeographies}>
              {({ geographies }) => geographies.map((geography) => {
                const countryName = String(geography.properties?.name ?? "");
                if (!countryName) return null;

                const hasRecord = conflicts.some((conflict) => conflict.location.mapName === countryName);
                const isSelected = selectedCountry === countryName;

                return (
                  <Geography
                    aria-label={`Seleccionar ${countryName}${hasRecord ? ", con fichas" : ", sin fichas verificadas en el archivo"}`}
                    aria-pressed={isSelected}
                    className="map-country"
                    fill={isSelected ? "#c8877b" : hasRecord ? "#7d817b" : "#343835"}
                    geography={geography}
                    key={geography.rsmKey}
                    onClick={() => selectCountry(countryName)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectCountry(countryName);
                      }
                    }}
                    role="button"
                    stroke="#101111"
                    strokeWidth={0.45}
                    tabIndex={0}
                  />
                );
              })}
            </Geographies>
          </ComposableMap>
          <div className="map-selection-status" aria-live="polite">
            <span className="eyebrow">{selectedCountry ? "PAÍS SELECCIONADO" : "SELECCIONA UN PAÍS"}</span>
            <span>{selectedCountry ?? "Sin marcadores: no hay fichas verificadas."}</span>
          </div>
        </div>
        <div className="map-legend">
          <span>ARCHIVO / {conflicts.length} FICHAS VERIFICADAS</span>
          <a href="https://www.naturalearthdata.com/" rel="noreferrer" target="_blank">
            CARTOGRAFÍA NATURAL EARTH ↗
          </a>
        </div>
      </section>

      <section className="conflict-browser" aria-label="Explorar fichas por región">
        <p className="eyebrow">EXPLORAR POR REGIÓN</p>
        <div className="region-filter" role="group" aria-label="Filtrar por región">
          {regions.map((region) => (
            <button
              aria-pressed={selectedRegion === region.id}
              className={selectedRegion === region.id ? "region-button is-active" : "region-button"}
              key={region.id}
              onClick={() => selectRegion(region.id)}
              type="button"
            >
              {region.label}
            </button>
          ))}
        </div>

        {selectedCountry && (
          <p className="country-filter-label">
            ARCHIVO PARA <strong>{selectedCountry}</strong>
          </p>
        )}

        {visibleConflicts.length === 0 ? (
          <div className="archive-empty-state" role="status" aria-live="polite">
            <p className="eyebrow">
              {selectedCountry ? selectedCountry.toUpperCase() : regionLabel.toUpperCase()} / SIN FICHAS
            </p>
            <h3>No hay registros verificados en el archivo.</h3>
            <p>
              Esto no significa que no existan conflictos en {selectedCountry ?? `esta región (${regionLabel})`}.
              No se publicarán
              marcadores ni datos hasta contar con fuentes verificables.
            </p>
          </div>
        ) : (
          <div className="conflict-results">
            {visibleConflicts.map((conflict) => (
              <button
                aria-pressed={selectedConflictId === conflict.id}
                className="conflict-result"
                key={conflict.id}
                onClick={() => setSelectedConflictId(conflict.id)}
                type="button"
              >
                <span>{conflict.name}</span>
                <span>{conflict.location.label}</span>
              </button>
            ))}
            {selectedConflict && <ConflictDossier conflict={selectedConflict} />}
          </div>
        )}
      </section>
    </div>
  );
}