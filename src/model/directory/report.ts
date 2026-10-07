import * as path from 'path'
import xlsx from 'node-xlsx'
import { Promise as BPromise } from 'bluebird';

import { sync as read } from "@plastichub/fs/read"
import { sync as write } from "@plastichub/fs/write"

import { logger } from '..'
import { IOptions } from '../types'
import { IUser, I_OSR_USER, I_USER_SHORT } from './types'

import { generate } from 'csv-generate/sync'

const extension = (file: string) => path.parse(file).ext;

const writerTXT = (_products: any[], opts: IOptions) => {
    if (opts.dst) {
        let _path = path.resolve(opts.dst);
        _products = _products.map((p) => {
            return `${p.product_id} \t | ${p.status} | ${p.product}`;
        }).sort((a: any, b: any) => parseInt(a.product_id) < parseInt(b.product_id) ? 1 : -1);

        write(_path, _products.join('\n'));
        opts.debug && logger.debug(`Writing products to ${_path} `, _products);
    }
}

const writerXLS = (_users: any[], opts: IOptions) => {
    if (opts.dst) {
        let _path = path.resolve(opts.dst);
        _users = _users.map((u) => {
            return [u.email, u.name, u.bazar, u.web, u.social, u.censored, u.lastActive];
        })

        let columns = ['EMail', 'Name', 'Bazar', 'Web', 'Social', 'Censored', 'Last TS', 'IG'];

        let data =
            [
                columns,
                ..._users
            ];

        const sheetOptions = { '!cols': [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, , { wch: 30 }, { wch: 40 }] };
        const buffer = xlsx.build([{ name: 'raw', data: data, options: sheetOptions as any }]);
        write(_path, buffer);
        opts.debug && logger.debug(`Writing users to ${_path} `, _users);
    }
}

const writerCSV = (_users: any[], opts: IOptions) => {
    if (opts.dst) {
        let _path = path.resolve(opts.dst);
        _users = _users.map((u) => {
            return [u.email, u.name, u.bazar, u.web, u.social, u.censored, u.lastActive];
        })

        let columns = ['EMail', 'Name', 'Bazar', 'Web', 'Social', 'Censored', 'Last TS', 'IG'];
        let data =
            [
                columns,
                ..._users
            ];

        const records = generate({
            seed: 1,
            objectMode: true,
            columns: 2,
            length: 2
        });

        /*
        records = [
            ['OMH', 'ONKCHhJmjadoA'],
            ['D', 'GeACHiN']
        ];
        */

        write(_path, '');
        opts.debug && logger.debug(`Writing users to ${_path} `, _users);
    }
}

const writerJSON = (data: any, opts: IOptions) => {
    if (opts.dst) {
        let _path = path.resolve(opts.dst);

        let censored = data.filter((u) => u.moderation !== 'accepted').sort((a: any, b: any) => {
            const t1 = new Date((a as any)._modified).getTime();
            const t2 = new Date((b as any)._modified).getTime();
            return t2 - t1;
        });

        data = {
            totals: {
                censored: data.filter((u) => u.moderation !== 'accepted').length,
            },
            censored: censored
        }

        write(_path, data);
        opts.debug && logger.debug(`Writing report to ${_path} `);
    }
}

const WRITERS =
{
    '.xls': writerXLS,
    '.txt': writerTXT,
    '.json': writerJSON,
    '.csv': writerCSV
}

const filter_valid = (users: any[]) => {
    return users.filter((user) => {
        if (!user.data) {
            return false;
        }
        if (!user.geo) {
            return false;
        }
        if (!user.data.urls) {
            return false;
        }
        if (user.data && user.data.jsError) {
            return false;
        }
        return true;
    })
}

const filter_email_only = (users: any[]) => {
    return users.filter((user) => {
        if (!user.data) {
            return false;
        }
        if (!user.geo) {
            return false;
        }
        if (!user.data.urls) {
            return false;
        }
        if (user.data && user.data.jsError) {
            return false;
        }

        if (user.data.urls.find((l) => l.name == 'Email') == undefined) {
            return false;
        }

        return true;
    })
}

export const users = (src: string): I_OSR_USER[] => {
    let raw = read(src, 'json') as any;
    // raw = raw.v3_mappins.filter((f) => f.data != null);   
    return raw.v3_mappins;
}

const url = (user, field) => {
    const url = (user.data.urls.find((u) => u.name === field) as any);
    return url ? url.url : '';
}

const ig_url = (user) => {
    const url = (user.data.urls.find((u) => u.name === 'Social media' && u.url.indexOf('instagram.com') !== -1) as any);
    return url ? url.url : '';
}

export const toShort = (user: I_OSR_USER) => {
    return {
        name: user.data.title,
        email: url(user, 'Email').replace('mailto:', ''),
        bazar: url(user, 'Bazar'),
        web: url(user, 'Website'),
        social: url(user, 'Social media'),
        censored: user.moderation,
        lastActive: user._modified,
        ig: ig_url(user)
    }
}

export const writeReport = (users: any, opts: IOptions) => 
    WRITERS[extension(opts.dst)](users, opts);

export const createReport = (opts: any) => {
    let pins = users(opts.src);
    /*
    let pins = filter_valid(users(opts.src));
    pins = filter_email_only(pins);
    pins = pins.map(toShort);
    */
    logger.debug('users', pins.length, pins);

    writeReport(pins, opts);
}