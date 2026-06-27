import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://intell-meet-zeta.vercel.app";

function setMeta(
  selector: string,
  attribute: string,
  value: string,
  attrName: "name" | "property" = "name",
) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute(attribute, value);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attrName, selector.replace(/.*["']([^"']+)["'].*/, "$1"));
    el.setAttribute(attribute, value);
    document.head.appendChild(el);
  }
}

function setLink(
  rel: string,
  href: string,
  extraAttrs?: Record<string, string>,
) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extraAttrs) {
    Object.entries(extraAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
  }
}

export const useDocumentSEO = ({
  title,
  description,
  keywords,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    const fullTitle = `${title} | IntellMeet`;
    const canonical = `${BASE_URL}${window.location.pathname}`;

    document.title = fullTitle;

    if (description) {
      setMeta('meta[name="description"]', "content", description, "name");
      setMeta(
        'meta[property="og:description"]',
        "content",
        description,
        "property",
      );
      setMeta(
        'meta[name="twitter:description"]',
        "content",
        description,
        "name",
      );
    }

    if (keywords) {
      setMeta('meta[name="keywords"]', "content", keywords, "name");
    }

    setMeta('meta[property="og:title"]', "content", fullTitle, "property");
    setMeta('meta[property="og:url"]', "content", canonical, "property");

    setMeta('meta[name="twitter:title"]', "content", fullTitle, "name");

    setLink("canonical", canonical);

    if (jsonLd) {
      const scriptId = "page-jsonld";
      let script = document.getElementById(
        scriptId,
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const stale = document.getElementById("page-jsonld");
      if (stale) stale.remove();
    };
  }, [title, description, keywords, jsonLd]);
};
