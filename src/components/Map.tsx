import { useState, useMemo } from "react";
import { DeckGL, ScatterplotLayer } from "deck.gl";
import { DataFilterExtension } from "@deck.gl/extensions";
import Map, { AttributionControl } from "react-map-gl/maplibre";
import { BASEMAP } from "@deck.gl/carto";
import FilterSlider from "./FilterSlider";
import InfoPanel from "./InfoPanel";

import type { MapViewState } from "deck.gl";

const getTimeRange = (data: any): null | [minTime: number, maxTime: number] => {
  if (!data) {
    return null;
  }
  return data.reduce(
    (range: any, d: any) => {
      const t = d.time;
      range[0] = Math.min(range[0], t);
      range[1] = Math.max(range[1], t);
      return range;
    },
    [Infinity, -Infinity],
  );
};

const MapComponent = ({ data }: any) => {
  const [_filterRange, setFilterRange] = useState<
    [start: number, end: number] | null
  >(null);
  const [radiusScale, setRadiusScale] = useState<number>(20);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);

  const timeRange = useMemo(() => getTimeRange(data), [data]);
  const filterRange = _filterRange || timeRange;

  const dataFilter = new DataFilterExtension({
    filterSize: 1,
  });

  const layers = [
    filterRange &&
      new ScatterplotLayer({
        id: "ScatterplotLayer",
        data: data,
        stroked: false,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: (d) => d.peak_current,
        getFillColor: [225, 210, 255, 180],
        radiusScale: radiusScale,
        radiusMinPixels: 0.1,
        billboard: true,

        getFilterValue: (d: any) => d.time,
        filterRange: [filterRange[0], filterRange[1]],
        filterSoftRange: [
          filterRange[0] * 0.9 + filterRange[1] * 0.1,
          filterRange[1],
        ],
        extensions: [dataFilter],
      }),
  ];
  const INITIAL_VIEW_STATE: MapViewState = {
    longitude: 20,
    latitude: 60,
    zoom: 5,
  };

  return (
    <div style={{}}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={BASEMAP.DARK_MATTER} attributionControl={false}>
          <AttributionControl position="bottom-right" compact={false} />
        </Map>
      </DeckGL>
      {timeRange && filterRange && (
        <FilterSlider
          min={timeRange[0]}
          max={timeRange[1]}
          filterRange={filterRange}
          setFilterRange={setFilterRange}
          animationSpeed={animationSpeed}
        />
      )}
      {filterRange && (
        <InfoPanel
          timeRange={filterRange}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          radiusScale={radiusScale}
          setRadiusScale={setRadiusScale}
        />
      )}
    </div>
  );
};

export default MapComponent;
