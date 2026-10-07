# Howto File-Based Workflow Documentation

This document explains the new file-based workflow design for the Howto system, focusing on versioning and collaboration features.

## Overview

The new Howto system improves upon the previous solution by addressing several key issues:

1. **Explicit step ordering**: Steps now have an explicit order field rather than relying solely on array position

2. **Versioning**: Howtos have full version history with metadata tracking changes, authors, and status
   
3. **Suggestions workflow**: Allows both humans and AI to suggest changes that can be accepted or discarded

4. **File-based approach**: Each howto and version is stored in its own file structure, making it easier to manage with tools and IDEs

## Key Features

### Explicit Step Ordering

The new system replaces the implicit ordering of steps in an array with explicit order numbers:

```typescript
// Old approach: Steps were ordered based on array position
const howto = {
  steps: [
    { title: "Step 1", text: "..." },
    { title: "Step 2", text: "..." }
  ]
};

// New approach: Explicit order numbers
const howto = {
  steps: [
    { title: "Step 1", text: "...", order: 1 },
    { title: "Step 2", text: "...", order: 2 }
  ]
};
```

Advantages:

* Reordering steps doesn't require rearranging the entire array
* Easier to insert steps between existing steps (can use decimal orders like 1.5, 1.6)
* Simplifies syncing and merging versions 


### Versioning System

The new model includes robust versioning that tracks:

1. **Author information**: Who created the version (human or AI model)
2. **Timestamps**: When the version was created
3. **Status**: Whether the version is enabled, under review, new, or discarded
4. **Parent-child relationships**: Which version a new version is based on

Versions are stored in separate files, allowing for clear version history and comparison. Each howto has:

* A main metadata file (`index.json`)
* Individual version files (`v1.json`, `v2.json`)
* A current version pointer

### Suggestions Workflow

A key feature is the suggestions workflow, which allows:

1. Both humans and AI to suggest changes to existing howtos
2. Editors to review suggestions and choose which to accept
3. Tracking of suggestion metadata (who made it, when, based on which version)

Suggestions follow this flow:

1. A user or AI creates a suggestion based on an existing version
2. The suggestion is stored in the `suggestions/` directory for that howto
3. An editor can review the suggestion and decide to:
   - Apply it -> Creates a new version
   - Modify it -> Creates a new version based on the suggestion with changes
   - Discard it -> Marks it as discarded but keeps it for reference

### File-Based Structure

Each howto has its own directory with the following structure:

```
howtos/
  ═ <howto-id>/
     ═ index.json                // Main howto metadata
     |═ versions/
     |  ═ <version-id>.json      // Version 1 data
     |  ═ <version-id>.json      // Version 2 data
     |═ images/                  // Images for this howto
     |═ files/                   // Attached files
     ═ suggestions/              // Suggestions
        ═ <suggestion-id>.json  // Suggestion 1
         ═ <suggestion-id>.json  // Suggestion 2
```

This structure enables:

* Easy browsing and editing in an IDE
* Simple version comparison through version control tools
* Clear separation of versions and suggestions
* Efficient storage of assets like images

## Working with the New System

### Creating a New Howto

To create a new howto:

```typescript
const howtoService = new HowtoService();

// Create a new howto
const newHowto = await howtoService.createHowto) {
  title: "How to Recycle Plastic Bottles",
  description: "A guide to recycling plastic bottles at home",
  steps: [] // Start empty, will add steps later
}, "john_doe", "human");
```

### Adding a New Version

To create a new version of an existing howto:

```typescript
// Get the current version
const howto = await howtoService.getHowto("howto-id");
const currentVersion = howto.versions[howto.currentVersionId];

// Create a new version with changes
const newVersionData = {
  metadata: {
    id: crypto.randomUUID(),
    author: "sarah_smith",
    authorType: "human",
    createdAt: new Date().toISOString(),
    status: "new",
    parentVersionId: howto.currentVersionId,
    comment: "Added more details to step 2"
  },
  // Copy and modify the current version data
  ...currentVersion,
  title: "Improved: How to Recycle Plastic Bottles",
  steps: [...currentVersion.steps] // Modify as needed
};

const newVersion = await howtoService.createVersion("howto-id", newVersionData, "sarah_smith", "human");
```

### Having AI Suggest Improvements

To have AI create a suggestion:

```typescript
// Get the current howto
const howto = await howtoService.getHowto("howto-id");
const currentVersion = howto.versions[howto.currentVersionId];

// Send to AI for recommended improvements (pseudo-code)
const aiSuggestion = await aiService.getHowtoImprovements(currentVersion);

// Create a formal suggestion from the AI's recommendation
const suggestion = await howtoService.createSuggestion(
  "howto-id", 
  aiSuggestion.data, 
  "gpt-4", 
  "ai"
);
```

### Reviewing and Applying Suggestions

To review and apply a suggestion:

```typescript
// Get the howto with its suggestions
const howto = await howtoService.getHowto("howto-id");
const suggestions = howto.suggestions || [];

// Review a specific suggestion
const suggestionToReview = suggestions[0];

// If you like it, apply it
const newVersion = await howtoService.applySuggestion("howto-id", suggestionToReview.id);

// Set it as the active version
const updatedHowto = await howtoService.setActiveVersion("howto-id", newVersion.metadata.id);
```

### Comparing Versions

To compare two versions:

```typescript
// Compare two versions of a howto
const diff = await howtoService.compareVersions("howto-id", "version-1-id", "version-2-id");

// Display the differences in a user interface
diffViewer.render(diff);
```

## Benefits For Different Users

### For Content Creators

* See all versions of your howtos and their changes over time
* Get AI-assisted improvement suggestions
- Collaborate with others through the suggestions workflow

### For Editors/Moderators

* Easily review suggestions from both humans and AI
* Track all changes to howtos with detailed metadata
* Compare versions side-by-side to see improvements

### For Developers

* File-based approach makes it easier to work with in IDEs
* Clear separation of concerns between metadata, versions, and suggestions
* Strong typing with TypeScript for better code quality

## Converting Legacy Data

The framework includes utilities to convert existing howtos to the new format:

```typescript
// Convert a legacy howto to the new format
const legacyHowto = await legacyService.getHowto("howto-id");
const convertedHowto = await howtoService.convertLegacyHowto(legacyHowto, "migration-tool");
```

## Conclusion

The new file-based workflow with versioning and suggestions support provides a more robust and collaborative way to create and manage howtos. By introducing explicit step ordering, file-based storage, and metadata for versioning, the system addresses the limitations of the previous approach while providing new functionality for both human and AI collaboration. This new approach allows for more flexible content creation, easier management, and a better developer experience.

## Next Steps

1. Implement file-based storage mechanisms
2. Develop user interfaces for working with versions and suggestions
3. Integrate AI services for automatic suggestions
4. Migrate existing howtos to the new format
