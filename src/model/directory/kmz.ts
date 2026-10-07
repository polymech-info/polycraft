import * as path from 'path';

import { sync as read } from '@plastichub/fs/read';
import { sync as write } from '@plastichub/fs/write';
import { substitute } from '@plastichub/core'
import { logger } from '@base/index.js'

const slugify = require('slugify');

import {
    sanitize,
    imageName
} from './download'

export const createMap = async (src, data, users, root) => {

    const templates_path = path.resolve(`${root}/map/templates`)

    const rootTemplate = read(path.resolve(`${templates_path}/doc.kml`), 'string')

    const styles = {
        'machine-builder': 'icon-ci-2',
        'workspace': 'icon-ci-5',
        'community-builder': 'icon-ci-1',
        'collection-point': 'icon-ci-3-nodesc',
        'member': 'icon-ci-4-nodesc'
    }
    // https://www.google.com/maps/d/u/0/edit?hl=en&mid=1jg5n4Gk7tTEK4XGmd_et5lmD_DTW-H_6&ll=42.15527174539886%2C-123.42603883881509&z=9

    const createMarkers = (type) => {
        const pins = users.filter((u) => u.type === type && u.location);
        const placeTemplate = read(path.resolve(`${templates_path}/place.xml`));
        return pins.map((u) => {
            const image = `https://files.polymech.info/users/${u._id}/${encodeURIComponent(sanitize(imageName(u.detail.heroImageUrl)))}`;
            const title = u.data && u.data.title ? u.data.title : u._id;
            let links = '';

            if (u.data.urls) {
                links = u.data.urls.filter((r) => r.name !== 'Bazar').map((l) => {

                    let label = '' + l.name;
                    if (label === 'Social media') {

                        if (l.url.indexOf('facebook') !== -1) {
                            label = 'Facebook';
                        }
                        if (l.url.indexOf('instagram') !== -1) {
                            label = 'Instagram';
                        }
                    }

                    label += " - " + l.url;
                    label = label.replace("https://", "");
                    label = label.replace("http://", "");
                    label = label.replace("mailto:", "");

                    return `<a href="${l.url}">${label}</a>`
                }).join("<br/><br/>\n");
            } else {
                logger.error(`User ${u._id} has no links`);
            }

            // const name = `<a href=\"https://files.polymech.info/users/${u._id}.html\">${sanitize(slugify(title))} - ${u.moderation !== 'accepted' ? '' : ''}</a>`;

            const name = `${sanitize(slugify(title))} - ${u.moderation !== 'accepted' ? '' : ''}`;

            return substitute(placeTemplate, {
                name: name,
                description: `<img src=${image} height="200" width="auto"/><br/>
                ${sanitize(u.detail.shortDescription || '')}<br/>
                <a href="https://files.polymech.info/users/${u._id}.html">https://files.polymech.info/users/${u._id}.html</a><br/>${links}`,
                coords: `${u.location.lng},${u.location.lat},0`,
                media: `<value>${image}</value>`,
                style: u.moderation == 'accepted' ? styles[type] : 'icon-ci-6'
            });
        })
    }
    const machines = createMarkers('machine-builder').join('\n');
    const combuilders = createMarkers('community-builder').join('\n');
    const members = createMarkers('member').join('\n');
    const collection = createMarkers('collection-point').join('\n');
    const workspace = createMarkers('workspace').join('\n');
    const kml = substitute(rootTemplate, {
        machine: machines,
        community: combuilders,
        member: members,
        collection: collection,
        workspace: workspace
    });

    const out = path.resolve(`${root}/map/kmz/doc.kml`)

    write(out, kml)

    logger.info(`Write KMZ data to ${root}/map/kmz/doc.kml`)
}

export const createMapDirectory = async (src, data, users, root) => {

    const templates_path = path.resolve(`${root}/templates/map`)

    const rootTemplate = read(path.resolve(`${templates_path}/doc.kml`), 'string')

    const styles = {
        'machine-builder': 'icon-ci-2',
        'workspace': 'icon-ci-5',
        'community-builder': 'icon-ci-1',
        'collection-point': 'icon-ci-3-nodesc',
        'member': 'icon-ci-4-nodesc'
    }
    // https://www.google.com/maps/d/u/0/edit?hl=en&mid=1jg5n4Gk7tTEK4XGmd_et5lmD_DTW-H_6&ll=42.15527174539886%2C-123.42603883881509&z=9

    const createMarkers = (type) => {
        const pins = users.filter((u) => u.type === type && u.location);
        const placeTemplate = read(path.resolve(`${templates_path}/place.xml`));
        return pins.map((u) => {
            const image = `https://files.polymech.info/users/${u._id}/${encodeURIComponent(sanitize(imageName(u.detail.heroImageUrl)))}`;
            const title = u.data && u.data.title ? u.data.title : u._id;
            let links = '';

            if (u.data.urls) {
                links = u.data.urls.filter((r) => r.name !== 'Bazar').map((l) => {

                    let label = '' + l.name;
                    if (label === 'Social media') {

                        if (l.url.indexOf('facebook') !== -1) {
                            label = 'Facebook';
                        }
                        if (l.url.indexOf('instagram') !== -1) {
                            label = 'Instagram';
                        }
                    }

                    label += " - " + l.url;
                    label = label.replace("https://", "");
                    label = label.replace("http://", "");
                    label = label.replace("mailto:", "");

                    return `<a href="${l.url}">${label}</a>`
                }).join("<br/><br/>\n");
            } else {
                logger.error(`User ${u._id} has no links`);
            }

            // const name = `<a href=\"https://files.polymech.info/users/${u._id}.html\">${sanitize(slugify(title))} - ${u.moderation !== 'accepted' ? '' : ''}</a>`;

            const name = `${sanitize(slugify(title))} - ${u.moderation !== 'accepted' ? '' : ''}`;

            return substitute(placeTemplate, {
                name: name,
                description: `<img src=${image} height="200" width="auto"/><br/>
                ${sanitize(u.detail.shortDescription || '')}<br/>
                <a href="https://files.polymech.info/users/${u._id}.html">https://files.polymech.info/users/${u._id}.html</a><br/>${links}`,
                coords: `${u.location.lng},${u.location.lat},0`,
                media: `<value>${image}</value>`,
                style: u.moderation == 'accepted' ? styles[type] : 'icon-ci-6'
            });
        })
    }
    const machines = createMarkers('machine-builder').join('\n');
    const combuilders = createMarkers('community-builder').join('\n');
    const members = createMarkers('member').join('\n');
    const collection = createMarkers('collection-point').join('\n');
    const workspace = createMarkers('workspace').join('\n');
    const kml = substitute(rootTemplate, {
        machine: machines,
        community: combuilders,
        member: members,
        collection: collection,
        workspace: workspace
    });

    const out = path.resolve(`${root}/map/kmz/doc.kml`)

    write(out, kml)

    logger.info(`Write KMZ data to ${root}/map/kmz/doc.kml`)
}