"use client";
import type { Feature } from "geojson";
import {
  CctvIcon,
  CctvOffIcon,
  MapPinIcon,
  MinusIcon,
  NavigationIcon,
  PlusIcon,
  ServerIcon,
  ServerOffIcon,
} from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MapMarker } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

const WORKER_URL = "/maplibre-gl-worker.mjs";
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const BUILDINGS_LAYER = "building-3d";
const GRID_SOURCE = "grid";
const GRID_LINES = "grid-lines";
const GRID_LABELS = "grid-labels";
const ORBIT_DEG_PER_MS = 0.01;
const ZOOM = { group: 13, server: 16, device: 17.5 } as const;
export const markerKey = (marker: MapMarker) => `${marker.type}:${marker.id}`;

const isActive = (marker: MapMarker) =>
  marker.type === "server"
    ? marker.isActive
    : marker.type === "device"
      ? marker.isEnabled
      : true;

const iconOf = (marker: MapMarker) =>
  marker.type === "group"
    ? MapPinIcon
    : marker.type === "server"
      ? isActive(marker)
        ? ServerIcon
        : ServerOffIcon
      : isActive(marker)
        ? CctvIcon
        : CctvOffIcon;

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const mix = (first: string, percent: number, second: string) =>
  `color-mix(in oklch, ${cssVar(first)} ${percent}%, ${cssVar(second)})`;

const resolveColor = (css: string) => {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return css;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = css;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
};

const tokenColor = (name: string) => resolveColor(cssVar(name));

const themeColors = () => ({
  background: tokenColor("--background"),
  land: tokenColor("--card"),
  water: resolveColor(mix("--primary", 40, "--background")),
  road: resolveColor(mix("--primary", 25, "--accent")),
  majorRoad: resolveColor(mix("--primary", 65, "--accent")),
  border: tokenColor("--border"),
  text: tokenColor("--muted-foreground"),
  building: resolveColor(mix("--primary", 35, "--accent")),
  grid: resolveColor(mix("--primary", 45, "transparent")),
});

const applyTheme = (map: MapLibreMap) => {
  const color = themeColors();
  for (const layer of map.getStyle().layers) {
    const { id } = layer;
    if (id.startsWith("grid-")) continue;
    switch (layer.type) {
      case "background":
        map.setPaintProperty(id, "background-color", color.background);
        break;
      case "fill":
        map.setPaintProperty(id, "fill-pattern", undefined);
        map.setPaintProperty(
          id,
          "fill-color",
          /water/.test(id) ? color.water : color.land,
        );
        map.setPaintProperty(id, "fill-outline-color", color.border);
        break;
      case "line":
        map.setPaintProperty(
          id,
          "line-color",
          /boundary|admin/.test(id)
            ? color.border
            : /motorway|trunk|primary/.test(id)
              ? color.majorRoad
              : /water/.test(id)
                ? color.water
                : color.road,
        );
        break;
      case "fill-extrusion":
        map.setPaintProperty(id, "fill-extrusion-color", color.building);
        break;
      case "symbol":
        map.setPaintProperty(id, "text-color", color.text);
        map.setPaintProperty(id, "text-halo-color", color.background);
        map.setPaintProperty(id, "icon-opacity", 0.4);
        break;
      case "hillshade":
      case "raster":
        map.setLayoutProperty(id, "visibility", "none");
        break;
    }
  }
  map.setPaintProperty(GRID_LINES, "line-color", color.grid);
  map.setPaintProperty(GRID_LABELS, "text-color", color.text);
  map.setPaintProperty(GRID_LABELS, "text-halo-color", color.background);
};

const GRID_STEPS = [10, 5, 1, 0.5, 0.1, 0.05, 0.01, 0.005, 0.001];
const GRID_PX = 140;

const gridStep = (zoom: number) => {
  const target = (360 / (512 * 2 ** zoom)) * GRID_PX;
  return GRID_STEPS.findLast((step) => step >= target) ?? GRID_STEPS[0];
};

const degrees = (value: number, step: number, axis: "lat" | "lng") => {
  const digits = Math.max(0, Math.ceil(-Math.log10(step)));
  const hemisphere =
    axis === "lat" ? (value < 0 ? "S" : "N") : value < 0 ? "W" : "E";
  return `${Math.abs(value).toFixed(digits)}°${hemisphere}`;
};

