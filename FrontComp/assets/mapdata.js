var simplemaps_countrymap_mapdata={
  main_settings: {
   //General settings
    width: "400", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#157859",

    //State defaults
    state_description: "",
    state_color: "#88A4BC",
    state_hover_color: "#808080",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",

    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "circle",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",

    //Label defaults
    label_color: "#d5ddec",
    label_hover_color: "#d5ddec",
    label_size: 22,
    label_font: "Arial",
    hide_labels: "no",
    hide_eastern_labels: "no",

    //Zoom settings
    zoom: "yes",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,

    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",

    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "detect",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    PAK1108: {
      name: "Baluchistan",
      color:"#fee2b3"
    },
    PAK1109: {
      name: "Azad Kashmir",
      color: "#d7e7cd"
    },
    PAK1110: {
      name: "Federal",
      color:"blue"
    },
    PAK1111: {
      name: "Gilgit Baltistan",
      color:"#d7e7cd"
    },
    PAK1112: {
      name: "KPK",
      color: "#fcd0cd"
    },
    PAK1113: {
      name: "Punjab",
      color:"#ffe4d9"
    },
    PAK1114: {
      name: "Sindh",
      color:"#e9d9e4"
    },
    PAK1123: {
      name: "KPK",
      color:"#fcd0cd"
    }
  },
  locations:
  [],
  labels: {
    "0": {
      name: "Baluchistan",
      parent_id: "PAK1108",
      color: "#000000",
      x: 268.8,
      y: 680
    },
    "1": {
      name: "Azad Kashmir",
      parent_id: "PAK1109",
      color: "#000000",
      x: 803.3,
      y: 273.7
    },
    "2": {
      name: "Federal",
      parent_id: "PAK1110",
      color: "#000000",
      x: 759.6,
      y: 255.9
    },
    "3": {
      name: "Gilgit Baltistan",
      parent_id: "PAK1111",
      color: "#000000",
      x: 856,
      y: 81.1
    },
    "4": {
      name: "KPK",
      parent_id: "PAK1112",
      color: "#000000",
      x: 559.1,
      y: 333.3
    },
    "5": {
      name: "Punjab",
      parent_id: "PAK1113",
      color: "#000000",
      x: 736.5,
      y: 409.4
    },
    "6": {
      name: "Sindh",
      parent_id: "PAK1114",
      color: "#000000",
      x: 489.3,
      y: 831.2
    },
    "7": {
      name: "KPK",
      parent_id: "PAK1123",
      color: "#000000",
      x: 730.6,
      y: 156.2
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};
