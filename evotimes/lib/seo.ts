import type { Metadata } from "next";
import { SITE_NAME } from "./site";

const HOME_TITLE = `${SITE_NAME} – Latest Technology News`;

export interface SocialImage {
  url: string;
  alt?: string;
}

interface BuildMetadataOptions {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  images?: SocialImage[];
  openGraph?: Record<string, unknown>;
  robots?: Metadata["robots"];
}

/**
 * Builds the metadata object for a page.
 *
 * Next.js replaces (not merges) nested objects such as `openGraph` and
 * `alternates` from the layout, so every page builds its own set here to keep
 * canonical, Open Graph and Twitter tags consistent.
 */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  images,
  openGraph = {},
  robots,
}: BuildMetadataOptions): Metadata {
  const hasImages = Array.isArray(images) && images.length > 0;
  const socialTitle = title || HOME_TITLE;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_IN",
      title: socialTitle,
      description,
      url: path,
      ...(hasImages ? { images } : {}),
      ...openGraph,
    } as Metadata["openGraph"],
    twitter: {
      card: hasImages ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      ...(hasImages ? { images: images.map((image) => image.url) } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}
