import { MapPin, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAcceptParcel,
  useAllParcels,
  useAllTrips,
} from "../hooks/useQueries";

// ─── India viewport bounds ───────────────────────────────────────────────────
const MAP_LAT_MIN = 7.5;
const MAP_LAT_MAX = 37.5;
const MAP_LON_MIN = 67.5;
const MAP_LON_MAX = 97.5;

function latLonToPercent(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN)) * 100;
  // y is inverted: higher lat = higher on screen
  const y = ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * 100;
  return { x, y };
}

// ─── City coordinates ─────────────────────────────────────────────────────────
const CITY_COORDS: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Surat: [21.1702, 72.8311],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882],
  Indore: [22.7196, 75.8577],
  Thane: [19.2183, 72.9781],
  Bhopal: [23.2599, 77.4126],
  Visakhapatnam: [17.6868, 83.2185],
  Patna: [25.5941, 85.1376],
  Vadodara: [22.3072, 73.1812],
  Ghaziabad: [28.6692, 77.4538],
  Ludhiana: [30.901, 75.8573],
  Agra: [27.1767, 78.0081],
  Nashik: [19.9975, 73.7898],
  Meerut: [28.9845, 77.7064],
  Rajkot: [22.3039, 70.8022],
  Varanasi: [25.3176, 82.9739],
  Amritsar: [31.634, 74.8723],
  Coimbatore: [11.0168, 76.9558],
  Kochi: [9.9312, 76.2673],
  Chandigarh: [30.7333, 76.7794],
  Guwahati: [26.1445, 91.7362],
  Bhubaneswar: [20.2961, 85.8245],
  Noida: [28.5355, 77.391],
};

function getCityCoords(city: string): [number, number] | null {
  if (!city) return null;
  const normalized = city.trim();
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];
  const key = Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase() === normalized.toLowerCase(),
  );
  return key ? CITY_COORDS[key] : null;
}

function haversineKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatSecondsAgo(secs: number): string {
  if (secs < 60) return `${secs}s ago`;
  return `${Math.floor(secs / 60)}m ago`;
}

// ─── India SVG outline (simplified) ─────────────────────────────────────────
// Approximate polygon path for India within our viewport (% coords)
const INDIA_BORDER_POINTS: Array<[number, number]> = [
  // Lat, Lon in degrees — these are the simplified India coastline/border
  [37.0, 75.5],
  [36.5, 77.0],
  [35.5, 78.5],
  [34.5, 76.5],
  [33.5, 75.0],
  [33.0, 77.5],
  [32.5, 79.5],
  [32.0, 80.5],
  [30.5, 79.5],
  [30.0, 80.5],
  [29.5, 81.0],
  [29.0, 80.0],
  [28.5, 81.5],
  [27.5, 88.5],
  [26.5, 89.5],
  [26.0, 90.0],
  [25.5, 91.5],
  [24.0, 92.0],
  [23.5, 93.5],
  [23.0, 94.0],
  [22.5, 93.0],
  [22.0, 93.5],
  [21.5, 92.5],
  [22.0, 91.5],
  [21.5, 91.0],
  [21.0, 92.5],
  [20.5, 92.0],
  [21.0, 87.5],
  [20.0, 86.5],
  [19.5, 85.0],
  [18.5, 84.5],
  [17.5, 83.0],
  [16.5, 82.0],
  [16.0, 81.0],
  [15.5, 80.5],
  [14.5, 80.0],
  [13.5, 80.5],
  [13.0, 80.2],
  [11.0, 79.8],
  [10.5, 79.5],
  [10.0, 78.5],
  [9.0, 77.5],
  [8.5, 77.0],
  [8.5, 76.5],
  [9.0, 76.0],
  [10.0, 76.5],
  [11.0, 75.5],
  [12.0, 75.0],
  [14.0, 74.5],
  [15.0, 74.0],
  [16.0, 73.5],
  [17.5, 73.0],
  [18.0, 73.0],
  [19.0, 72.8],
  [20.0, 72.5],
  [21.0, 71.5],
  [22.0, 69.0],
  [22.5, 68.5],
  [23.0, 68.0],
  [24.0, 68.5],
  [24.5, 68.0],
  [25.0, 68.5],
  [25.5, 70.5],
  [26.0, 70.5],
  [27.0, 70.0],
  [28.0, 70.5],
  [29.0, 70.5],
  [30.0, 70.0],
  [31.0, 70.5],
  [32.0, 74.0],
  [32.5, 75.5],
  [33.5, 75.0],
  [34.5, 76.5],
  [35.5, 78.5],
  [36.5, 77.0],
  [37.0, 75.5],
];

