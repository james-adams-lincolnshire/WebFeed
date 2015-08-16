var app = {
	dependancies: {
		src: [ // enter javascript source URL's below.
		],
		callback,
		loadedCount: 0,
		loading: false,
		load: function (srcUrls, callback) {
			app.dependancies.callback = callback;

			for (var i = 0; i < srcUrls.length; i++) {
				var script = document.createElement('script');

				script.type = 'text/javascript';
				script.src = srcUrls[i];
				
				// Two callback types, for cross browser support.
				script.onreadystatechange = loadedCallback;
				script.onload = loadedCallback;

				document.getElementsByTagName('head')[i].appendChild(script);
			}

			app.dependancies.loading = true;
		},
		loaded: function () {
			var loaded = !app.dependancies.src ||
						 app.dependancies.src.length === 0 ||
						 app.dependancies.loadedCount === app.dependancies.src.length;

			if (!loaded) {
				app.dependancies.loadedCount ? app.dependancies.loadedCount++ : app.dependancies.loadedCount = 1;
				loaded = app.dependancies.loadedCount == app.dependancies.src.length;
			}
			else
				app.dependancies.loading = false;

			return loaded;
		},
		loadedCallback: function() {
			if (app.dependancies.loaded())
				app.dependancies.callback();
		}
	}
};

app.main = function () {
	app.dependancies.load(app.dependancies.src, function () {
		// do something!?
	});
};

app.loadFeed = function () {
	var url = 'http://feeds.bbci.co.uk/sport/0/football/rss.xml?edition=uk';
};