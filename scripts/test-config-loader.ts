
import { loadConfig } from '../src/app/config-loader.js';

try {
    const config = loadConfig();
    console.log('LOGGING_NAMESPACE:', config.core.logging_namespace);
    console.log('SHOW_GALLERY:', config.features.show_gallery);
} catch (e) {
    console.error(e);
}
