import { Express, Request, Response, static as serveStatic } from 'express';
import { join, posix } from 'path';

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
    res.sendStatus(200);
};

/**
 * GET /is-cellwall-server
 * Indicates this server is a CellWall server
 */
export const isCellWall = (req: Request, res: Response) => {
    res.sendStatus(204);
};

export function serveModules(app: Express, folders: string[]) {
    for (const folder of folders) {
        const path = join(__dirname, '../../node_modules', folder);
        app.use(posix.join('/node_modules', folder), serveStatic(path));
    }
}
