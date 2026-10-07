/** Title + description meta (with Open Graph mirrors) for a route's `head()`. */
export function seo({ title, description }: { title: string; description: string }) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}
