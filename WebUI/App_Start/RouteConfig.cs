using System.Web.Mvc;
using System.Web.Routing;

namespace WebUI
{
	public class RouteConfig
	{
		public static void RegisterRoutes(RouteCollection routes)
		{
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

			routes.MapRoute(
				name: "Default",
				url: "{category}",
				defaults: new { controller = "Home", action = "Index", category = UrlParameter.Optional }
			);
		}
	}
}