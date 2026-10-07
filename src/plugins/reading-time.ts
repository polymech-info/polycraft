import { IPlugin } from "@polymech/astro-base/model/extension/types.js";
import getReadingTime from 'reading-time';

export const ReadingTimePlugin: IPlugin = {
    name: 'reading-time',
    hooks: {
        onData: (item) => {
            if (item.data.content) {
                const stats = getReadingTime(item.data.content);
                item.data['readingTime'] = stats;
            }
            return item;
        }
    }
};
