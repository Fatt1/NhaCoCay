/**
 * Navigation utility to handle clean SPA routing with HTML5 History API (no #/ prefix)
 */

export const navigateTo = (path: string, replace = false) => {
  if (typeof window === "undefined") return

  // Normalize path ensuring it starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`

  if (replace) {
    window.history.replaceState(null, "", cleanPath)
  } else {
    window.history.pushState(null, "", cleanPath)
  }

  // Dispatch custom popstate so reactive routers / components re-render immediately
  window.dispatchEvent(new PopStateEvent("popstate"))
}

export const getNormalizedPath = (): string => {
  if (typeof window === "undefined") return "/"

  // If a legacy URL with hash like #/kits, #/forum is accessed, seamlessly normalize to /kits, /forum
  const hash = window.location.hash
  if (hash && (hash.startsWith("#/") || hash.startsWith("#"))) {
    const rawAfterHash = hash.replace(/^#\/?/, "/")
    const cleanPath = rawAfterHash.startsWith("/") ? rawAfterHash : `/${rawAfterHash}`
    window.history.replaceState(null, "", cleanPath)
    return cleanPath
  }

  const pathname = window.location.pathname || "/"
  return pathname
}
