import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Polygon,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Types for EONET API
interface DisasterEvent {
  id: string;
  title: string;
  categories: { id: string; title: string }[];
  sources: { id: string; url: string }[];
  geometry: {
    date: string;
    type: string;
    coordinates: number[];
  }[];
}

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";
const REFRESH_INTERVAL_MS = 60_000; // 1 minute

// Category colors
const getColor = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes("wildfire")) return "orange";
  if (cat.includes("flood")) return "blue";
  if (cat.includes("earthquake")) return "purple";
  if (cat.includes("storm")) return "green";
  if (cat.includes("volcano")) return "red";
  return "gray";
};

// Circle radius by category (meters)
const getRadius = (category: string): number => {
  const cat = category.toLowerCase();
  if (cat.includes("wildfire")) return 40000;
  if (cat.includes("flood")) return 60000;
  if (cat.includes("earthquake")) return 30000;
  if (cat.includes("storm")) return 70000;
  if (cat.includes("volcano")) return 50000;
  return 30000;
};

const DisasterMap: React.FC = () => {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch disaster data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(EONET_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      setEvents(json.events || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          json.events.flatMap((e: DisasterEvent) =>
            e.categories.map((c) => c.title)
          )
        )
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setError(err instanceof Error ? err.message : "Failed to fetch disaster data");
    } finally {
      setLoading(false);
    }
  };

  // Initial + interval fetch
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading disaster data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading disaster data</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filter Controls */}
      <div className="bg-background border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted-foreground mb-4">
            Real-time disaster tracking powered by NASA EONET API
          </p>
          
          {/* Filter Dropdown */}
          <div className="flex items-center gap-4">
            <label className="font-medium">Filter by Disaster Type:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Disasters</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground">
              {events.filter(e => filter === "all" || e.categories[0]?.title === filter).length} active disasters
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[20.5937, 78.9629]} // Center on India
          zoom={3}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Disasters">
              <LayerGroup>
                {events.map((event) => {
                  const category = event.categories[0]?.title || "Unknown";
                  if (filter !== "all" && filter !== category) return null;

                  const latest = event.geometry[event.geometry.length - 1];
                  if (!latest) return null;

                  const coords = latest.coordinates;
                  // Handle [lon, lat] order
                  const lat = coords[1];
                  const lng = coords[0];

                  if (latest.type === "Point") {
                    return (
                      <Circle
                        key={event.id}
                        center={[lat, lng]}
                        pathOptions={{
                          color: getColor(category),
                          fillColor: getColor(category),
                          fillOpacity: 0.5,
                        }}
                        radius={getRadius(category)}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <p className="mb-2">
                              <span className="font-medium">Category:</span> {category}
                            </p>
                            <p className="mb-2">
                              <span className="font-medium">Date:</span> {new Date(latest.date).toLocaleDateString()}
                            </p>
                            {event.sources[0]?.url && (
                              <a
                                href={event.sources[0].url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                More Information →
                              </a>
                            )}
                          </div>
                        </Popup>
                      </Circle>
                    );
                  } else if (latest.type === "Polygon") {
                    const polygonCoords = (latest.coordinates[0] as unknown as number[][]).map(
                      (c: number[]) => [c[1], c[0]] as [number, number] // convert [lon, lat] → [lat, lon]
                    );
                    return (
                      <Polygon
                        key={event.id}
                        positions={polygonCoords}
                        pathOptions={{
                          color: getColor(category),
                          fillColor: getColor(category),
                          fillOpacity: 0.5,
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <p className="mb-2">
                              <span className="font-medium">Category:</span> {category}
                            </p>
                            <p className="mb-2">
                              <span className="font-medium">Date:</span> {new Date(latest.date).toLocaleDateString()}
                            </p>
                            {event.sources[0]?.url && (
                              <a
                                href={event.sources[0].url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                More Information →
                              </a>
                            )}
                          </div>
                        </Popup>
                      </Polygon>
                    );
                  }
                  return null;
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-background border-t border-border p-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-medium mb-2">Disaster Type Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Wildfires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Floods</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Earthquakes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Storms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Volcanoes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;
