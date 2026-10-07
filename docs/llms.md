# Plan: Implementing `llms.txt` (Push/Aggregation Model)

## Objective
Implement `llms.txt` by aggregating content summaries from disparate data loaders ("models") into a central, global hub during the build process, and then writing this aggregated data to a static file.

## Rationale
The user prefers a "Push" model where data loaders (like `howto.ts` and `component.ts`) actively "emit" their simplified LLM representation to a central aggregator. This decoupling allows the loaders to own their data transformation logic while the aggregator simply handles storage and final output.

## Architecture

1.  **Central Aggregator (`LLMRegistry`)**:
    *   A singleton or global store (resilient to Astro module isolation) that holds the text segments.
    *   Exposes an `emit(section: string, item: LLMItem)` method.
2.  **Data Emitters (Loaders)**:
    *   **`howto.ts`**: Inside `onStoreItem`, transform the processed item into an LLM-friendly summary and emit to `LLMRegistry`.
    *   **`component.ts`**: Inside `onItem` / `loader`, do the same for products.
3.  **Output Generator**:
    *   **`src/pages/llms.txt.ts`**: An Astro endpoint that reads the fully populated `LLMRegistry` and returns the plain text response. Since Astro runs loaders before generating pages, the registry will be populated by the time this endpoint is executed.

## Implementation Steps

### 1. Create `LLMRegistry` in `packages/polymech/src/registry.ts`

Extending the existing `globalThis` pattern used by `PolymechRegistry`:

```typescript
// Define the shape of an LLM item
export interface LLMItem {
  title: string;
  url: string;
  description: string;
}

// Global store initialization
const G = globalThis as any;
if (!G.__LLM_REGISTRY__) {
  G.__LLM_REGISTRY__ = new Map<string, LLMItem[]>();
}

export class LLMRegistry {
  static add(section: string, item: LLMItem) {
    const store = G.__LLM_REGISTRY__ as Map<string, LLMItem[]>;
    if (!store.has(section)) store.set(section, []);
    store.get(section).push(item);
  }

  static getAll(): Map<string, LLMItem[]> {
    return G.__LLM_REGISTRY__;
  }
}
```

### 2. Update `howto.ts` (Model)

Modify `src/model/howto/howto.ts` to emit data.

```typescript
import { LLMRegistry } from '@/registry'; // Adjust import path

// In onStoreItem or complete() function:
const llmSummary = {
  title: item.title,
  url: `/howtos/${item.slug}`,
  description: item.description // Already filtered/summarized
};
LLMRegistry.add("How-To Guides", llmSummary);
```

### 3. Update `component.ts` (Model)

Modify `src/model/component.ts`:

```typescript
import { LLMRegistry } from '@/registry';

// In onItem function:
const llmSummary = {
  title: item.data.title,
  url: `/products/${item.data.slug}`, // Verify URL structure
  description: item.data.description || item.data.short_description
};
LLMRegistry.add("Products and Components", llmSummary);
```

### 4. Create Output Endpoint

Create `library.polymech/src/pages/llms.txt.ts`:

```typescript
import { LLMRegistry } from '@polymech/astro-base/registry'; // Adjust import

export const GET = async () => {
  const registry = LLMRegistry.getAll();
  let content = "# Polymech Documentation Index\n\n";

  // Sort sections for deterministic output
  const sections = Array.from(registry.keys()).sort();
  
  for (const section of sections) {
    content += `## ${section}\n\n`;
    const items = registry.get(section) || [];
    for (const item of items) {
        content += `- [${item.title}](${item.url}): ${item.description}\n`;
    }
    content += "\n";
  }

  return new Response(content.trim(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

## Verification
- Run `npm run build` or `npm run dev` and access `/llms.txt`.
- Check if all sections ("How-To Guides", "Products") are present.
