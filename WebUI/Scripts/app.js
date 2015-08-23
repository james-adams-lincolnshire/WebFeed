var app = {
	dependancies: {
		srcUrls: [ // enter javascript source URL's below.
		],
		callback: {},
		loadingSrcUrls: [],
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
		loadedCallback: function () {
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
		loading: false,
		callback: [],
		scriptElement: [],
		loadFeed: function (url, itemOffset, itemLimit, callback) {
			var query = 'SELECT * ' +
						'FROM rss(' + itemOffset + ', ' + itemLimit + ') ' +
						"WHERE url='" + url + "' limit " + itemLimit;
			var encodedQuery = encodeURIComponent(query.toLowerCase());

			var srcUrl = app.yql.baseUrl[0] + encodedQuery + app.yql.baseUrl[1];

			app.yql.callback = callback;
			app.yql.loading = true;

			app.yql.scriptElement = document.createElement('script');
			app.yql.scriptElement.src = srcUrl;

			document.body.appendChild(app.yql.scriptElement);
		},
		loadedCallback: function (jsonData) {
			app.yql.callback(jsonData);

			document.body.removeChild(app.yql.scriptElement);

			delete app.yql.scriptElement;
			delete app.yql.callback;

			app.yql.loading = false;
		},
		getFeedResultsFromJson: function (jsonData) {
			if (!jsonData ||
				!jsonData.query ||
				!jsonData.query.results)
				return null;

			return jsonData.query.results.item;
		}
	},
	feed: {
		loadingNode: document.getElementById('loading').cloneNode(true),
		load: function () {
			var feedUrl = document.getElementById('feed-url').value;
			var feedCount = 0;
			var feedIncrement = 10;
			var feedExhausted = false;

			app.yql.loadFeed(feedUrl, feedCount, feedIncrement, function (jsonData) {
				var currentLoadingNode = document.getElementById('loading');

				if (currentLoadingNode)
					currentLoadingNode.remove();

				app.feed.render(jsonData, 'list-article');

				document.getElementById('feed').appendChild(app.feed.loadingNode);

				feedCount += feedIncrement;

				document.addEventListener('scroll', function (event) {
					if (feedExhausted)
						return;

					var isAtBottom = document.body.scrollHeight ==
									 document.body.scrollTop +
									 window.innerHeight;

					if (isAtBottom &&
						!app.yql.loading) {

						app.yql.loadFeed(feedUrl, feedCount, feedIncrement, function (jsonData) {
							currentLoadingNode = document.getElementById('loading');

							if (!jsonData.query.results) {
								currentLoadingNode.remove();
								feedExhausted = true;
								return;
							}

							currentLoadingNode.remove();

							app.feed.render(jsonData, 'list-article');

							document.getElementById('feed').appendChild(app.feed.loadingNode);

							feedCount += feedIncrement;
						});
					}
				});
			});
		},
		refresh: function () {
			document.getElementById('feed').innerHTML = '';

			app.feed.load();
		},
		render: function (jsonData, templateId) {
			var results = app.yql.getFeedResultsFromJson(jsonData);

			if (!results ||
				!templateId ||
				templateId.length < 1)
				return;

			var articlesJson = results.length > 1 ? results :
													[results];

			var feed = document.getElementById('feed');

			for (var articleIndex = 0; articleIndex < articlesJson.length; articleIndex++) {

				var article = articlesJson[articleIndex];
				var template = document.getElementById(templateId).cloneNode(true);
				var imageExists = article.thumbnail &&
									article.thumbnail.length > 0;

				template.className = imageExists ? template.id : template.id + ' no-image';
				template.id = '';

				for (var templateIndex = 0; templateIndex < template.childNodes.length; templateIndex++) {

					var templateNode = template.childNodes[templateIndex];

					switch (templateNode.id) {
						case 'title':
							var titleNode = document.createElement('h3');
							titleNode.innerHTML = article.title;
							titleNode.setAttribute('class', 'title');
							template.replaceChild(titleNode, templateNode)
							break;
						case 'description':
							var descriptionNode = document.createElement('p');
							descriptionNode.innerHTML = article.description;
							descriptionNode.setAttribute('class', 'description');
							template.replaceChild(descriptionNode, templateNode);
							break;
						case 'image':
							if (imageExists) {
								var imageNode = document.createElement('img');
								imageNode.src = article.thumbnail[article.thumbnail.length - 1].url;
								imageNode.setAttribute('class', 'image');
								template.replaceChild(imageNode, templateNode);
							}
							break;
					}
				}

				feed.appendChild(template);
			}
		}
	}
};

(app.main = function () {
	app.dependancies.load(app.dependancies.src, function () {
		app.feed.load();
	});
})();

//"query": {
//	"count": 1,
//	"created": "2015-08-19T19:14:32Z",
//	"lang": "en-GB",
//	"results": {
//		"item": {
//			"title": "Chelsea agree deal for Barca's Pedro",
//			"description": "Chelsea agree to sign Barcelona winger Pedro, who had been a Manchester United target, in a deal worth £21m.",
//			"link": "http://www.bbc.co.uk/sport/0/football/33989090",
//			"guid": {
//				"isPermaLink": "false",
//				"content": "http://www.bbc.co.uk/sport/0/football/33989090"
//			},
//			"pubDate": "Wed, 19 Aug 2015 12:05:33 GMT",
//			"thumbnail": [{
//				"height": "37",
//				"url": "http://c.files.bbci.co.uk/C6B2/production/_85066805_pedro.jpg",
//				"width": "66"
//			},
//			{
//				"height": "81",
//				"url": "http://c.files.bbci.co.uk/EDC2/production/_85066806_pedro.jpg",
//				"width": "144"
//			}]
//		}
//	}
//}