const updateGrid = (map: MapLibreMap) => {
  const source = map.getSource<GeoJSONSource>(GRID_SOURCE);
  if (!source) return;
  const step = gridStep(map.getZoom());
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = Math.max(bounds.getSouth(), -85);
  const north = Math.min(bounds.getNorth(), 85);
  const features: Feature[] = [];
  const round = (value: number) => Math.round(value / step) * step;
  const inset = (east - west) * 0.03;
  const insetLat = (north - south) * 0.04;
  for (let lng = Math.ceil(west / step); lng * step <= east; lng++) {
    const value = round(lng * step);
    features.push(
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [value, south],
            [value, north],
          ],
        },
      },
      {
        type: "Feature",
        properties: { label: degrees(value, step, "lng") },
        geometry: { type: "Point", coordinates: [value, north - insetLat] },
      },
    );
  }
  for (let lat = Math.ceil(south / step); lat * step <= north; lat++) {
    const value = round(lat * step);
    features.push(
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [west, value],
            [east, value],
          ],
        },
      },
      {
        type: "Feature",
        properties: { label: degrees(value, step, "lat") },
        geometry: { type: "Point", coordinates: [west + inset, value] },
      },
    );
  }
  source.setData({ type: "FeatureCollection", features });
};

const addGrid = (map: MapLibreMap) => {
  map.addSource(GRID_SOURCE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: GRID_LINES,
    source: GRID_SOURCE,
    type: "line",
    filter: ["==", ["geometry-type"], "LineString"],
    paint: { "line-width": 1, "line-dasharray": [2, 2] },
  });
  map.addLayer({
    id: GRID_LABELS,
    source: GRID_SOURCE,
    type: "symbol",
    filter: ["==", ["geometry-type"], "Point"],
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 10,
      "text-allow-overlap": true,
    },
    paint: { "text-halo-width": 1.5 },
  });
  map.on("move", () => updateGrid(map));
  updateGrid(map);
};

const addBuildings = (map: MapLibreMap) => {
  if (map.getLayer(BUILDINGS_LAYER)) map.removeLayer(BUILDINGS_LAYER);
  const layers = map.getStyle().layers;
  const labelLayer = layers.find(
    (layer) => layer.type === "symbol" && layer.layout?.["text-field"],
  );
  map.addLayer(
    {
      id: BUILDINGS_LAYER,
      source: "openmaptiles",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 14,
      filter: ["!=", ["get", "hide_3d"], true],
      paint: {
        "fill-extrusion-color": tokenColor("--accent"),
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          16,
          ["coalesce", ["get", "render_height"], 6],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          16,
          ["coalesce", ["get", "render_min_height"], 0],
        ],
        "fill-extrusion-opacity": 0.85,
      },
    },
    labelLayer?.id,
  );
};

