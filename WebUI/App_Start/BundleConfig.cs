using System.Web.Optimization;

namespace WebUI
{
	public class BundleConfig
	{
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(new ScriptBundle("~/bundles/javascript").Include(
					  "~/Scripts/app.js"));

			bundles.Add(new StyleBundle("~/Content/css").Include(
					  "~/Content/site.css"));
		}
	}
}