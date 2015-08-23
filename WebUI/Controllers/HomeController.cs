using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using System.Web.UI;

using Page = WebUI.Models.Page;

namespace WebUI.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class HomeController : Controller
    {
		Dictionary<string, string> categories = new Dictionary<string, string>
		{
			{ "", "http://feeds.bbci.co.uk/news/rss.xml?edition=uk" },
			{ "sport", "http://feeds.bbci.co.uk/sport/rss.xml?edition=uk" },
            { "technology", "http://feeds.bbci.co.uk/news/technology/rss.xml" },
			{ "entertainment_and_arts", "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml" },
            { "science", "http://feeds.bbci.co.uk/sport/0/science/rss.xml" },
            { "politics", "http://feeds.bbci.co.uk/news/politics/rss.xml" },
            { "business", "http://feeds.bbci.co.uk/news/business/rss.xml" }
		};

		[OutputCache(Duration = 86400, Location = OutputCacheLocation.ServerAndClient, VaryByParam = "category")]
		public ActionResult Index(string category)
        {
			if (category == null)
				category = string.Empty;

			if (!categories.ContainsKey(category))
				throw new HttpException(404, "Page not found");

            return View(Page.Create(category, categories[category]));
        }
    }
}