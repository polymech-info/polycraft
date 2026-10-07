import { IHowto, ICategory, ITag, IStep, IImage } from './howto-model.js';

type VersionStatus = 'enabled' | 'under_review' | 'new' | 'discarded';
type AuthorType = 'human' | 'ai';
type VersionId = string;
type AlternativeId = string;

/**
 * Extended Step interface that includes an enabled flag
 */
export interface ExtendedStep extends IStep {
  enabled: boolean; // Controls whether the step is active and visible
  alternativeId?: AlternativeId; // ID for grouping alternative steps
}

/**
 * Ordered step extending the base Step with explicit order.
 */
export interface OrderedStep extends ExtendedStep {
  order: number;
}

/**
 * Alternative step group for organizing steps with differ`ent approaches
 */
export interface AlternativeStepGroup {
  id: AlternativeId;
  title: string; // Descriptive title for the group of alternatives
  description?: string; // Optional description of the alternatives
  primaryStep: string; // ID of the primary/default step
  stepIds: string[]; // IDs of all steps in this alternative group
}

/**
 * Metadata for a specific how-to version.
 */
export interface VersionMetadata {
  id: VersionId; // Unique version ID
  author: string; // Author name (human or model)
  authorType: AuthorType; // Type of author
  createdAt: string; // ISO timestamp
  status: VersionStatus; // Review status
  parentVersionId?: VersionId; // Optional parent version
  comment?: string; // Optional version note
}

/**
 * A complete how-to version with metadata and ordered steps.
 */
export interface VersionedHowtoData  {
  metadata: VersionMetadata;
  title: string;
  description: string;
  tags?: ITag[];
  category?: ICategory;
  difficulty_level?: string;
  time?: string;
  cover_image?: IImage;
  steps: OrderedStep[];
  alternativeStepGroups?: AlternativeStepGroup[]; // New property for alternative steps
  files?: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  customFields?: Record<string, unknown>;
}

/**
 * Suggested changes to a version (can be human or AI-generated).
 */
export interface HowtoSuggestion {
  id: string;
  parentVersionId: VersionId;
  data: VersionedHowtoData;
  applied: boolean;
  createdAt: string;
}

/**
 * The root object representing a how-to with version history and metadata.
 */
export interface FileBasedHowto {
  id: string;
  slug: string;
  currentVersionId: VersionId;
  versions: Record<VersionId, VersionedHowtoData>;
  suggestions?: HowtoSuggestion[];
  previousSlugs?: string[];
  meta: {
    createdBy: string;
    createdAt: string;
    lastModifiedAt: string;
    lastModifiedBy: string;
    deleted: boolean;
    moderation: string;
    total_views: number;
    total_downloads: number;
  };
}

/**
 * Describes the expected folder and file layout on disk.
 */
export interface HowtoFileStructure {
  baseDir: string;
  getHowtoDir(howtoId: string): string;
  getHowtoMetadataPath(howtoId: string): string;
  getVersionPath(howtoId: string, versionId: VersionId): string;
  getImageDir(howtoId: string): string;
  getSuggestionsDir(howtoId: string): string;
  getFilesDir(howtoId: string): string;
}

/**
 * Defines all operations for managing the how-to lifecycle.
 */
export interface HowtoService {
  createHowto(data: Pick<VersionedHowtoData, 'title' | 'description' | 'steps'>, 
              author: string, authorType: AuthorType): Promise<FileBasedHowto>;

  createVersion(howtoId: string, data: VersionedHowtoData, author: string, 
                authorType: AuthorType): Promise<VersionedHowtoData>;

  createSuggestion(howtoId: string, data: VersionedHowtoData, author: string, 
                  authorType: AuthorType): Promise<HowtoSuggestion>;

  applySuggestion(howtoId: string, suggestionId: string): Promise<VersionedHowtoData>;

  getHowto(idOrHandle: string): Promise<FileBasedHowto>;

  getVersion(howtoId: string, versionId: VersionId): Promise<VersionedHowtoData>;

  setActiveVersion(howtoId: string, versionId: VersionId): Promise<FileBasedHowto>;

  discardVersion(howtoId: string, versionId: VersionId): Promise<VersionedHowtoData>;

  compareVersions(howtoId: string, version1Id: VersionId, version2Id: VersionId): Promise<{
    diff: unknown;
  }>;