function indiaPathD(): string {
  const pts = INDIA_BORDER_POINTS.map(([lat, lon]) =>
    latLonToPercent(lat, lon),
  );
  return `${pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ")} Z`;
}

type MarkerInfo = {
  id: string;
  lat: number;
  lon: number;
  color: string;
  label: string;
  route: string;
  type: "parcel" | "trip";
  status?: string;
  contact?: string;
  idx: number;
  matchedTripIdx?: number;
};

export function MapPage() {
  const {
    data: parcels = [],
    isLoading: parcelsLoading,
    refetch: refetchParcels,
  } = useAllParcels();
  const {
    data: trips = [],
    isLoading: tripsLoading,
    refetch: refetchTrips,
  } = useAllTrips();
  const acceptParcel = useAcceptParcel();

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // One-shot geolocation on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          /* silently skip */
        },
        { timeout: 8000, maximumAge: 300000 },
      );
    }
  }, []);

  // Tick seconds-ago counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshed.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedMarker(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedMarker(null);
    await Promise.all([refetchParcels(), refetchTrips()]);
    setLastRefreshed(new Date());
    setSecondsAgo(0);
    setIsRefreshing(false);
    toast.success("Map refreshed");
  };

  // Build marker list
  const markers: MarkerInfo[] = [];
  for (let i = 0; i < parcels.length; i++) {
    const parcel = parcels[i];
    const coords = getCityCoords(parcel.pickupLocation?.city ?? "");
    if (!coords) continue;
    const statusKey = parcel.status ? Object.keys(parcel.status)[0] : "";
    // Find a matching trip index
    const matchedTripIdx = trips.findIndex(
      (trip) =>
        parcel.pickupLocation.city.toLowerCase() ===
          trip.fromLocation.city.toLowerCase() &&
        parcel.dropLocation.city.toLowerCase() ===
          trip.toLocation.city.toLowerCase(),
    );
    markers.push({
      id: `parcel-${i}`,
      lat: coords[0],
      lon: coords[1],
      color: "#f97316",
      label: parcel.parcelType ?? "Parcel",
      route: `${parcel.pickupLocation?.city ?? "?"} → ${parcel.dropLocation?.city ?? "?"}`,
      type: "parcel",
      status: statusKey,
      contact: String(parcel.sender),
      idx: i,
      matchedTripIdx: matchedTripIdx >= 0 ? matchedTripIdx : undefined,
    });
  }
  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    const coords = getCityCoords(trip.fromLocation?.city ?? "");
    if (!coords) continue;
    markers.push({
      id: `trip-${i}`,
      lat: coords[0],
      lon: coords[1],
      color: "#3b82f6",
      label: "Traveler",
      route: `${trip.fromLocation?.city ?? "?"} → ${trip.toLocation?.city ?? "?"}`,
      type: "trip",
      contact: String(trip.traveler),
      idx: i,
    });
  }

  // Compute matched pairs for drawing lines
  type MatchedLinePair = {
    parcelPos: { x: number; y: number };
    tripPos: { x: number; y: number };
    key: string;
    parcelMarkerId: string;
    tripMarkerId: string;
  };
  const matchedLinePairs: MatchedLinePair[] = [];
  const matchedParcelIds = new Set<string>();
  const matchedTripIds = new Set<string>();

  for (const parcelMarker of markers.filter((m) => m.type === "parcel")) {
    if (parcelMarker.matchedTripIdx === undefined) continue;
    const tripMarker = markers.find(
      (m) => m.type === "trip" && m.idx === parcelMarker.matchedTripIdx,
    );
    if (!tripMarker) continue;
    const parcelPos = latLonToPercent(parcelMarker.lat, parcelMarker.lon);
    const tripPos = latLonToPercent(tripMarker.lat, tripMarker.lon);
    matchedLinePairs.push({
      parcelPos,
      tripPos,
      key: `match-${parcelMarker.id}-${tripMarker.id}`,
      parcelMarkerId: parcelMarker.id,
      tripMarkerId: tripMarker.id,
    });
    matchedParcelIds.add(parcelMarker.id);
    matchedTripIds.add(tripMarker.id);
  }

  const hasMatches = matchedLinePairs.length > 0;

  // Nearby count (500 km)
  const nearbyCount = userCoords
    ? markers.filter((m) => haversineKm(userCoords, [m.lat, m.lon]) <= 500)
        .length
    : 0;

  const isLoading = parcelsLoading || tripsLoading;
  const subtitleText = userCoords
    ? `${nearbyCount} active nearby`
    : "Parcels & Travelers";

  const indiaPath = indiaPathD();

  const handleAccept = useCallback(
    async (idx: number) => {
      try {
        await acceptParcel.mutateAsync(BigInt(idx));
        toast.success("Parcel accepted!");
        setSelectedMarker(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to accept parcel");
      }
    },
    [acceptParcel],
  );

  return (
    <div className="flex flex-col h-screen bg-charcoal">
      {/* Pulse keyframe */}
      <style>{`
        @keyframes carrygo-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          50%  { transform: scale(1.5); opacity: 0.6; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .you-pulse { animation: carrygo-pulse 1.8s ease-in-out infinite; }
        @keyframes carrygo-dot-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .you-dot { animation: carrygo-dot-ping 1.8s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="bg-charcoal text-white px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-carry-blue flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <title>Map</title>
            <path
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Map</h1>
          <p className="text-xs text-white/60">{subtitleText}</p>
        </div>
        <button
          type="button"
          data-ocid="map.refresh_button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all"
          aria-label="Refresh map"
        >
          <RefreshCw
            size={16}
            className={`text-white/80 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </header>

      {/* Last refreshed */}
      <div className="px-4 pb-2 flex-shrink-0">
        <span className="text-xs text-white/30">
          Updated {secondsAgo === 0 ? "just now" : formatSecondsAgo(secondsAgo)}
        </span>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        {isLoading ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "#0f172a" }}
            data-ocid="map.loading_state"
          >
            <div className="w-10 h-10 border-4 border-carry-blue border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-white/60 font-medium">
              Loading map data...
            </span>
          </div>
        ) : (
          <>
            {/* Active nearby chip */}
            {userCoords && nearbyCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(34,197,94,0.4)",
                  borderRadius: "20px",
                  padding: "5px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(6px)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
                data-ocid="map.success_state"
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {nearbyCount} active nearby
              </div>
            )}

            {/* SVG Map */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                position: "relative",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Map of India showing parcel and traveler locations"
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                {/* Grid lines */}
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                  <line
                    key={`hg-${v}`}
                    x1="0"
                    y1={v}
                    x2="100"
                    y2={v}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.3"
                  />
                ))}
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                  <line
                    key={`vg-${v}`}
                    x1={v}
                    y1="0"
                    x2={v}
                    y2="100"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.3"
                  />
                ))}

                {/* India border */}
                <path
                  d={indiaPath}
                  fill="rgba(30,58,138,0.18)"
                  stroke="rgba(99,149,255,0.35)"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />

                {/* ── Matched lines (drawn BEFORE markers) ────────────── */}
                {matchedLinePairs.map((pair) => (
                  <line
                    key={pair.key}
                    x1={pair.parcelPos.x}
                    y1={pair.parcelPos.y}
                    x2={pair.tripPos.x}
                    y2={pair.tripPos.y}
                    stroke="#f59e0b"
                    strokeWidth="0.6"
                    strokeDasharray="1.5 1"
                    opacity="0.8"
                  />
                ))}

                {/* Trip markers */}
                {markers
                  .filter((m) => m.type === "trip")
                  .map((m) => {
                    const pos = latLonToPercent(m.lat, m.lon);
                    const isNearby =
                      userCoords &&
                      haversineKm(userCoords, [m.lat, m.lon]) <= 500;
                    const isMatched = matchedTripIds.has(m.id);
                    return (
                      <g key={m.id}>
                        {isNearby && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="2.5"
                            fill="rgba(59,130,246,0.2)"
                            stroke="rgba(59,130,246,0.5)"
                            strokeWidth="0.4"
                          />
                        )}
                        {isMatched && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="2.2"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="0.6"
                          />
                        )}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="1.4"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="0.5"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedMarker(m)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setSelectedMarker(m)
                          }
                          tabIndex={0}
                        />
                      </g>
                    );
                  })}

                {/* Parcel markers */}
                {markers
                  .filter((m) => m.type === "parcel")
                  .map((m) => {
                    const pos = latLonToPercent(m.lat, m.lon);
                    const isNearby =
                      userCoords &&
                      haversineKm(userCoords, [m.lat, m.lon]) <= 500;
                    const isMatched = matchedParcelIds.has(m.id);
                    return (
                      <g key={m.id}>
                        {isNearby && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="2.5"
                            fill="rgba(249,115,22,0.2)"
                            stroke="rgba(249,115,22,0.5)"
                            strokeWidth="0.4"
                          />
                        )}
                        {isMatched && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="2.2"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="0.6"
                          />
                        )}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="1.4"
                          fill="#f97316"
                          stroke="white"
                          strokeWidth="0.5"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedMarker(m)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setSelectedMarker(m)
                          }
                          tabIndex={0}
                        />
                      </g>
                    );
                  })}

                {/* Selected marker highlight */}
                {selectedMarker &&
                  (() => {
                    const pos = latLonToPercent(
                      selectedMarker.lat,
                      selectedMarker.lon,
                    );
                    return (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="3"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.7"
                        opacity="0.8"
                      />
                    );
                  })()}
              </svg>

              {/* User location dot (HTML overlay for animation) */}
              {userCoords &&
                (() => {
                  const pos = latLonToPercent(userCoords[0], userCoords[1]);
                  // Clamp to visible area
                  const cx = Math.max(2, Math.min(98, pos.x));
                  const cy = Math.max(2, Math.min(98, pos.y));
                  return (
                    <div
                      className="you-dot"
                      style={{
                        position: "absolute",
                        left: `calc(${cx}% - 8px)`,
                        top: `calc(${cy}% - 8px)`,
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2.5px solid white",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                      title="You are here"
                    />
                  );
                })()}

              {/* Popup */}
              {selectedMarker &&
                (() => {
                  const pos = latLonToPercent(
                    selectedMarker.lat,
                    selectedMarker.lon,
                  );
                  const cx = Math.max(10, Math.min(80, pos.x));
                  const cy = Math.max(5, Math.min(70, pos.y));
                  return (
                    <div
                      ref={popupRef}
                      style={{
                        position: "absolute",
                        left: `${cx}%`,
                        top: `${cy + 3}%`,
                        transform: "translateX(-40%)",
                        zIndex: 500,
                        background: "rgba(15,23,42,0.97)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        minWidth: "170px",
                        maxWidth: "220px",
                        color: "white",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                      data-ocid="map.popover"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: selectedMarker.color,
                            flexShrink: 0,
                            display: "inline-block",
                          }}
                        />
                        <span style={{ fontWeight: 700, fontSize: "13px" }}>
                          {selectedMarker.type === "parcel" ? "📦" : "🧳"}{" "}
                          {selectedMarker.label}
                        </span>
                        {(matchedParcelIds.has(selectedMarker.id) ||
                          matchedTripIds.has(selectedMarker.id)) && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "9px",
                              fontWeight: 700,
                              background: "#f59e0b",
                              color: "#000",
                              borderRadius: "4px",
                              padding: "1px 5px",
                              letterSpacing: "0.05em",
                            }}
                          >
                            MATCHED
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.55)",
                          marginBottom: "10px",
                        }}
                      >
                        {selectedMarker.route}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {selectedMarker.type === "parcel" &&
                          selectedMarker.status === "requested" && (
                            <button
                              type="button"
                              data-ocid="map.accept_button"
                              onClick={() => handleAccept(selectedMarker.idx)}
                              style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "7px",
                                padding: "5px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Accept
                            </button>
                          )}
                        <a
                          href={`https://wa.me/${selectedMarker.contact}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="map.contact_button"
                          style={{
                            background: "#22c55e",
                            color: "white",
                            borderRadius: "7px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          Contact
                        </a>
                        <button
                          type="button"
                          data-ocid="map.close_button"
                          onClick={() => setSelectedMarker(null)}
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            border: "none",
                            borderRadius: "7px",
                            padding: "5px 8px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })()}

              {/* Legend overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "12px",
                  zIndex: 100,
                  background: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "7px 11px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "white",
                  backdropFilter: "blur(6px)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#3b82f6",
                      display: "inline-block",
                    }}
                  />
                  Travelers
                </span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#f97316",
                      display: "inline-block",
                    }}
                  />
                  Parcels
                </span>
                {hasMatches && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                        display: "inline-block",
                      }}
                    />
                    Matched
                  </span>
                )}
                {userCoords && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                      }}
                    />
                    You
                  </span>
                )}
              </div>

              {/* Marker count badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "12px",
                  zIndex: 100,
                  background: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "7px 11px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(6px)",
                  pointerEvents: "none",
                }}
              >
                <span style={{ color: "#f97316" }}>{parcels.length}</span>{" "}
                parcels &nbsp;·&nbsp;
                <span style={{ color: "#3b82f6" }}>{trips.length}</span> trips
              </div>

              {/* No data state */}
              {markers.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.4)",
                    pointerEvents: "none",
                  }}
                  data-ocid="map.empty_state"
                >
                  <MapPin
                    size={32}
                    style={{ margin: "0 auto 8px", opacity: 0.4 }}
                  />
                  <p style={{ fontSize: "13px" }}>No active parcels or trips</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom nav spacer */}
      <div className="h-16 flex-shrink-0 bg-white" />
    </div>
  );
}
