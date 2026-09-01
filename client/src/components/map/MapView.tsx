import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Worker, Cooperative } from '../../types';
import { ShieldCheck, Star, Zap, Phone, CheckCircle2 } from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

// Fix standard Leaflet icon paths in React Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const customerIcon = createCustomIcon('#2563eb', '👤');
const workerIcon = createCustomIcon('#059669', '🔧');
const coopIcon = createCustomIcon('#d97706', '🏛️');

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  workers?: Worker[];
  cooperatives?: Cooperative[];
  customerLocation?: [number, number];
  serviceRadiusKm?: number;
  onSelectWorker?: (worker: Worker) => void;
  onViewTrustProfile?: (worker: Worker) => void;
  height?: string;
}

// Helper to auto-recenter map when coordinates change
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  workers = [],
  cooperatives = [],
  customerLocation,
  serviceRadiusKm = 10,
  onSelectWorker,
  onViewTrustProfile,
  height = '500px',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className="w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-medium"
      >
        Loading Map View...
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer Location Pin */}
        {customerLocation && (
          <>
            <Marker position={customerLocation} icon={customerIcon}>
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-0.5">Your Location</div>
                  <p className="text-slate-500">Service delivery destination</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={customerLocation}
              radius={serviceRadiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.08,
                dashArray: '5, 5',
              }}
            />
          </>
        )}

        {/* Cooperative HQs */}
        {cooperatives.map((coop) => (
          <Marker key={coop.id} position={[coop.lat, coop.lng]} icon={coopIcon}>
            <Popup>
              <div className="p-1 text-xs max-w-xs">
                <div className="flex items-center gap-1 text-amber-600 font-bold mb-1">
                  <span>🏛️ Registered Society</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{coop.name}</div>
                <div className="text-[11px] text-slate-500 font-medium my-1">
                  Reg: {coop.registration_no}
                </div>
                <p className="text-slate-600 text-[11px] mb-2">{coop.address}</p>
                <div className="bg-amber-50 text-amber-900 px-2 py-1 rounded text-[10px] font-semibold">
                  Service Radius: {coop.service_radius_km} km
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Worker Pins */}
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            position={[worker.current_lat || center[0], worker.current_lng || center[1]]}
            icon={createCustomIcon(
              worker.is_emergency_ready === 1 ? '#d97706' : '#059669',
              worker.skills?.[0]?.category_name ? worker.skills[0].category_name[0] : '🔧'
            )}
          >
            <Popup>
              <div className="p-1 text-xs max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={worker.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                    alt={worker.name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">{worker.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      {worker.skills?.[0]?.skill_name || 'Cooperative Craftsman'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1 mb-2 border-y border-slate-100 text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {worker.rating?.toFixed(1) || '4.9'}
                  </span>
                  <span className="text-slate-500">• {worker.total_jobs || 0} jobs</span>
                  {worker.distance_km && (
                    <span className="text-emerald-700 font-semibold">• {worker.distance_km} km</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <TrustBadge type="coop" size="sm" label="Coop Member" />
                  <TrustBadge type="skill" size="sm" label="Skill Verified" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onViewTrustProfile && (
                    <button
                      onClick={() => onViewTrustProfile(worker)}
                      className="flex-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      Trust Sheet
                    </button>
                  )}
                  {onSelectWorker && (
                    <button
                      onClick={() => onSelectWorker(worker)}
                      className="flex-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
