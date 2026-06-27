import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
}

export const useDocumentSEO = ({ title, description, keywords }: SEOProps) => {
  useEffect(() => {
    document.title = `${title} | IntellMeet`;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        metaDescription.setAttribute("content", description);
        document.head.appendChild(metaDescription);
      }

      let ogDescription = document.querySelector(
        'meta[property="og:description"]',
      );
      if (ogDescription) {
        ogDescription.setAttribute("content", description);
      }
    }

    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords);
      } else {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        metaKeywords.setAttribute("content", keywords);
        document.head.appendChild(metaKeywords);
      }
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", `${title} | IntellMeet`);
    }
  }, [title, description, keywords]);
};
