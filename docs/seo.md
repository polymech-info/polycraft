# SEO Component for Canonical Tags and Hreflang Attributes in Astro

This document outlines how to implement canonical tags and hreflang attributes in an Astro project to support multilingual SEO.

## 1. SEO Component (`SEO.astro`)

Create a reusable component that accepts a canonical URL and an array of hreflang entries.

```astro
---
// src/components/SEO.astro
const { canonical, hreflangs } = Astro.props;
---
{canonical && <link rel="canonical" href={canonical} />}
{hreflangs &&
  hreflangs.map((entry) => (
    <link key={entry.lang} rel="alternate" hreflang={entry.lang} href={entry.url} />
  ))}
