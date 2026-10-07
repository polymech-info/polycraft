import handler from 'serve-handler';
import http from 'http';
import { PRODUCT_ROOT, FILE_SERVER_DEV } from '../src/app/config';

// Parse host and port from FILE_SERVER_DEV
const [host, portStr] = FILE_SERVER_DEV.split(':');
const port = parseInt(portStr, 10);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const server = http.createServer((request: any, response: any) => {
    return handler(request, response, {
        public: PRODUCT_ROOT(),
        headers: [
            {
                source: '**/*',
                headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
            }
        ]
    });
});

server.listen(port, host, () => {
    console.log(`Running at http://${host}:${port}`);
    console.log(`Serving files from: ${PRODUCT_ROOT()}`);
});
