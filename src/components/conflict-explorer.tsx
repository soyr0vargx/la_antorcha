"use client";

import Link from "next/link";
import { useState } from "react";
import { ComposableMap, Geography, Geographies, Graticule, Sphere } from "react-simple-maps";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import type { ConflictRecord, ConflictRegion } from "../lib/conflicts";
import { CountrySources } from "./country-sources";

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
const mapFeatures = "features" in countryGeographies
  ? countryGeographies.features
  : [countryGeographies];
const mapCountries = mapFeatures.flatMap((geography) => {
  const name = geography.properties?.name;
  return typeof name === "string" ? [name] : [];
});

function ConflictDossier({ conflict }: { conflict: ConflictRecord }) {
  return (
    <article className="conflict-dossier">
      <div className="dossier-heading">
        <p className="eyebrow">
          FICHA VERIFICADA · REVISADA{" "}
          <time dateTime={conflict.reviewedAt}>
            {new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" })
              .format(new Date(conflict.reviewedAt))}
          </time>
        </p>
        <h3>{conflict.name}</h3>
        <p>{conflict.location.label}</p>
      </div>
      <dl className="conflict-fields">
        <div><dt>Contexto</dt><dd>{conflict.context}</dd></div>
        <div>
          <dt>Inicio</dt>
          <dd>{conflict.startDate ?? "El informe enlazado no confirma una fecha de inicio."}</dd>
        </div>
        <div>
          <dt>Actores</dt>
          <dd>
            {conflict.actors.length
              ? conflict.actors.join(", ")
              : "Las fuentes de esta ficha no identifican suficientemente a las partes del conflicto; no se atribuyen responsabilidades sin evidencia."}
          </dd>
        </div>
        <div>
          <dt>Cronología</dt>
          <dd>
            {conflict.chronology.length ? (
              <ol className="conflict-timeline">
                {conflict.chronology.map((item) => (
                  <li key={`${item.date}-${item.event}`}>
                    <time>{item.date}</time>
                    <span>{item.event}</span>
                  </li>
                ))}
              </ol>
            ) : "No hay acontecimientos fechados en las fuentes incorporadas."}
          </dd>
        </div>
        <div><dt>Situación</dt><dd>{conflict.currentSituation}</dd></div>
        <div><dt>Impacto humanitario</dt><dd>{conflict.humanitarianImpact}</dd></div>
        <div><dt>Impacto en niños y adolescentes</dt><dd>{conflict.impactOnChildren}</dd></div>
        <div>
          <dt>Fuentes</dt>
          <dd>
            {conflict.sources.length ? conflict.sources.map((source) => (
              <span className="source-reference" key={source.id}>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {source.organization}: {source.title}
                </a>
                <span className="source-support">
                  Publicación: {source.publicationDate ?? "fecha no indicada"}.
                  {" "}{source.supports}
                </span>
              </span>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [mapScale, setMapScale] = useState(150);
  const visibleConflicts = conflicts.filter((conflict) =>
    (selectedRegion === "world" || conflict.location.region === selectedRegion) &&
    (!selectedCountry || conflict.location.mapName === selectedCountry) &&
    (!searchQuery.trim() || [
      conflict.name,
      conflict.location.label,
      conflict.location.mapName,
      conflict.location.countryCode,
    ].some((value) => value.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()))),
  );
  const selectedConflict = visibleConflicts.find(({ id }) => id === selectedConflictId)
    ?? visibleConflicts[0]
    ?? null;
  const regionLabel = regions.find(({ id }) => id === selectedRegion)?.label ?? "esta región";

  function selectRegion(region: ConflictRegion | "world") {
    setSelectedRegion(region);
    setSelectedConflictId(null);
    setSelectedCountry(null);
  }

  function selectCountry(country: string) {
    setSelectedCountry(country);
    setSearchQuery(country);
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
            projectionConfig={{ scale: mapScale }}
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
          <div className="map-zoom-controls" role="group" aria-label="Controles de zoom del mapa">
            <button
              aria-label="Alejar mapa"
              disabled={mapScale <= 110}
              onClick={() => setMapScale((scale) => Math.max(110, scale - 20))}
              type="button"
            >
              −
            </button>
            <button
              aria-label="Restablecer zoom"
              onClick={() => setMapScale(150)}
              type="button"
            >
              Restablecer
            </button>
            <button
              aria-label="Acercar mapa"
              disabled={mapScale >= 250}
              onClick={() => setMapScale((scale) => Math.min(250, scale + 20))}
              type="button"
            >
              +
            </button>
          </div>
          <div className="map-selection-status" aria-live="polite">
            <span className="eyebrow">{selectedCountry ? "PAÍS SELECCIONADO" : "SELECCIONA UN PAÍS"}</span>
            <span>
              {selectedCountry ?? (conflicts.length
                ? "Selecciona un país sombreado para consultar sus fichas."
                : "Aún no hay fichas verificadas para mostrar.")}
            </span>
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

        <div className="conflict-search">
          <label htmlFor="conflict-search">Buscar en el archivo verificado o seleccionar un país</label>
          <input
            autoComplete="off"
            id="conflict-search"
            onChange={(event) => {
              const query = event.target.value;
              const country = mapCountries.find(
                (name) => name.toLocaleLowerCase() === query.trim().toLocaleLowerCase(),
              );
              setSearchQuery(query);
              setSelectedCountry(country ?? null);
              setSelectedConflictId(null);
            }}
            placeholder="Nombre del conflicto o país"
            list="conflict-country-options"
            value={searchQuery}
          />
          <datalist id="conflict-country-options">
            {mapCountries.map((country) => <option key={country} value={country} />)}
          </datalist>
        </div>

        {selectedCountry && (
          <p className="country-filter-label">
            ARCHIVO PARA <strong>{selectedCountry}</strong>
            <button
              onClick={() => {
                setSelectedCountry(null);
                setSearchQuery("");
              }}
              type="button"
            >
              Quitar filtro
            </button>
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
            <Link
              className="text-link"
              href={`/investigar?consulta=${encodeURIComponent(searchQuery.trim() || selectedCountry || regionLabel)}`}
            >
              Buscar fuentes sobre {searchQuery.trim() || selectedCountry || regionLabel}
              <span aria-hidden="true"> ↗</span>
            </Link>
            {selectedCountry && <CountrySources country={selectedCountry} key={selectedCountry} />}
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
            {selectedCountry && <CountrySources country={selectedCountry} key={selectedCountry} />}
          </div>
        )}
      </section>
    </div>
  );
}