export const MapCanvas = ({
  markers,
  selectedKey,
  onSelect,
  isDraggable,
  isPlacing,
  onPlace,
  onMove,
  popup,
}: {
  markers: MapMarker[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  isDraggable: boolean;
  isPlacing: boolean;
  onPlace: (latitude: number, longitude: number) => void;
  onMove: (marker: MapMarker, latitude: number, longitude: number) => void;
  popup: ReactNode | null;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const ready = useRef<Promise<MapLibreMap> | null>(null);
  const pins = useRef<Marker[]>([]);
  const [pinElements, setPinElements] = useState<
    { marker: MapMarker; element: HTMLElement }[]
  >([]);
  const orbit = useRef<number | null>(null);
  const [bearing, setBearing] = useState(0);
  const fitted = useRef(false);
  const [popupElement, setPopupElement] = useState<HTMLElement | null>(null);
  const hasPopup = popup !== null;
  const onSelectRef = useRef(onSelect);
  const onPlaceRef = useRef(onPlace);
  const onMoveRef = useRef(onMove);
  const isPlacingRef = useRef(isPlacing);
  const markersRef = useRef(markers);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onPlaceRef.current = onPlace;
    onMoveRef.current = onMove;
    isPlacingRef.current = isPlacing;
    markersRef.current = markers;
  });
  const stopOrbit = () => {
    if (orbit.current !== null) cancelAnimationFrame(orbit.current);
    orbit.current = null;
  };
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    let disposed = false;
    ready.current = import("maplibre-gl").then((maplibregl) => {
      maplibregl.setWorkerUrl(WORKER_URL);
      const instance = new maplibregl.Map({
        container: node,
        style: STYLE_URL,
        center: [106.8456, -6.2088],
        zoom: 11,
        attributionControl: false,
      });
      instance.on("rotate", () => setBearing(instance.getBearing()));
      instance.on("load", () => {
        addGrid(instance);
        addBuildings(instance);
        applyTheme(instance);
      });
      const observer = new MutationObserver(() => {
        if (instance.isStyleLoaded()) applyTheme(instance);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      instance.once("remove", () => observer.disconnect());
      for (const event of ["mousedown", "touchstart", "wheel"] as const) {
        instance.on(event, stopOrbit);
      }
      instance.on("click", (event) => {
        if (isPlacingRef.current) {
          onPlaceRef.current(event.lngLat.lat, event.lngLat.lng);
        } else {
          onSelectRef.current(null);
        }
      });
      if (disposed) instance.remove();
      else map.current = instance;
      return instance;
    });
    return () => {
      disposed = true;
      stopOrbit();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    void ready.current?.then(async (instance) => {
      if (cancelled || map.current !== instance) return;
      const maplibregl = await import("maplibre-gl");
      for (const pin of pins.current) pin.remove();
      const elements: { marker: MapMarker; element: HTMLElement }[] = [];
      pins.current = markers.map((marker) => {
        const element = document.createElement("div");
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(markerKey(marker));
        });
        elements.push({ marker, element });
        const pin = new maplibregl.Marker({
          element,
          draggable: isDraggable,
          anchor: "bottom",
          offset: [0, -6],
        })
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(instance);
        pin.on("dragend", () => {
          const { lat, lng } = pin.getLngLat();
          onMoveRef.current(marker, lat, lng);
        });
        return pin;
      });
      setPinElements(elements);
      if (!fitted.current && markers.length > 1) {
        fitted.current = true;
        const bounds = markers.reduce(
          (box, marker) => box.extend([marker.longitude, marker.latitude]),
          new maplibregl.LngLatBounds(
            [markers[0].longitude, markers[0].latitude],
            [markers[0].longitude, markers[0].latitude],
          ),
        );
        instance.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 15 });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [markers, isDraggable]);
  useEffect(() => {
    const marker = markersRef.current.find((m) => markerKey(m) === selectedKey);
    if (!hasPopup || !marker) return;
    let cancelled = false;
    let remove: (() => void) | null = null;
    void ready.current?.then(async (instance) => {
      if (cancelled || map.current !== instance) return;
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;
      const element = document.createElement("div");
      const popupInstance = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        maxWidth: "none",
        anchor: "bottom",
        offset: 44,
        className: "map-popup",
      })
        .setDOMContent(element)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(instance);
      setPopupElement(element);
      remove = () => {
        popupInstance.remove();
        setPopupElement(null);
      };
    });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [selectedKey, hasPopup]);
  useEffect(() => {
    stopOrbit();
    if (!selectedKey) return;
    const marker = markersRef.current.find((m) => markerKey(m) === selectedKey);
    if (!marker) return;
    let cancelled = false;
    void ready.current?.then((instance) => {
      if (cancelled || map.current !== instance) return;
      const isDevice = marker.type === "device";
      instance.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: ZOOM[marker.type],
        pitch: isDevice ? 60 : 30,
        speed: 1.2,
        essential: true,
      });
      if (!isDevice) return;
      instance.once("moveend", () => {
        if (cancelled) return;
        const startedAt = performance.now();
        const startBearing = instance.getBearing();
        const frame = (now: number) => {
          instance.rotateTo(
            (startBearing + (now - startedAt) * ORBIT_DEG_PER_MS) % 360,
            { duration: 0 },
          );
          orbit.current = requestAnimationFrame(frame);
        };
        orbit.current = requestAnimationFrame(frame);
      });
    });
    return () => {
      cancelled = true;
      stopOrbit();
    };
  }, [selectedKey]);
  const runOnMap = (action: (instance: MapLibreMap) => void) => {
    stopOrbit();
    void ready.current?.then(action);
  };
  return (
    <div
      className={cn(
        "relative min-h-96 flex-1",
        isPlacing && "[&_.maplibregl-canvas]:cursor-crosshair",
      )}
    >
      <div className="absolute inset-0">
        <div ref={container} className="size-full" />
      </div>
      {popupElement && popup && createPortal(popup, popupElement)}
      {pinElements.map(({ marker, element }) => {
        const Icon = iconOf(marker);
        const key = markerKey(marker);
        return createPortal(
          <div
            role="button"
            aria-label={marker.name}
            aria-pressed={key === selectedKey}
            title={marker.name}
            className={cn(
              "relative flex size-8 cursor-grab touch-none items-center justify-center active:cursor-grabbing",
              isActive(marker)
                ? "text-primary-foreground"
                : "text-muted-foreground",
              key === selectedKey && "z-10 scale-110",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 rotate-45 rounded-full rounded-br-none border-2 transition-colors",
                isActive(marker) ? "bg-primary" : "bg-secondary",
                key === selectedKey ? "border-foreground" : "border-background",
              )}
            />
            <Icon className="relative size-4" />
          </div>,
          element,
          key,
        );
      })}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => runOnMap((instance) => instance.zoomIn())}
        >
          <PlusIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => runOnMap((instance) => instance.zoomOut())}
        >
          <MinusIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Reset north and tilt"
          title="Reset north and tilt"
          onClick={() => runOnMap((instance) => instance.resetNorthPitch())}
        >
          <NavigationIcon style={{ rotate: `${-bearing}deg` }} />
        </Button>
      </div>
    </div>
  );
};
