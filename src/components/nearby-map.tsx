import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { type NearbyCity } from "@/lib/nearby-cities";
import "leaflet/dist/leaflet.css";

type CityGroup = { city: NearbyCity; count: number };
type MapInstance = {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  locations: LayerGroup;
  searchArea: LayerGroup;
};

export function NearbyMap({
  origin,
  radiusKm,
  groups,
}: {
  origin: NearbyCity;
  radiusKm: number;
  groups: CityGroup[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<MapInstance>();
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;

    void import("leaflet")
      .then((leaflet) => {
        if (disposed) return;
        map = leaflet.map(element, {
          minZoom: 4,
          scrollWheelZoom: false,
          attributionControl: false,
        });
        leaflet.control.attribution({ prefix: false }).addTo(map);
        const searchArea = leaflet.layerGroup().addTo(map);
        const locations = leaflet.layerGroup().addTo(map);
        const tiles = leaflet.tileLayer(
          import.meta.env.VITE_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
            referrerPolicy: "strict-origin-when-cross-origin",
            updateWhenIdle: true,
          },
        );
        let tilesLoaded = false;
        tiles.on("loading", () => {
          tilesLoaded = false;
        });
        tiles.on("tileload", () => {
          tilesLoaded = true;
          setTilesUnavailable(false);
        });
        tiles.on("load", () => {
          if (!tilesLoaded) setTilesUnavailable(true);
        });
        tiles.addTo(map);
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
          resizeObserver.observe(element);
        }
        setInstance({ leaflet, map, locations, searchArea });
      })
      .catch(() => {
        if (!disposed) setMapUnavailable(true);
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (!instance) return;
    const { leaflet, map, searchArea } = instance;
    searchArea.clearLayers();
    const bounds = leaflet.latLng(origin.center).toBounds(radiusKm * 2000);
    map.fitBounds(bounds, { animate: false, padding: [16, 16], maxZoom: 14 });
    leaflet
      .circle(origin.center, {
        radius: radiusKm * 1000,
        color: "#d66aff",
        weight: 2,
        fillColor: "#a12cfb",
        fillOpacity: 0.14,
        interactive: false,
      })
      .addTo(searchArea);
    leaflet
      .circleMarker(origin.center, {
        color: "#f2c6ff",
        fillColor: "#9d24f5",
        fillOpacity: 1,
        radius: 6,
        weight: 2,
        interactive: false,
      })
      .addTo(searchArea);
  }, [instance, origin, radiusKm]);

  useEffect(() => {
    if (!instance) return;
    const { leaflet, locations } = instance;
    locations.clearLayers();
    for (const { city, count } of groups) {
      const label = `${city.name} · ${count} ${count === 1 ? "profil" : "profils"}`;
      const marker = document.createElement("span");
      marker.textContent = String(count);
      const popup = document.createElement("span");
      popup.textContent = label;
      leaflet
        .marker(city.center, {
          title: label,
          icon: leaflet.divIcon({
            html: marker,
            className:
              "grid place-items-center rounded-full border-2 border-white bg-primary text-xs font-bold text-white shadow-md",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        })
        .bindPopup(popup)
        .addTo(locations);
    }
  }, [groups, instance]);

  return (
    <>
      <div
        ref={container}
        role="region"
        aria-label={`Carte des villes à moins de ${radiusKm} km de ${origin.name}`}
        hidden={mapUnavailable}
        className="isolate z-0 h-64 overflow-hidden rounded-xl bg-[#17122d] sm:h-96 [&_.leaflet-tile-pane]:[filter:invert(0.93)_hue-rotate(180deg)_saturate(0.7)_brightness(0.84)]"
      />
      {(mapUnavailable || tilesUnavailable) && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Le fond de carte est indisponible. Ouvrez la vue Liste pour consulter les profils.
        </p>
      )}
    </>
  );
}
