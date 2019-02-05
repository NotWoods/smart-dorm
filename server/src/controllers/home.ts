import { Context } from 'koa';
import { Router, Spec } from 'koa-joi-router';
import { join, posix } from 'path';
import serveStatic = require('koa-static');

/**
 * GET /is-cellwall-server
 * Indicates this server is a CellWall server
 */
export const isCellWall: Spec = {
    method: 'GET',
    path: '/is-cellwall-server',
    async handler(ctx: Context) {
        ctx.status = 204;
    },
};

export function serveModules(router: Router, folders: string[]) {
    for (const folder of folders) {
        const path = join(__dirname, '../../node_modules', folder);
        router.use(
            posix.join('/node_modules', folder),
            serveStatic(path, { maxage: 36000 }),
        );
    }
}
