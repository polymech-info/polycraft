import { JSONPath } from 'jsonpath-plus';
import { readFile, readdirSync } from 'fs';
import { resolve, extname, join } from 'path';
import { IHowto } from '../howto/howto-model.js';
import { IAnnotation, AnnotationMode, generateCacheKey, cacheAnnotation, getCachedAnnotation } from './annotation.js';
import { promisify } from 'util';

const readFileProm = promisify(readFile);

/**
 * Loads annotations from a directory path
 * @param directoryPath - Path to directory containing annotation files
 * @returns Array of loaded annotations
 */
export async function loadAnnotationsFromPath(directoryPath: string): Promise<IAnnotation[]> {
  try {
    // Get all JSON files from the directory
    const files = readdirSync(directoryPath).filter(
      file => extname(file).toLowerCase() === '.json'
    );

    // Process all files in parallel
    const annotationsPromises = files.map(async (file) => {
      const filePath = join(directoryPath, file);
      const content = await readFileProm(filePath, 'utf8');
      try {
        return JSON.parse(content) as IAnnotation;
      } catch (error) {
        console.error(`Error parsing annotation file ${filePath}:`, error);
        return null;
      }
    });

    // Wait for all files to be processed and filter out any nulls
    const annotations = (await Promise.all(annotationsPromises)).filter(
      (annotation): annotation is IAnnotation => annotation !== null
    );

    return annotations;
  } catch (error) {
    console.error(`Error loading annotations from ${directoryPath}:`, error);
    return [];
  }
}

/**
 * Applies an annotation to a target object using JSONPah and the specified mode
 * @param targetObject - The object to modify (IHowto in this case)
 * @param annotation - The annotation to apply
 * @returns The modified target object
 */
export function applyAnnotation<T extends Record<string, any>> 
 (targetObject: T, annotation: IAnnotation): T {
  
  // If the annotation is not enabled, return the target object unchanged
  if (!annotation.enabled) {
    return targetObject;
  }
  
  // Use JSONPath to find the target value
  const nodes = JSONPath.nodes(targetObject, annotation.path);
  
  if (nodes.length === 0) {
    console.warn(`No nodes found for path: ${annotation.path} in target object`);
    return targetObject;
  }

  // Apply the annotation to each node
  for (const node of nodes) {
    const originalValue = node.value;
    const content = typeof annotation.content === 'string'
      ? annotation.content
      : annotation.content.toString('utf8');

    // Apply different modes
    switch (annotation.mode) {
      case AnnotationMode.REPLACE:
        node.target[node.path[node.path.length - 1]] = content;
        break;
      case AnnotationMode.PREPEND:
        node.target[node.path[node.path.length - 1]] = content + originalValue;
        break;
      case AnnotationMode.APPEND:
        node.target[node.path[node.path.length - 1]] = originalValue + content;
        break;
    }
  }
  
  return targetObject;
}

/**
 * Applies multiple annotations to a howto object
 * @param howto - The howto object to modify
 * @param annotations - Array of annotations to apply
 * @returns The modified howto object
 */
export function patchHowtoWithAnnotations(howto: IHowto, annotations: IAnnotation[]): IHowto {
  // Filter annotations applicable to this howto by owner (e.g. howto.slug)
  const applicableAnnotations = annotations.filter(
    (annotation) => annotation.owner === howto.slug && annotation.enabled
  );
    
  // Clone the howto to avoid mutating the original
  const patchedHowto = JSON.parse(JSON.stringify(howto)) as IHowto;

  // Apply each annotation (maintaining order)
  for (const annotation of applicableAnnotations) {
    applyAnnotation(patchedHowto, annotation);
  }

  return patchedHowto;
}

/**
 * Example of how to cache and retrieve an annotation
 * @param annotation - The annotation to cache
 * @returns The cached annotation and its key
 */
export function cacheAnnotationExample(annotation: IAnnotation) {
  // Cache the annotation
  const cacheKey = cacheAnnotation(annotation);
  console.log(`Annotation cached with key: ${cacheKey}`);

  // Retrieve it later
  const cachedAnnotation = getCachedAnnotation({ 
    owner: annotation.owner,
    path: annotation.path,
    user: annotation.user
  });

  // Clone the annotation to show we're working with a copy
  return { 
    cacheKey, original: annotation, cached: cachedAnnotation 
  };
}

// --------------------------------------------------------------------------------
// Example usage
// --------------------------------------------------------------------------------

