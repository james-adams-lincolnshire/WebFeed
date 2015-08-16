var app = {
	debug: {
		debugging: true,
		debugPath: '/'
	},
	routing: {
		routes: {
			'': 'http://feeds.bbci.co.uk/sport/0/football/rss.xml?edition=uk',
			'/': 'http://feeds.bbci.co.uk/sport/0/football/rss.xml?edition=uk',
			'/home': 'http://feeds.bbci.co.uk/sport/0/football/rss.xml?edition=uk'
		},
		getRoute: function () {
			var path = window.location.pathname ? window.location.pathname.toLowerCase() :
											  '';

			if (app.debug.debugging)
				path = app.debug.debugPath;

			return app.routing.routes[path];
		}
	},
	dependancies: {
		srcUrls: [ // enter javascript source URL's below.
		],
		callback: { },
		loadingSrcUrls: [ ],
		loadedCount: 0,
		loading: false,
		load: function (srcUrls, callback) {
			if (!srcUrls) {
				callback();
				return;
			}

			app.dependancies.callback = callback;
			app.dependancies.loadingSrcUrls = srcUrls;

			for (var i = 0; i < app.dependancies.loadingSrcUrls.length; i++) {
				var script = document.createElement('script');

				script.type = 'text/javascript';
				script.src = app.dependancies.loadingSrcUrls[i];
				
				// Two callback types, for cross browser support.
				script.onreadystatechange = app.dependancies.loadedCallback;
				script.onload = app.dependancies.loadedCallback;

				document.getElementsByTagName('head')[i].appendChild(script);
			}

			app.dependancies.loading = true;
		},
		loaded: function () {
			/// Gets called each time a script is loaded.

			var loaded = !app.dependancies.srcUrls ||
						 app.dependancies.srcUrls.length === 0 ||
						 (app.dependancies.loadedCount === app.dependancies.srcUrls.length &&
						  app.dependancies.loadingSrc === app.dependancies.srcUrls);

			if (!loaded) {
				app.dependancies.loadedCount ? app.dependancies.loadedCount++ : app.dependancies.loadedCount = 1;
				loaded = app.dependancies.loadedCount == app.dependancies.srcUrls.length;
			}

			return loaded;
		},
		loadedCallback: function() {
			if (app.dependancies.loaded()) {
				app.dependancies.callback();

				app.dependancies.loading = false;
				app.dependancies.loadedCount = 0;

				delete app.dependancies.callback;
				delete app.dependancies.loadingSrcUrls;
			}
		}
	},
	yql: {
		baseUrl: [
			'http://query.yahooapis.com/v1/public/yql?q=',
			'&format=json&callback=app.yql.loadedCallback'
		],
		callback: { },
		scriptElement: '',
		load: function (url, itemLimit, callback) {
			var query = 'SELECT * ' +
						'FROM rss ' +
						"WHERE url='" + url + "' limit " + itemLimit;
			var encodedQuery = encodeURIComponent(query.toLowerCase());

			var srcUrl = app.yql.baseUrl[0] + encodedQuery + app.yql.baseUrl[1];

			app.yql.callback = callback;

			app.yql.scriptElement = document.createElement('script');
			app.yql.scriptElement.src = srcUrl;

			document.body.appendChild(app.yql.scriptElement);
		},
		loadedCallback: function (jsonData) {
			app.yql.callback(jsonData);

			document.body.removeChild(app.yql.scriptElement);

			delete app.yql.scriptElement;
			delete app.yql.callback;
		}
	}
};

app.main = function () {
	app.dependancies.load(app.dependancies.src, function () {
		app.yql.load(app.routing.getRoute(), 10, app.loadFeed);
	});
};

app.loadFeed = function (jsonData) {
	document.getElementById('feed').innerHTML = JSON.stringify(jsonData);
}