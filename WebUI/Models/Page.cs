namespace WebUI.Models
{
	public class Page : Base
	{
		public string FeedUrl { get; private set; }

		private Page(string title) : base(title)
		{ }

		public static Page Create(string title, string feedUrl)
		{
			return new Page(title)
			{
				FeedUrl = feedUrl
			};
		}
	}
}