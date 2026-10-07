import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Fetch a page's code as soon as the visitor hovers or focuses a link to it.
    defaultPreload: "intent",
    // Cross-fade between pages with the View Transitions API where supported.
    defaultViewTransition: true,
  });

  return router;
};