async function example() {
  // Example howto data (partial)
  const exampleHowto: IHowto = { slug: "cut-out-shapes-out-of-plastic-sheets-with-a-cnc-",
    title: "Cut out shapes out of plastic sheets with a CNC ",
    description: "In this how to, I will show you our process to cut HDPE Sheets using a X-Carve CNC.\n\nHere is the full video in spanish with subtitles https://www.youtube.com/watch?v=4LrrFz802To ",
    steps: [
      {
        title: "Measure the plastic sheet",
        text: "For this step we need to measure our plastic sheet: Height, Width and Thickness.  Our X-Carve machine works with the CAM Software EASEL, for me, the easiest software for CNC milling out there. \n\nThe cool thing about Easel (https://easel.inventables.com/) is that you can \"simulate\" your actual material and THEY EVEN HAVE HDPE 2-Colors in their cutting material lists!!\n\n\n",
        images: []
      },
      {
        title: "Secure sheet ",
        text: "Using the CNC clamps from the X-Carve, secure the sheet to the table, ",
        images: []
      },
      {
        title: "Follow the cutting Wizzard",
        text: "Now with the file we can choose the width we want to carve/cut and then we go to cut and start the wizzard:\n- We check that the sheet is fixed.\n- We also specify the cutting bit, we are using a 1/8 flat flute bit. \n- We tell the machine where the coordinate 0-0 is, which we always choose as the down left corner.\n- We raise the bit, turn on the Router!!!\n\nAND PUM THE MAGIC BEGINS!!",
        images: []
      }
    ],
    // Other necessary fields
    _id: "789",
    _createdBy: "gus-merckel",
    _modified: "2023-10-27T18:09:36.519Z",
    _created: "2023-08-23T18:20:09.098Z",
    votedUsefulBy: [],
    creatorCountry: "mx",
    total_downloads: 0,
    time: "< 5 hours",
    moderation: "accepted",
    cover_image: {
      name: "IMG_20200605_142311.jpg",
      downloadUrl: "https://firebasestorage.googleapis.com/v0/b/onearmyworld.appspot.com/o/uploads%2Fhowtos%2F038gjWgLjiyYknBejDeI%2FIMG_20200605_142311.jpg?alt=media&token=c272c174-1adc-45af-967b-771adce7295d",
      type: "image/jpeg",
      fullPath: "uploads/howtos/038gjWgLjiyYknBejDeI/IMG_20200605_142311.jpg",
      updated: "2021-04-05T15:09:00.605Z",
      size: 124661,
      timeCreated: "2021-04-05T15:09:00.605Z",
      contentType: "image/jpeg",
      src: "/resources/howtos/cut-out-shapes-out-of-plastic-sheets-with-a-cnc-/IMG_20200605_142311.jpg",
      alt: "IMG_20200605_142311.jpg"
    },
    files: [],
    category: {     label: "uncategorized"    }
    //...truncated for brevity
  };

  // 1. Create a few annotations:

  // (a) Annotation for the howto description
  const descriptionAnnotation: IAnnotation = {
    path: "$.description",
    date: new Date().toISOString(),
    content: "IM NEVEST DESCRIPTION: Learn how to cut HDPE sheets precisely using a CNC X-Carve machine. This step-by-step guide shows how to properly measure, secure, and cut plastic sheets for your upcycling projects. Includes tips for using Easel CAM software and proper cutting techniques.",
    enabled: true,
    version: "1.0.0",
    mode: AnnotationMode.REPLACE,
    title: "Enhanced howto description",
    owner: "cut-out-shapes-out-of-plastic-sheets-with-a-cnc-",
    user: {
      model: "gpt-4",
      prompt: "Rewrite this description to be more detailed and informative",
      source: "AI Helper"
    }
  };

  // (b) Annotation for the third step "Follow the cutting Wizzard"
  const stepAnnotation: IAnnotation = {
    path: "$.steps[2].text",
    date: new Date().toISOString(),
    content: "Now with the file we can choose the width for cutting and then start the cutting procedure:\n\n1. First, verify that the sheet is securely clamped to prevent any movement\n2. Select the proper cutting bit - we recommend a 1/8 inch flat flute bit for HDPE\n3. Set the machine coordinates - always change the 0,0 point to the bottom left corner of your material\n4. Raise the bit to the safe height and turn on the CNC Router\n5. In Easel, press the cut button to begin\n\nThe CNC will now precisely cut your design. Make sure to monitor the process and have your emergency stop ready if needed. Depending on the complexity of your design and thickness of the sheet, this may take anywhere from a few minutes to an hour.",
    enabled: true,
    version: "1.0.0",
    mode: AnnotationMode.REPLACE,
    title: "Improved cutting wizard instructions",
    owner: "cut-out-shapes-out-of-plastic-sheets-with-a-cnc-",
    user: {
      model: "gpt-4",
      prompt: "Rewrite this step to be more detailed and user friendly, with numbered steps",
      source: "AI Helper"
    }
  };

  // 2. Apply annotations to the howto object
  const patchedHowto = patchHowtoWithAnnotations(exampleHowto, [
    descriptionAnnotation, stepAnnotation
  ]);

  // Log the changes (comparing original to patched)
  console.log(`Original description: ${exampleHowto.description.slice(0, 50)}...`);
  console.log(`Patched description: ${patchedHowto.description.slice(0, 50)}...`);
  console.log(`Original step 3: ${exampleHowto.steps[2].text.slice(0, 50)}...`);
  console.log(`Patched step 3: ${patchedHowto.steps[2].text.slice(0, 50)}...`);

  // 3. Cache an annotation
  const cachedResult = cacheAnnotationExample(descriptionAnnotation);

  // Verify that the original and cached annotation are equivalent
  const areEquivalent = JSON.stringify(cachedResult.original) === JSON.stringify(cachedResult.cached);
  console.log(`Cached annotation matches original: ${areEquivalent}`);
}

// Uncomment to run the example
// example().then(() => console.log('Example completed successfully'));
