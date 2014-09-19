define('IdentifyTiles', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/dom',

    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol'

], function (
    declare,
    lang,
    Color,
    dom,

    Query,
    QueryTask,
    SimpleFillSymbol,
    SimpleLineSymbol
    ) {
    return declare(null, {
        // summary:
        //      In charge of querying indices layers and returning download information

        // baseUrl: String
        //      The url to the map service containing the indices layers
        baseUrl: 'http://mapserv.utah.gov/ArcGIS/rest/services/Raster/MapServer',

        // layersInd: {}
        //      The indices of the layers within the map service
        layersInd: {
            hro2012: '27',
            hro2009: '20',
            uao2003: '15',
            doq1990: '8'
        },

        // fields: {}
        //      fields names
        fields: {
            PATH: 'PATH',
            TILE: 'TILE',
            EXT: 'EXT'
        },

        // qTasks: {}
        //      The query tasks associated with each layer
        qTasks: {
            hro2012: null,
            hro2009: null,
            uao2003: null,
            doq1990: null
        },

        // query: Query
        query: null,

        // currentLayer: String
        currentLayer: 'hro2012',

        // symbol: SimpleFillSymbol
        symbol: null,

        // downloadLink: HTML a node
        downloadLink: null,

        constructor: function(map) {
            // summary:
            //      This is the first function to fire when the object is created
            console.log('IdentifyTiles:constructor', arguments);

            this.buildQueryTasks();

            this.map = map;

            this.map.on('click', lang.hitch(this, 'onMapClick'));

            this.symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color('red'), 2),
                null);

            this.downloadLink = dom.byId('download-link');
        },
        buildQueryTasks: function() {
            // summary:
            //      Builds each of the query tasks and the query parameters object
            console.log('IdentifyTiles:buildQueryTasks', arguments);

            this.qTasks.hro2012 = new QueryTask(this.baseUrl + '/' + this.layersInd.hro2012);
            this.qTasks.hro2009 = new QueryTask(this.baseUrl + '/' + this.layersInd.hro2009);
            this.qTasks.uao2003 = new QueryTask(this.baseUrl + '/' + this.layersInd.uao2003);
            this.qTasks.doq1990 = new QueryTask(this.baseUrl + '/' + this.layersInd.doq1990);

            this.query = new Query();
            this.query.returnGeometry = true;
            this.query.outFields = [this.fields.PATH, this.fields.TILE, this.fields.EXT];
        },
        switchCurrentLayer: function(layer) {
            // summary:
            //      Switches the current layer so that the correct query task is fired when
            //      the map is clicked
            // layer: String e.g. hro2012
            console.log('IdentifyTiles:switchCurrentLayer', arguments);

            this.currentLayer = layer;
        },
        onMapClick: function(evt) {
            // summary:
            //      Fires when the user clicks on the map. Sets the geometry and fires the query task
            // evt: Map Click Event
            console.log('IdentifyTiles:onMapClick', arguments);

            this.map.graphics.clear();
            this.setDownloadLink('');

            this.query.geometry = evt.mapPoint;

            this.qTasks[this.currentLayer].execute(this.query,
                lang.hitch(this, this.onQueryTaskComplete),
                lang.hitch(this, this.onQueryTaskError));
        },
        onQueryTaskComplete: function(fSet) {
            // summary:
            //      Fires when the query task is returned successful from the server
            console.log('IdentifyTiles:onQueryTaskComplete', arguments);

            if (fSet.features.length > 0) {
                var g = fSet.features[0]; // get first graphic returned
                g.setSymbol(this.symbol);
                this.map.graphics.add(g);
                var url = g.attributes[this.fields.PATH] + g.attributes[this.fields.TILE] +
                    g.attributes[this.fields.EXT];
                this.setDownloadLink(url);
            } else {
                console.warning('no feature found.');
            }
        },
        onQueryTaskError: function(er) {
            // summary:
            //      Fires when the query task returns an error from the server
            // er: Error
            console.log('IdentifyTiles:onQueryTaskError', arguments);

            console.error('there was an error returned from the query task!', er);
        },
        setDownloadLink: function(url) {
            // summary:
            //      Sets the download link innerHTML and href
            // url: String
            console.log('IdentifyTiles:setDownloadLink', arguments);

            this.downloadLink.href = url;
            this.downloadLink.innerHTML = url;
        }
    });
});
