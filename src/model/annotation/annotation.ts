import { IHowto } from '../howto/howto-model.js';
import { file_hash, 
  file_name_hash, 
  fileAsBuffer, 
  get_cached, 
  get_cache_key, 
  set_cached_object } from "@polymech/cache"
import * as z from 'zod';

/**
 * Annotation mode defines how the annotation should be applied to the target content
 */
export enum AnnotationMode {
  REPLACE = 'replace',
  PREPEND = 'prepend',
  APPEND = 'append',
}

/**
 * User settings related to AI generation
 */
const UserSchema = z.object({
  /** AI model used (if AI generated) */
  model: z.string().optional(),
  /** Prompt used to generate the content (if AI generated) */
  prompt: z.string().optional(),
  /** Source of the annotation (author name or AI system) */
  source: z.string().default("un-attributed"),
});

/**
 * Interface for Howto annotations.
 * Annotations can provide alternative content for any part of IHowto objects
 * using jsonpath-plus selectors to target specific fields.
 */
const AnnotationSchema = z.object({
  /** JSONPath-plus string targeting any field in IHowto or its steps */
  path: z.string().default('$'), // root jsonPath by default
  
  /** Timestamp when the annotation was created */
  date: z.string().default(new Date().toISOString()), 
  /** The alternate content */
  content: z.union([z.string(), z.instanceof(Buffer)]).default(""),
  
  /** Whether the annotation is enabled */
  enabled: z.boolean().default(true),
  
  /** Version of the annotation */
  version: z.string().default('1.0.0'),
  
  /** Application mode for the annotation */
  mode: z.enum([AnnotationMode.REPLACE, AnnotationMode.PREPEND, AnnotationMode.APPEND])
    .default(AnnotationMode.REPLACE),
  
  /** Title/description of the annotation (optional) */
  title: z.string().optional(),  
  
  /** ID of the howto the annotation is associated with */
  owner: z.string(),
  
  /** User and AI related settings */
  user: UserSchema.default({}),
});

type IUser = z.infer<typeof UserSchema>;
export type IAnnotation = z.infer<typeof AnnotationSchema>;

/**
 * Generates a custom cache key based on annotation characteristics
 * @param annotation - The annotation to generate a key for
 * @returns A unique cache key string
 */
export function generateCacheKey(annotation: IAnnotation): string {
  const components = [
    annotation.user.model || "no-model",
    annotation.user.prompt ? file_hash(annotation.user.prompt) : "no-prompt",
    annotation.date.split('T')[0], // Just the date part
    typeof annotation.content === 'string'
      ? file_hash(annotation.content)
      : 'buffer-content'
  ].join('_');
  
  return `annotation_${annotation.owner}_${annotation.path}_${components}`;
}

/**
 * Creates a default annotation with common settings and overrides
 * @param overrides - Optional properties to override defaults
 * @returns A new IAnnotation object with defaults applied
 */
export function createDefaultAnnotation(owner: string, overrides?: Partial<IAnnotation>): IAnnotation {
  return AnnotationSchema.parse({
    owner,
    ...overrides,
  });
}

/**
 * Creates an annotation for a Howto description
 * @param howto The howto object
 * @param content New description content
 * @param overrides Additional annotation properties to override
 * @returns A new IAnnotation object targeting the howto description
 */
export function createDescriptionAnnotation(howto: IHowto, content: string, overrides?: Partial<IAnnotation>): IAnnotation {
  return createDefaultAnnotation(howto.slug, {
    path: '$.description',
    content,
    title: `Description override for ${howto.title}`,
    ...overrides
  });
}

/**
 * Creates an annotation for a specific step by index
 * @param howto The howto object
 * @param stepIndex Index of the step to target (0-based)
 * @param content New step description content
 * @param overrides Additional annotation properties to override
 * @returns A new IAnnotation object targeting the specified step
 */
export function createStepAnnotationByIndex(
  howto: IHowto,
  stepIndex: number,
  content: string,
  overrides?: Partial<IAnnotation>
): IAnnotation {
  if (stepIndex < 0 || stepIndex >= howto.steps.length) {
    throw new Error(`Invalid step index: ${stepIndex}. Maximum index is ${howto.steps.length - 1}`);
  }

  const stepTitle = howto.steps[stepIndex].title;

  return createDefaultAnnotation(howto.slug, {
    path: `$.steps[${stepIndex}].text`,
    content,
    title: `Step ${stepIndex + 1} (${stepTitle}) override for ${howto.title}`,
    ...overrides
  });
}

/**
 * Creates an annotation for a specific step by step title
 * @param howto The howto object
 * @param stepTitle Title of the step to target 
 * @param content New step description content
 * @param overrides Additional annotation properties to override
 * @returns A new IAnnotation object targeting the specified step
 */
export function createStepAnnotationByTitle(
  howto: IHowto,
  stepTitle: string,
  content: string,
  overrides?: Partial<IAnnotation>
): IAnnotation {
  const stepIndex = howto.steps.findIndex(step => step.title.trim() === stepTitle.trim());

  if (stepIndex === -1) {
    throw new Error(`Step with title "${stepTitle}" not found in howto "${howto.title}"`);
  }

  return createStepAnnotationByIndex(howto, stepIndex, content, overrides);
}

/**
 * Cache an annotation for later use
 * @param annotation The annotation to cache
 * @returns The cache key used
 */
export function cacheAnnotation(annotation: IAnnotation): string {
  const cacheKey = generateCacheKey(annotation);
  set_cached_object(cacheKey, annotation);
  return cacheKey;
}

/**
 * Retrieve a cached annotation
 * @param annotation The annotation to retrieve (only needs owner, path, and user data)
 * @returns The cached annotation or null
 */
export function getCachedAnnotation(annotation: Partial<IAnnotation>): IAnnotation | null {
  if (!annotation.owner || !annotation.path) return null;
  const cacheKey = generateCacheKey(annotation as IAnnotation);
  return get_cached(cacheKey) as IAnnotation | null;
}
