const getBasemaps = [
  {
    name: "SatelliteStreet",
    attribution: "Mapbox",
    url:
      "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}" +
      "?access_token=pk.eyJ1IjoiZ2F0aG9nbzEiLCJhIjoiY2t0djhndnB4MGkzdDJucDg2bW5uNXNrcyJ9.mnbTMXxDrdYnTrb8Gr7_MA",
  },
  {
    name: "Esri.WorldImagery",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/mapServer/tile/{z}/{y}/{x}",
  },
  {
    name: "Esri.WorldStreetMap",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/mapServer/tile/{z}/{y}/{x}",
  },
  // {
  //   name: "OpenStreetMap",
  //   attribution:
  //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  // },
  // {
  //   name: "OpenTopoMap",
  //   attribution:
  //     'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  //   url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  // },
  // {
  //   name: "Stadia.AlidadeSmoothDark",
  //   attribution:
  //     '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  // },
];

export default getBasemaps;