  /**
   * Create an alternative step for an existing step
   * @param howtoId ID of the howto
   * @param versionId ID of the version
   * @param stepId ID of the step to create an alternative for
   * @param newStepData Data for the new alternative step
   */
  createAlternativeStep(
    howtoId: string,
    versionId: VersionId,
    stepId: string,
    newStepData: Omit<OrderedStep, 'order' | 'alternativeId'>
  ): Promise<VersionedHowtoData>;

  /**
   * Manage alternative step groups
   * @param howtoId ID of the howto
   * @param versionId ID of the version
   * @param alternativeId ID of the alternative group
   * @param newData New data for the alternative group
   */
  manageAlternativeGroup(
    howtoId: string,
    versionId: VersionId,
    alternativeId: AlternativeId,
    newData: Partial<AlternativeStepGroup>
  ): Promise<VersionedHowtoData>;

  /**
   * Toggle the enabled state of a step
   * @param howtoId ID of the howto
   * @param versionId ID of the version
   * @param stepId ID of the step to toggle
   * @param enabled The new enabled state
   */
  toggleStepEnabled(
    howtoId: string,
    versionId: VersionId,
    stepId: string,
    enabled: boolean
  ): Promise<VersionedHowtoData>;

  convertLegacyHowto(howto: IHowto, author: string): Promise<FileBasedHowto>;

  convertToLegacyFormat(howto: FileBasedHowto): Promise<IHowto>;
}

/**
 * Utility functions for creating and converting how-to data.
 */
export const utils = {
  // Create a blank versioned how-to template
  createEmptyVersionedHowtoData: (
    author: string,
    authorType: AuthorType
  ): VersionedHowtoData => ({
    metadata: {
      id: crypto.randomUUID(),
      author,
      authorType,
      createdAt: new Date().toISOString(),
      status: 'new',
    },
    title: '',
    description: '',
    steps: [],
    alternativeStepGroups: [], // Initialize empty alternative step groups
  }),

  // Create a base FileBasedHowto from versioned data
  createEmptyFileBasedHowto: (
    versionData: VersionedHowtoData
  ): FileBasedHowto => ({
    id: crypto.randomUUID(),
    slug: '',
    currentVersionId: versionData.metadata.id,
    versions: { [versionData.metadata.id]: versionData },
    suggestions: [],
    meta: {
      createdBy: versionData.metadata.author,
      createdAt: versionData.metadata.createdAt,
      lastModifiedAt: versionData.metadata.createdAt,
      lastModifiedBy: versionData.metadata.author,
      deleted: false,
      moderation: 'pending',
      total_views: 0,
      total_downloads: 0,
    },
  }),

  // Create an alternative step group
  createAlternativeStepGroup: (primaryStep: string, title: string): AlternativeStepGroup => ({
    id: crypto.randomUUID(),
    title,
    primaryStep,
    stepIds: [primaryStep],
  }),

  // Convert legacy steps to ordered ones with enabled flag
  convertToOrderedSteps: (steps: IStep[]): OrderedStep[] =>
    steps.map((step, index) => ({
      ...step,
      order: index + 1,
      enabled: true, // By default, all legacy steps are enabled
    })),

  // Convert ordered steps back to legacy format (unordered)
  convertFromOrderedSteps: (steps: OrderedStep[]): IStep[] =>
    [...steps]
      .filter(step => step.enabled) // Only include enabled steps
      .sort((a, b) => a.order - b.order)
      .map(({ order, enabled, alternativeId, ...rest }) => rest),

  // Find all alternative steps for a given step
  getAlternativeSteps: (stepId: string, steps: OrderedStep[], alternativeGroups: AlternativeStepGroup[]): OrderedStep[] => {
    const group = alternativeGroups.find(g => g.stepIds.includes(stepId));
    if (!group) return [];
    return steps.filter(step => group.stepIds.includes(step._animationKey));
  },

  // Convert a legacy IHowto into a VersionedHowtoData
  convertLegacyToVersioned: (
    howto: IHowto,
    author: string
  ): VersionedHowtoData => ({
    metadata: {
      id: crypto.randomUUID(),
      author,
      authorType: 'human',
      createdAt: howto._created || new Date().toISOString(),
      status: 'enabled',
    },
    title: howto.title,
    description: howto.description,
    tags: howto.tags,
    category: howto.category,
    difficulty_level: howto.difficulty_level,
    time: howto.time,
    cover_image: howto.cover_image,
    steps: utils.convertToOrderedSteps(howto.steps || []),
    alternativeStepGroups: [], // Initialize with no alternative steps
  }),
};
