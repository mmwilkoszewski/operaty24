import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L, { LatLngExpression, Map, Icon } from 'leaflet';
import { Zlecenie, User, UserRole, VoivodeshipData } from '../types';
import { VOIVODESHIP_DATA } from '../constants';

// Helper function to create custom SVG icons for map markers
const createIcon = (color: string): Icon => new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="36">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`
    )}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -36], // Point from which the popup should open relative to the iconAnchor
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

// Define default and selected icons
const defaultIcon = createIcon('#6366f1'); // Tailwind's indigo-500
const selectedIcon = createIcon('#4338ca'); // Tailwind's indigo-700

interface OrderMapProps {
  zlecenia: Zlecenie[];
  selectedZlecenie: Zlecenie | null;
  currentUser: User | null;
}

const OrderMap: React.FC<OrderMapProps> = ({ zlecenia, selectedZlecenie, currentUser }) => {
  const mapRef = useRef<Map | null>(null);
  const polandCenter: LatLngExpression = [52.237049, 21.017532];

  const { mapCenter, mapZoom, voivodeshipGeoJson } = useMemo(() => {
    if (currentUser?.role === UserRole.RZECZOZNAWCA && currentUser.assignedVoivodeships?.[0]) {
      const voivodeshipName = currentUser.assignedVoivodeships[0];
      const data: VoivodeshipData | undefined = VOIVODESHIP_DATA[voivodeshipName];
      if (data) {
        return {
          mapCenter: data.center,
          mapZoom: data.zoom,
          voivodeshipGeoJson: data.geoJson,
        };
      }
    }
    return {
      mapCenter: polandCenter,
      mapZoom: 6,
      voivodeshipGeoJson: null,
    };
  }, [currentUser]);

  useEffect(() => {
    if (mapRef.current && selectedZlecenie && selectedZlecenie.coordinates) {
      const { lat, lng } = selectedZlecenie.coordinates;
      mapRef.current.flyTo([lat, lng], 12);
    }
  }, [selectedZlecenie]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full rounded-lg shadow-md overflow-hidden">
      <div className="h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          ref={mapRef}
          key={currentUser?.id} // Force re-render on user change
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {voivodeshipGeoJson && (
            <GeoJSON 
              data={voivodeshipGeoJson}
              style={{
                color: '#6366f1', // indigo-500
                weight: 2,
                opacity: 0.6,
                fillColor: '#c7d2fe', // indigo-200
                fillOpacity: 0.2,
              }}
            />
          )}
          {zlecenia.map(zlecenie => {
            if (!zlecenie.coordinates) return null;
            const isSelected = selectedZlecenie?.id === zlecenie.id;
            return (
              <Marker 
                key={zlecenie.id} 
                position={[zlecenie.coordinates.lat, zlecenie.coordinates.lng]}
                icon={isSelected ? selectedIcon : defaultIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{zlecenie.locationString}</p>
                    <p>{zlecenie.propertyType}</p>
                    <p>Cena: {zlecenie.proposedPrice} PLN</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default OrderMap;