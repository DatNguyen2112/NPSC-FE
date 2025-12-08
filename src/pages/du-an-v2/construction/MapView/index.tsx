import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MyMap({ position, setPosition, fetchAddress } : { position: number[] | any, setPosition: any, fetchAddress: any }) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView(position, 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const marker = L.marker(position, { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        fetchAddress(lat, lng);
        marker.setLatLng([lat, lng]);
      });
    } else {
      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }
    }
  }, [position]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.off(); // remove all events
        mapRef.current.remove();
      }
    };
  }, []);

  return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
}
