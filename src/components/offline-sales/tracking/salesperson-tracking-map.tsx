"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SalesPersonTracking } from "@/types/offline-sales";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ExternalLink,
  Phone,
  Clock,
} from "lucide-react";

// Declare Leaflet global type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface SalespersonTrackingMapProps {
  salespersons: SalesPersonTracking[];
  selectedSalesperson: SalesPersonTracking | null;
  onSelectSalesperson: (sp: SalesPersonTracking) => void;
  geoapifyApiKey?: string;
  autoCenterOnSelect?: boolean;
}

export function SalespersonTrackingMap({
  salespersons,
  selectedSalesperson,
  onSelectSalesperson,
  geoapifyApiKey,
}: SalespersonTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerMapRef = useRef<Map<number, any>>(new Map());

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<"osm-bright" | "osm-carto" | "klokantech-basic" | "dark-matter">("osm-bright");
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }

    // Inject CSS
    const existingLink = document.getElementById("leaflet-css");
    if (!existingLink) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Inject JS
    const existingScript = document.getElementById("leaflet-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLeafletLoaded(true));
    } else {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.async = true;
      script.onload = () => {
        setIsLeafletLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, []);

  // Compute tile URL based on key presence and chosen style
  const getTileConfig = useCallback(() => {
    const key = geoapifyApiKey?.trim();
    if (key) {
      return {
        url: `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(key)}`,
        attribution:
          'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        maxZoom: 20,
      };
    }
    // Fallback to standard OpenStreetMap
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    };
  }, [geoapifyApiKey, mapStyle]);

  // Initialize Map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center Kathmandu / Nepal center: [27.7172, 85.3240]
    const defaultCenter: [number, number] = [27.7172, 85.324];
    const defaultZoom = 13;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    // Add zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add tile layer
    const tileConfig = getTileConfig();
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Feature group for markers
    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size once rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletLoaded, getTileConfig]);

  // Update Tile Layer when style or key changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletLoaded) return;
    const L = window.L;
    if (!L) return;

    const tileConfig = getTileConfig();

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle, geoapifyApiKey, isLeafletLoaded, getTileConfig]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !isLeafletLoaded) return;
    const L = window.L;
    if (!L) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();
    markerMapRef.current.clear();

    const validSalespersons = salespersons.filter(
      (sp) => sp.latitude != null && sp.longitude != null && !isNaN(sp.latitude) && !isNaN(sp.longitude)
    );

    validSalespersons.forEach((sp) => {
      const isOnline = sp.is_online || sp.is_active_now || sp.tracking_status?.toUpperCase() === "ONLINE";
      const isSelected = selectedSalesperson?.id === sp.id;

      // Extract initials
      const initials = sp.full_name
        ? sp.full_name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0].toUpperCase())
            .join("")
        : "SP";

      // Muted, high-contrast professional marker
      const markerHtml = `
        <div class="relative cursor-pointer transition-transform transform ${isSelected ? "scale-110 z-50" : "hover:scale-105 z-30"}" style="width: 40px; height: 40px;">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 ${
            isSelected
              ? "bg-slate-900 text-white border-white ring-2 ring-slate-800"
              : isOnline
              ? "bg-slate-800 text-white border-white ring-1 ring-emerald-500/50"
              : "bg-slate-600 text-slate-100 border-white/90"
          }">
            <span class="tracking-tight">${initials}</span>
          </div>
          <!-- Status indicator dot -->
          <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            isOnline ? "bg-emerald-600" : "bg-slate-400"
          }"></span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-salesperson-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([sp.latitude!, sp.longitude!], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isOnline ? 500 : 100,
      });

      // Build Popup content (franchise removed, muted professional styling)
      const googleMapsUrl = `https://www.google.com/maps?q=${sp.latitude},${sp.longitude}`;
      const lastSeenText = sp.last_updated_at ? new Date(sp.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";

      const popupHtml = `
        <div class="p-3 max-w-[230px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2.5">
            <h4 class="font-bold text-sm text-slate-900 truncate">${sp.full_name || sp.username}</h4>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isOnline ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
            }">${isOnline ? "Online" : "Offline"}</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-600">
            ${
              sp.phone_number
                ? `<div class="flex items-center justify-between">
                    <span class="text-slate-500">Phone:</span>
                    <a href="tel:${sp.phone_number}" class="text-slate-900 hover:underline font-semibold">${sp.phone_number}</a>
                  </div>`
                : ""
            }
            ${
              sp.accuracy
                ? `<div class="flex items-center justify-between">
                    <span class="text-slate-500">Accuracy:</span>
                    <span class="font-medium text-slate-700">&plusmn;${sp.accuracy}m</span>
                  </div>`
                : ""
            }
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Last Ping:</span>
              <span class="font-medium text-slate-700">${lastSeenText}</span>
            </div>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-end">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:underline">
              <span>Open Google Maps</span>
              <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup shadow-xl rounded-xl",
      });

      marker.on("click", () => {
        onSelectSalesperson(sp);
      });

      markersGroup.addLayer(marker);
      markerMapRef.current.set(sp.id, marker);
    });

    // If a salesperson is selected, fly to it
    if (selectedSalesperson && selectedSalesperson.latitude && selectedSalesperson.longitude) {
      mapInstanceRef.current.flyTo(
        [selectedSalesperson.latitude, selectedSalesperson.longitude],
        16,
        { duration: 1.2 }
      );
      const marker = markerMapRef.current.get(selectedSalesperson.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [salespersons, selectedSalesperson, isLeafletLoaded, onSelectSalesperson]);

  // Fly to selected salesperson when changed externally
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSalesperson) return;
    if (selectedSalesperson.latitude && selectedSalesperson.longitude) {
      mapInstanceRef.current.flyTo(
        [selectedSalesperson.latitude, selectedSalesperson.longitude],
        16,
        { duration: 1.2 }
      );
      const marker = markerMapRef.current.get(selectedSalesperson.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedSalesperson]);

  const onlineCount = salespersons.filter(
    (s) => s.is_online || s.is_active_now || s.tracking_status?.toUpperCase() === "ONLINE"
  ).length;

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 shadow-sm bg-slate-100 dark:bg-neutral-900">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {!isLeafletLoaded && (
        <div className="absolute inset-0 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Initializing Map Engine...
          </p>
        </div>
      )}

      {/* Layer Style Switcher (only when Geoapify API key is configured) */}
      {geoapifyApiKey && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStyleMenu((prev) => !prev)}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xl bg-white/95 dark:bg-neutral-900/95 shadow-md border border-slate-200/80 dark:border-neutral-800 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800"
            title="Change Map Style"
          >
            <Layers className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline capitalize">{mapStyle.replace("-", " ")}</span>
          </Button>

          {showStyleMenu && (
            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 p-1.5 space-y-1 z-30">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Map Layers
              </div>
              {(["osm-bright", "osm-carto", "klokantech-basic", "dark-matter"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setMapStyle(st);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    mapStyle === st
                      ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {st === "osm-bright"
                    ? "Bright Streets"
                    : st === "osm-carto"
                    ? "Standard Carto"
                    : st === "klokantech-basic"
                    ? "Clean Minimal"
                    : "Dark Mode"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Status Pill Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/95 dark:bg-neutral-900/95 px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-neutral-800 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {onlineCount} Online
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {salespersons.length} Agents
          </span>
        </div>
      </div>

      {/* Selected Salesperson Quick Card (Floating Bottom-Left) */}
      {selectedSalesperson && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 p-4 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 font-bold flex items-center justify-center shrink-0">
                {selectedSalesperson.full_name
                  ? selectedSalesperson.full_name.slice(0, 2).toUpperCase()
                  : "SP"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedSalesperson.full_name}
                  </h4>
                  <Badge
                    className={
                      selectedSalesperson.is_online || selectedSalesperson.is_active_now
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0 h-4 font-semibold"
                        : "bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-1.5 py-0 h-4 font-semibold"
                    }
                  >
                    {selectedSalesperson.is_online || selectedSalesperson.is_active_now
                      ? "Online"
                      : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {selectedSalesperson.accuracy != null ? (
                    <span>GPS Accuracy: &plusmn;{selectedSalesperson.accuracy}m</span>
                  ) : (
                    <span>Field Agent</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {selectedSalesperson.last_updated_at
                  ? new Date(selectedSalesperson.last_updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedSalesperson.phone_number && (
                <a
                  href={`tel:${selectedSalesperson.phone_number}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              )}
              {selectedSalesperson.latitude && selectedSalesperson.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${selectedSalesperson.latitude},${selectedSalesperson.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
