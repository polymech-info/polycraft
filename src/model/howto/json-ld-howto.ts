import { IHowto } from './howto-model.js';
// https://schema.org/HowTo
export const get = (howto: IHowto, baseUrl: string = 'creava.org', lang: string = 'en') => {
  const jsonLD: any = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howto.title,
    "description": howto.description,
    "url": `https://${baseUrl}/${lang}/howtos/${howto.slug}`,
    "inLanguage": lang
  };

  if (howto.cover_image?.downloadUrl) {
    jsonLD.image = howto.cover_image.downloadUrl;
  }

  // Add user location if available
  if (howto.user?.geo) {
    jsonLD.locationCreated = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": howto.user.geo.countryName,
        "addressRegion": howto.user.geo.principalSubdivision,
        "addressLocality": howto.user.geo.city,
        "postalCode": howto.user.geo.postcode
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": howto.user.geo.latitude,
        "longitude": howto.user.geo.longitude
      }
    };
  }

  // Extract video URL from description or steps
  const videoUrl = extractVideoUrl(howto);
  if (videoUrl) {
    jsonLD.video = {
      "@type": "VideoObject",
      "url": videoUrl
    };
  }

  if (howto.time) {
    let duration = "";
    const timeMatch = howto.time.match(/(\d+)\s*(hour|minute|second|day|week|month|year)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      
      switch(unit) {
        case 'hour': duration = `PT${value}H`; break;
        case 'minute': duration = `PT${value}M`; break;
        case 'second': duration = `PT${value}S`; break;
        case 'day': duration = `P${value}D`; break;
        case 'week': duration = `P${value}W`; break;
        case 'month': duration = `P${value}M`; break;
        case 'year': duration = `P${value}Y`; break;
      }
    } else if (howto.time.includes('<')) {
      const lessTimeMatch = howto.time.match(/< (\d+)\s*(hour|minute|second|day|week|month|year)/i);
      if (lessTimeMatch) {
        const value = parseInt(lessTimeMatch[1], 10);
        const unit = lessTimeMatch[2].toLowerCase();
        
        switch(unit) {
          case 'hour': duration = `PT${value - 1}H`; break;
          case 'minute': duration = `PT${value - 1}M`; break;
          case 'second': duration = `PT${value - 1}S`; break;
          case 'day': duration = `P${value - 1}D`; break;
          case 'week': duration = `P${value - 1}W`; break;
          case 'month': duration = `P${value - 1}M`; break;
          case 'year': duration = `P${value - 1}Y`; break;
        }
      }
    }
    
    if (duration) {
      jsonLD.totalTime = duration;
    }
  }

  if (howto.difficulty_level) {
    jsonLD.difficultyLevel = howto.difficulty_level;
  }

  if (howto.category?.label) {
    jsonLD.category = howto.category.label;
  }

  if (howto.tags && howto.tags.length > 0) {
    const keywords = howto.tags.map(tag => 
      typeof tag === 'string' ? tag : tag?.label || ''
    ).filter(Boolean).join(', ');
    
    if (keywords) {
      jsonLD.keywords = keywords;
    }
  }

  if (howto.steps && howto.steps.length > 0) {
    jsonLD.step = howto.steps.map((step, index) => {
      const stepObj: any = {
        "@type": "HowToStep",
        "name": step.title,
        "text": step.text,
        "position": index + 1
      };

      if (step.images && step.images.length > 0) {
        if (step.images.length === 1) {
          stepObj.image = step.images[0].downloadUrl;
        } else {
          stepObj.image = step.images.map(image => image.downloadUrl);
        }
      }

      return stepObj;
    });
  }

  return jsonLD;
};

// Helper function to extract video URL from description or steps
function extractVideoUrl(howto: IHowto): string | null {
  // First try to find video URL in description
  if (howto.description) {
    const videoMatch = howto.description.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\/[^\s]+)/i);
    if (videoMatch) {
      return videoMatch[1];
    }
  }

  // Then try to find video URL in steps
  if (howto.steps) {
    for (const step of howto.steps) {
      if (step.text) {
        const videoMatch = step.text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\/[^\s]+)/i);
        if (videoMatch) {
          return videoMatch[1];
        }
      }
    }
  }

  return null;
}