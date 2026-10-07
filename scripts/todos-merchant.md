## Todos

skip checked todos

- platform : windows
- environment : Astro (5.3+)
- language: Typescript, ESM
- dont use classes
- no lazy imports
- use pure functions
- each handler has the same function signature and naming

- [ ] create a registry of handlers, transforming json data to platform specific formats, in ../src/model/registry.ts, the input schema is provided (see ../polymech-mono/packages/commons/src/component.ts), create a new file per type, eg: ../src/model/rss.ts
  - [ ] "rss" (@astrojs/rss)
  - [ ] "merchant" (google)
  - [ ] "json-ld" (products)
- [ ] evaluate the registry on demand
