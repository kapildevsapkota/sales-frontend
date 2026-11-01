"use client";

import { useEffect, useRef, useState } from "react";
import { SalesPersonTracking } from "@/types/offline-sales";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Phone,
  Clock,
} from "lucide-react";

// Declare global MapLibre type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    maplibregl: any;
  }
}

interface SalespersonTrackingMapProps {
  salespersons: SalesPersonTracking[];
  selectedSalesperson: SalesPersonTracking | null;
  onSelectSalesperson: (sp: SalesPersonTracking) => void;
}

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export function SalespersonTrackingMap({
  salespersons,
  selectedSalesperson,
  onSelectSalesperson,
}: SalespersonTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerMapRef = useRef<Map<number, any>>(new Map());

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load MapLibre GL JS & CSS dynamically from CDN
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.maplibregl) {
      setIsMapLoaded(true);
      return;
    }

    // Inject CSS
    const existingLink = document.getElementById("maplibre-css");
    if (!existingLink) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    // Inject JS
    const existingScript = document.getElementById("maplibre-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsMapLoaded(true));
    } else {
      const script = document.createElement("script");
      script.id = "maplibre-js";
      script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
      script.async = true;
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, []);

  // Initialize MapLibre Map with OpenFreeMap
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current) return;
    const maplibregl = window.maplibregl;
    if (!maplibregl) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center Kathmandu: [lng, lat] = [85.3240, 27.7172]
    const defaultCenter: [number, number] = [85.324, 27.7172];
    const defaultZoom = 13;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_STYLE,
      center: defaultCenter,
      zoom: defaultZoom,
      attributionControl: {
        compact: true,
      },
    });

    // Add navigation control (zoom in/out) at bottom-right
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      "bottom-right"
    );

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    const maplibregl = window.maplibregl;
    const map = mapInstanceRef.current;
    if (!maplibregl || !map) return;

    // Clear previous markers
    markerMapRef.current.forEach((marker) => marker.remove());
    markerMapRef.current.clear();

    const validSalespersons = salespersons.filter(
      (sp) =>
        sp.latitude != null &&
        sp.longitude != null &&
        !isNaN(sp.latitude) &&
        !isNaN(sp.longitude)
    );

    validSalespersons.forEach((sp) => {
      const isOnline =
        sp.is_online ||
        sp.is_active_now ||
        sp.tracking_status?.toUpperCase() === "ONLINE";
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

      // Create custom DOM element for marker
      const el = document.createElement("div");
      el.className = "custom-salesperson-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative cursor-pointer transition-transform transform ${
          isSelected ? "scale-110 z-50" : "hover:scale-105 z-30"
        }" style="width: 40px; height: 40px;">
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

      el.addEventListener("click", () => {
        onSelectSalesperson(sp);
      });

      // Build Popup content
      const googleMapsUrl = `https://www.google.com/maps?q=${sp.latitude},${sp.longitude}`;
      const lastSeenText = sp.last_updated_at
        ? new Date(sp.last_updated_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently";

      const popupHtml = `
        <div class="p-3 max-w-[230px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2.5">
            <h4 class="font-bold text-sm text-slate-900 truncate">${
              sp.full_name || sp.username
            }</h4>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isOnline
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
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

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: false,
        className: "custom-maplibre-popup shadow-xl rounded-xl",
      }).setHTML(popupHtml);

      // Create and add MapLibre marker: [lng, lat]
      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([sp.longitude!, sp.latitude!])
        .setPopup(popup)
        .addTo(map);

      markerMapRef.current.set(sp.id, marker);
    });

    // If selected, center map on it
    if (
      selectedSalesperson &&
      selectedSalesperson.latitude &&
      selectedSalesperson.longitude
    ) {
      map.flyTo({
        center: [selectedSalesperson.longitude, selectedSalesperson.latitude],
        zoom: 16,
        essential: true,
        duration: 1200,
      });

      const marker = markerMapRef.current.get(selectedSalesperson.id);
      if (marker && !marker.getPopup()?.isOpen()) {
        marker.togglePopup();
      }
    }
  }, [salespersons, selectedSalesperson, isMapLoaded, onSelectSalesperson]);

  // Fly to selected salesperson when changed externally
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSalesperson) return;
    if (selectedSalesperson.latitude && selectedSalesperson.longitude) {
      mapInstanceRef.current.flyTo({
        center: [selectedSalesperson.longitude, selectedSalesperson.latitude],
        zoom: 16,
        essential: true,
        duration: 1200,
      });

      const marker = markerMapRef.current.get(selectedSalesperson.id);
      if (marker && !marker.getPopup()?.isOpen()) {
        marker.togglePopup();
      }
    }
  }, [selectedSalesperson]);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 shadow-sm bg-slate-100 dark:bg-neutral-900">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Loading OpenFreeMap...
          </p>
        </div>
      )}

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
