# RTL Support in Astro

## Brief

Right-to-left (RTL) language support requires careful consideration of layout, typography, and user interface elements to provide a natural experience for users of Arabic, Hebrew, Persian, and other RTL languages.

## Core Implementation

### Base Layout Configuration

```astro
---
// layouts/RTLLayout.astro
const { lang, dir = 'rtl' } = Astro.props;
---

<html lang={lang} dir={dir}>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body class="font-arabic">
    <slot />
  </body>
</html>
```

### Tailwind Configuration

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/text-direction')],
}
```

### Language Switcher Component

```astro
---
// components/LanguageSwitcher.astro
const languages = [
  { code: 'en', dir: 'ltr', label: 'English' },
  { code: 'ar', dir: 'rtl', label: 'العربية' }
];
---

<div class="flex gap-4">
  {languages.map(lang => (
    <a 
      href={`/${lang.code}`}
      class="px-3 py-1 rounded hover:bg-gray-100"
      hreflang={lang.code}
    >
      {lang.label}
    </a>
  ))}
</div>
```

### RTL-Aware Container

```astro
---
// components/RTLContainer.astro
---

<div class="flex [dir='rtl']:flex-row-reverse">
  <div class="me-4">Sidebar</div>
  <div>Main Content</div>
</div>
```

## Key Considerations

1. Typography
- Font selection supporting Arabic/Hebrew characters
- Adjust line height and letter spacing
- Number formatting and alignment

2. Layout
- Mirrored layouts
- Flex and Grid direction
- Margin and padding symmetry

3. UI Elements
- Icon direction
- Navigation flow
- Scroll direction
- Form elements alignment

4. Content
- Date formats
- Currency display
- Lists ordering
- Quote marks

## Recommended Libraries

- `@formatjs/intl`: Internationalization utilities
- `react-aria`: Accessibility and RTL-aware components
- `@tailwindcss/text-direction`: RTL utilities for Tailwind

## References

- [W3C - Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
- [MDN - RTL](https://developer.mozilla.org/en-US/docs/Glossary/rtl)
- [Tailwind CSS RTL](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [Google Material Design - RTL Guidelines](https://m2.material.io/design/usability/bidirectionality.html)