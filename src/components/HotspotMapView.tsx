import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { RecurrenceCluster, Complaint } from '../types';
import { Language, translations } from '../i18n';
import {
  Layers,
  MapPin,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  Filter,
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  complaints: Complaint[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const HotspotMapView: React.FC<Props> = ({
  clusters,
  complaints,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google'>(() =>
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (import.meta as any).env?.GOOGLE_MAPS_PLATFORM_KEY
      ? 'google'
      : 'leaflet'
  );
  const [filterType, setFilterType] = useState<'all' | 'high_recurrence' | 'relapse'>('all');

  // Google Maps API Key State
  const [mapsApiKey, setMapsApiKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      (import.meta as any).env?.GOOGLE_MAPS_PLATFORM_KEY ||
      ''
    );
  });
  const [isKeyLoading, setIsKeyLoading] = useState<boolean>(true);

  // Leaflet refs
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersGroupRef = useRef<L.LayerGroup | null>(null);

  // Google Maps refs
  const gmapContainerRef = useRef<HTMLDivElement | null>(null);
  const gmapInstanceRef = useRef<any>(null);
  const gmapObjectsRef = useRef<any[]>([]);
  const [gmapStatus, setGmapStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [gmapErrorMsg, setGmapErrorMsg] = useState<string | null>(null);

  const filteredClusters = clusters.filter((cl) => {
    if (filterType === 'high_recurrence') return cl.recurrenceCount >= 3;
    if (filterType === 'relapse') return cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse';
    return true;
  });

  // 1. Fetch backend map config if env var was not bundled at build time
  useEffect(() => {
    let isMounted = true;
    async function resolveMapsKey() {
      try {
        const res = await fetch('/api/config/maps');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.apiKey) {
            setMapsApiKey(data.apiKey);
          }
        }
      } catch (err) {
        console.warn('Maps config fetch notice:', err);
      } finally {
        if (isMounted) setIsKeyLoading(false);
      }
    }
    resolveMapsKey();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Leaflet Map (always kept mounted as fallback)
  useEffect(() => {
    if (!leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [13.025, 80.23],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      leafletMarkersGroupRef.current = markersGroup;
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // 3. Render Leaflet Markers & Recurrence Halos
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = leafletMarkersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredClusters.forEach((cluster) => {
      const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';
      const isCritical = cluster.priorityScore >= 80;

      const fillColor = isRelapse
        ? '#DC2626'
        : isCritical
        ? '#F59E0B'
        : cluster.status === 'verified_resolved'
        ? '#0F9D8A'
        : '#4F46E5';

      const circle = L.circle([cluster.latitude, cluster.longitude], {
        radius: cluster.radiusMeters || 300,
        color: fillColor,
        fillColor: fillColor,
        fillOpacity: 0.16,
        weight: isRelapse ? 2.5 : 1.5,
        dashArray: isRelapse ? '4, 4' : undefined,
      });

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: ${fillColor};
            color: #ffffff;
            font-weight: bold;
            font-size: 13px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <span>${cluster.recurrenceCount}</span>
            ${
              isRelapse
                ? `<div style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 13px;
                    height: 13px;
                    background: #DC2626;
                    border: 2px solid white;
                    border-radius: 50%;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([cluster.latitude, cluster.longitude], {
        icon: customIcon,
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-gray-800 text-xs min-w-[220px]';
      popupContent.innerHTML = `
        <div style="margin-bottom: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="font-size: 13px; color: #101828;">${cluster.area}</strong>
            <span style="
              background: ${fillColor}22;
              color: ${fillColor};
              font-weight: bold;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
            ">${cluster.priorityScore}/100</span>
          </div>
          <div style="font-size: 11px; color: #667085; margin-top: 2px;">
            ${cluster.zone} • Ward ${cluster.ward}
          </div>
        </div>
        ${
          isRelapse
            ? `<div style="
                background: #fee2e2;
                color: #991b1b;
                padding: 4px 6px;
                border-radius: 4px;
                font-weight: 600;
                font-size: 10px;
                margin-bottom: 6px;
              ">⚠️ Relapsed ${cluster.daysBetweenRepairAndRecurrence || 14} days after repair</div>`
            : ''
        }
        <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
          <strong>${cluster.recurrenceCount}</strong> reported complaints within ${cluster.radiusMeters}m radius.
        </div>
        <button id="btn-inspect-leaflet-${cluster.id}" style="
          width: 100%;
          background: #4F46E5;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          border: none;
        ">
          View Root Cause & Repairs →
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-leaflet-${cluster.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectCluster(cluster);
          };
        }
      });

      markersGroup.addLayer(circle);
      markersGroup.addLayer(marker);
    });
  }, [filteredClusters, onSelectCluster]);

  // 4. Render Google Maps Markers & Circles
  const renderGoogleMarkers = useCallback(
    (map: any, google: any) => {
      // Clear old objects
      gmapObjectsRef.current.forEach((obj) => {
        if (obj.setMap) obj.setMap(null);
      });
      gmapObjectsRef.current = [];

      filteredClusters.forEach((cluster) => {
        const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';
        const isCritical = cluster.priorityScore >= 80;

        const fillColor = isRelapse
          ? '#DC2626'
          : isCritical
          ? '#F59E0B'
          : cluster.status === 'verified_resolved'
          ? '#0F9D8A'
          : '#4F46E5';

        // Radius circle
        const circle = new google.maps.Circle({
          strokeColor: fillColor,
          strokeOpacity: 0.85,
          strokeWeight: isRelapse ? 2.5 : 1.5,
          fillColor: fillColor,
          fillOpacity: 0.2,
          map,
          center: { lat: cluster.latitude, lng: cluster.longitude },
          radius: cluster.radiusMeters || 300,
        });
        gmapObjectsRef.current.push(circle);

        // Marker with pin icon
        const marker = new google.maps.Marker({
          position: { lat: cluster.latitude, lng: cluster.longitude },
          map,
          title: `${cluster.area} (${cluster.recurrenceCount} events)`,
          label: {
            text: String(cluster.recurrenceCount),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 14,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; color: #101828; padding: 4px; min-width: 220px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <h4 style="margin: 0; font-size: 13px; font-weight: bold; color: #101828;">${cluster.area}</h4>
                <span style="background: ${fillColor}22; color: ${fillColor}; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                  ${cluster.priorityScore}/100
                </span>
              </div>
              <p style="margin: 0 0 4px; color: #667085; font-size: 11px;">${cluster.zone} • Ward ${cluster.ward}</p>
              ${
                isRelapse
                  ? `<div style="background: #fee2e2; color: #991b1b; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 6px;">
                      ⚠️ Relapsed ${cluster.daysBetweenRepairAndRecurrence || 14} days after repair
                    </div>`
                  : ''
              }
              <p style="margin: 0 0 8px; color: #334155; font-size: 11px;">
                <strong>${cluster.recurrenceCount}</strong> reported complaints within ${cluster.radiusMeters}m radius.
              </p>
              <button id="btn-inspect-gmap-${cluster.id}" style="
                width: 100%;
                background: #4F46E5;
                color: #ffffff;
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 11px;
                cursor: pointer;
                border: none;
              ">
                View Root Cause & Repairs →
              </button>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setTimeout(() => {
            const btn = document.getElementById(`btn-inspect-gmap-${cluster.id}`);
            if (btn) {
              btn.onclick = () => {
                onSelectCluster(cluster);
              };
            }
          }, 100);
        });

        gmapObjectsRef.current.push(marker);
      });
    },
    [filteredClusters, onSelectCluster]
  );

  // 5. Initialize Google Maps Platform instance safely
  const initGoogleMaps = useCallback(() => {
    if (!gmapContainerRef.current) {
      console.warn('Google Maps container ref not yet mounted');
      return;
    }

    if (!mapsApiKey) {
      setGmapStatus('error');
      setGmapErrorMsg(
        'Google Maps API key not found in environment secrets. Using seamless CartoDB map fallback.'
      );
      return;
    }

    setGmapStatus('loading');
    setGmapErrorMsg(null);

    // Global auth failure handler
    (window as any).gm_authFailure = () => {
      console.error(
        'Google Maps Authentication Failure: Key rejected or unauthorized by Google Maps Platform.'
      );
      setGmapStatus('error');
      setGmapErrorMsg(
        'Google Maps Authentication Error: The configured API key was rejected. Seamlessly falling back to CartoDB layer.'
      );
    };

    const google = (window as any).google;
    if (google && google.maps) {
      try {
        if (!gmapInstanceRef.current) {
          const map = new google.maps.Map(gmapContainerRef.current, {
            center: { lat: 13.025, lng: 80.23 },
            zoom: 12,
            mapTypeId: 'roadmap',
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          });
          gmapInstanceRef.current = map;
        }
        renderGoogleMarkers(gmapInstanceRef.current, google);
        setGmapStatus('loaded');
      } catch (err: any) {
        console.error('Google Maps initialization error:', err);
        setGmapStatus('error');
        setGmapErrorMsg(err.message || 'Failed to render Google Maps instance');
      }
      return;
    }

    // Load Google Maps JavaScript API script
    const scriptId = 'google-maps-platform-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        mapsApiKey
      )}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const loadedGoogle = (window as any).google;
        if (loadedGoogle && loadedGoogle.maps && gmapContainerRef.current) {
          try {
            const map = new loadedGoogle.maps.Map(gmapContainerRef.current, {
              center: { lat: 13.025, lng: 80.23 },
              zoom: 12,
              mapTypeId: 'roadmap',
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            });
            gmapInstanceRef.current = map;
            renderGoogleMarkers(map, loadedGoogle);
            setGmapStatus('loaded');
          } catch (err: any) {
            console.error('Google Maps Map constructor error:', err);
            setGmapStatus('error');
            setGmapErrorMsg(err.message || 'Map instantiation failed');
          }
        }
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script from maps.googleapis.com');
        setGmapStatus('error');
        setGmapErrorMsg(
          'Could not reach maps.googleapis.com. Falling back to CartoDB layer.'
        );
      };

      document.head.appendChild(script);
    } else {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        const g = (window as any).google;
        if (g && g.maps && gmapContainerRef.current) {
          clearInterval(checkInterval);
          if (!gmapInstanceRef.current) {
            const map = new g.maps.Map(gmapContainerRef.current, {
              center: { lat: 13.025, lng: 80.23 },
              zoom: 12,
              mapTypeId: 'roadmap',
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            });
            gmapInstanceRef.current = map;
          }
          renderGoogleMarkers(gmapInstanceRef.current, g);
          setGmapStatus('loaded');
        } else if (attempts > 30) {
          clearInterval(checkInterval);
          setGmapStatus('error');
          setGmapErrorMsg('Google Maps script loading timed out.');
        }
      }, 200);
    }
  }, [mapsApiKey, renderGoogleMarkers]);

  useEffect(() => {
    if (mapEngine === 'google' && mapsApiKey && gmapStatus === 'idle') {
      initGoogleMaps();
    }
  }, [gmapStatus, initGoogleMaps, mapEngine, mapsApiKey]);

  // Handle engine switch
  const handleSelectEngine = (engine: 'leaflet' | 'google') => {
    setMapEngine(engine);
    if (engine === 'google') {
      setTimeout(() => {
        if (!gmapInstanceRef.current || gmapStatus !== 'loaded') {
          initGoogleMaps();
        } else {
          const google = (window as any).google;
          if (google && gmapInstanceRef.current) {
            google.maps.event.trigger(gmapInstanceRef.current, 'resize');
            gmapInstanceRef.current.setCenter({ lat: 13.025, lng: 80.23 });
            renderGoogleMarkers(gmapInstanceRef.current, google);
          }
        }
      }, 50);
    } else {
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 50);
    }
  };

  const handlePanToCluster = (cluster: RecurrenceCluster) => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.setView([cluster.latitude, cluster.longitude], 15, {
        animate: true,
      });
    } else if (mapEngine === 'google' && gmapInstanceRef.current) {
      gmapInstanceRef.current.panTo({ lat: cluster.latitude, lng: cluster.longitude });
      gmapInstanceRef.current.setZoom(15);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              <span>Chennai Civic Recurrence Hotspot Map</span>
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 uppercase">
              GIS Radar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Geospatial intelligence displaying recurring flood corridors, cluster radii, and post-repair breaches across Chennai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Map Engine Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 text-xs">
            <button
              onClick={() => handleSelectEngine('leaflet')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                mapEngine === 'leaflet'
                  ? 'bg-white text-gray-900 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>CartoDB Map</span>
            </button>

            <button
              onClick={() => handleSelectEngine('google')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                mapEngine === 'google'
                  ? 'bg-white text-gray-900 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Google Maps</span>
            </button>
          </div>

          {/* Recurrence Filter */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-xs font-medium text-gray-600 shadow-2xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterType === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              All ({clusters.length})
            </button>
            <button
              onClick={() => setFilterType('high_recurrence')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterType === 'high_recurrence' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              High Recurrence (≥3)
            </button>
            <button
              onClick={() => setFilterType('relapse')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterType === 'relapse' ? 'bg-rose-50 text-rose-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              ⚠️ Relapses Only
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Box & Synchronized Hotspot Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
          {/* Map Status Notice / Failure Banner if any */}
          {mapEngine === 'google' && gmapStatus === 'error' && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{gmapErrorMsg}</span>
              </div>
              <button
                onClick={() => handleSelectEngine('leaflet')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] whitespace-nowrap cursor-pointer"
              >
                Switch to CartoDB Layer
              </button>
            </div>
          )}

          {/* Actual Map Canvas - explicit height guarantee */}
          <div className="relative w-full h-[540px] bg-gray-100">
            {/* Leaflet Container */}
            <div
              ref={leafletContainerRef}
              className={`w-full h-full ${mapEngine === 'leaflet' ? 'block' : 'hidden'}`}
              style={{ minHeight: '540px' }}
            />

            {/* Google Maps Container */}
            <div
              ref={gmapContainerRef}
              className={`w-full h-full ${mapEngine === 'google' && gmapStatus !== 'error' ? 'block' : 'hidden'}`}
              style={{ minHeight: '540px' }}
            />

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-2.5 shadow-md text-[11px] space-y-1.5 pointer-events-none">
              <span className="font-bold text-gray-900 block border-b border-gray-100 pb-1">
                Hotspot Severity Legend
              </span>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-rose-600 border border-white" />
                <span>Post-Repair Warranty Relapse</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
                <span>Critical Recurrence (Score &ge; 80)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-indigo-600 border border-white" />
                <span>Active Chronic Cluster</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-teal-600 border border-white" />
                <span>Verified Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Synchronized Hotspots Sidebar (1 Col) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col h-[540px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Synchronized Hotspots
              </h3>
              <p className="text-[11px] text-gray-500">Click to center and zoom on map</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {filteredClusters.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredClusters.map((cluster) => {
              const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';

              return (
                <div
                  key={cluster.id}
                  onClick={() => handlePanToCluster(cluster)}
                  className="p-3.5 hover:bg-gray-50 transition cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          {cluster.id}
                        </span>
                        {isRelapse && (
                          <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1 rounded">
                            Relapse
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 transition truncate max-w-[180px]">
                        {cluster.area}
                      </h4>
                    </div>

                    <span className="font-bold text-xs text-indigo-700 tabular-nums">
                      {cluster.priorityScore}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{cluster.zone} • Ward {cluster.ward}</span>
                    <span className="font-semibold text-gray-700">{cluster.recurrenceCount} events</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 capitalize">
                      {cluster.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCluster(cluster);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Full Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
