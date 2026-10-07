///////////////////////////////////////////////
//
//  trimming Exif data

export const removeBufferValues = (obj: any): any => {
  for (const key in obj) {
    const val = obj[key]
    if (Buffer.isBuffer(val)) {
    }
    if (Buffer.isBuffer(val)) {
      delete obj[key];
    } else if (typeof val === 'object') {
      removeBufferValues(val);
    }
  }
  return obj;
}
export const removeArrayValues = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  for (const key in obj) {
    const val = obj[key]
    if (val === null || val === undefined) continue;
    if (key == 'id') {
      delete obj[key]
    }
    if (Array.isArray(val) || Buffer.isBuffer(val)) {
      try {
        delete obj[key];
      } catch (e) {
        debugger
      }

    } else if (typeof obj[key] === 'object') {
      removeArrayValues(obj[key]);
    }
  }
  return obj
}
export const removeEmptyObjects = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  for (const key in obj) {
    const val = obj[key]
    if (val === null || val === undefined) continue;
    if (typeof val === 'object' ||
      (key == 'value' && typeof val === 'number' && val === 0 || key == 'base64')
    ) {
      obj[key] = removeEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
  return obj
}
export const removeArrays = (obj: any): any => {
  for (const key in obj) {
    if (key == 'description' && typeof obj[key] === 'string' && obj[key].split(',').length > 2) {
      try {
        if (Buffer.isBuffer(Buffer.from(obj[key].split(',').join(','))))
          delete obj[key]
      } catch (e) {

      }
    } else if (typeof obj[key] === 'object') {
      removeArrays(obj[key]);
    }
  }
  return obj
}