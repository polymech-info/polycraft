import {
  IAnnotation,
  createDescriptionAnnotation,
  createStepAnnotationByTitle,
  generateAnnotationCacheKey
} from './annotation.js';
import { IHowto } from '../howto/howto-model.js';
import { get_cached, set_cached_object } from '@polymech/cache';

/**
 * Example of creating annotations for a Howto document
 */
export function createExampleAnnotations(howto: IHowto): IAnnotation[] {
  // Create an annotation for the main description
  const descriptionAnnotation = createDescriptionAnnotation(
    howto,
    "This is a revised description of how to cut shapes with a CNC device.",
    {
      source: "AI assistant",
      user: {
        model: "GPT-4",
        prompt: "Improve the description to be more concise"
      }
    }
  );

  // Create an annotation for a specific step by title
  const stepAnnotation = createStepAnnotationByTitle(
    howto,
    "Secure sheet",
    "Use the CNC clamps to securely fasten the plastic sheet to the work table. Ensure all corners are tightened to prevent any movement during cutting.",
    {
      source: "Howto editor",
      user: {
        reason: "Add safety details"
      }
    }
  );

  // Demonstrate using the cache key
  const cacheKey = generateAnnotationCacheKey(descriptionAnnotation);
  console.log(`Cache key for annotation: ${cacheKey}`);

  // Save to cache
  set_cached_object(cacheKey, descriptionAnnotation);

  // Retrieve from cache
  const cachedAnnotation = get_cached(cacheKey) as IAnnotation;
  console.log(`Retrieved annotation content: ${cachedAnnotation?.content}`);

  return [descriptionAnnotation, stepAnnotation];
}

/**
 * Demonstrate how to apply the annotations to a howto
 */
export function applyAnnotationToHowto(howto: IHowto, annotation: IAnnotation): IHowto {
  // Create a deep copy of the original howto
  const modifiedHowto = JSON.parse(JSON.stringify(howto));

  // Apply annotation based on the path
  if (annotation.path === '$.description') {
    // For the main description
    if (annotation.mode === 'replace') {
      modifiedHowto.description = annotation.content as string;
    } else if (annotation.mode === 'prepend') {
      modifiedHowto.description = `${annotation.content}\n${modifiedHowto.description}`;
    } else if (annotation.mode === 'append') {
      modifiedHowto.description = `${modifiedHowto.description}\n${annotation.content}`;
    }
  } else if (annotation.path.startsWith('$.steps[')) {
    // For step descriptions
    // Extract the step index from the path
    const indexMatch = annotation.path.match(/\$.steps\[(\d+)\]/);
    if (indexMatch) {
      const stepIndex = parseInt(indexMatch[1], 10);
      
      // Apply modification based on the mode
      if (annotation.mode === 'replace') {
        modifiedHowto.steps[stepIndex].text = annotation.content as string;
      } else if (annotation.mode === 'prepend') {
        modifiedHowto.steps[stepIndex].text = `${annotation.content}\n${modifiedHowto.steps[stepIndex].text}`;
      } else if (annotation.mode === 'append') {
        modifiedHowto.steps[stepIndex].text = `${modifiedHowto.steps[stepIndex].text}\n${annotation.content}`;
      }
    }
  }

  return modifiedHowto;
}
