
require([
  'esri/map',
  'esri/layers/ArcGISImageServiceLayer',
  'dojo/query',
  'dojo/on',
  'IdentifyTiles',
  'esri/dijit/Geocoder',
  'esri/dijit/Popup',
  'esri/dijit/PopupTemplate',
  'esri/layers/FeatureLayer',
  'esri/symbols/SimpleFillSymbol',
  'esri/Color',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/on',
  'dojox/charting/themes/Dollar',
  'dojo/domReady!'

  ], function (Map,
    ArcGISImageServiceLayer,
    query,
    on,
    IdentifyTiles,
    Geocoder,
    Popup,
    PopupTemplate,
    FeatureLayer,
    SimpleFillSymbol,
    Color,
    domClass,
    domConstruct,
    on,
    theme
  ){
    console.log ('hello');

    var baseUrl ='http://mapserv.utah.gov/arcgis/rest/services/';

    var urls = {
      hro2012: baseUrl + "AerialPhotography_Color/HRO2012Color6Inch_4Band/ImageServer",
      hro2009: baseUrl + "AerialPhotography_Color/HRO2009_Color1Foot/ImageServer",
      uao2003: baseUrl + "AerialPhotography_Color/UAO2003_Color1Foot/ImageServer",
      doq1990: baseUrl + "AerialPhotography_BlackWhite/DOQ1990s_1Meter/ImageServer"
    };

    var layers = {
      hro2012: null,
      hro2009: null,
      uao2003: null,
      doq1990: null
    };


    var currentLayer;

    var identify;

    var geocoder;

    var popup;

    function init () {
      console.log ('init fired');
      var map = new Map('map',{
        basemap: 'gray',
        center: [-111.60, 40.10],
        zoom: 5,
        infoWindow: popup
        });
        layers.hro2012 = new ArcGISImageServiceLayer(urls.hro2012);
        layers.hro2009 = new ArcGISImageServiceLayer(urls.hro2009,{
        visible:false
        });
        layers.uao2003 = new ArcGISImageServiceLayer(urls.uao2003,{
        visible:false
        });
        layers.doq1990 = new ArcGISImageServiceLayer(urls.doq1990,{
        visible:false
        });

      map.addLayer(layers.hro2012);
      map.addLayer(layers.hro2009);
      map.addLayer(layers.uao2003);
      map.addLayer(layers.doq1990);

      currentLayer = layers.hro2012

      wireEvents();

      identify = new IdentifyTiles(map);

      geocoder = new Geocoder({
        map: map
        }, "search");
        geocoder.startup();

// Popup Code

      popup = new Popup({
            titleInBody: false
        }, domConstruct.create("div"));
        domClass.add(popup.domNode, "dark");

        var template = new PopupTemplate({
          title:'Copy the link below to download the tile:',
          description: '{PATH}{TILE}{EXT}'
        });


//     HOW do I call the current layer from IdentifyTiles?? i want the featurelayer = current layer
//    var featureLayer = this.currentLayer,{
      var featureLayer = new FeatureLayer('http://mapserv.utah.gov/ArcGIS/rest/services/Raster/MapServer/27',{
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ["*"],
          infoTemplate: template

        });
        map.addLayer(featureLayer);

// End PopupCode



    function wireEvents (){
      console.log ('wireEvents fired');

      query("input[type='radio']").on('click',onRadioClicked)
      }

    function onRadioClicked (evt){
      console.log ('onRadioClicked fired');
      map.graphics.clear();
      currentLayer.hide();
      currentLayer = layers[evt.target.value];
      currentLayer.show();
      identify.switchCurrentLayer(evt.target.value);

      }

    }

  init()

});
