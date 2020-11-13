import { RouteOptions } from '../register';

interface TextQuery {
  text?: string;
  backgroundColor?: string;
}

export const pageText: RouteOptions<{
  Querystring: TextQuery;
}> = {
  method: 'GET',
  url: '/page/text',
  async handler(request, reply) {
    const { text = 'CellWall', backgroundColor = '#429A46' } = request.query;
    reply.type('text/html').send(`
      <link rel="stylesheet" href="/assets/css/base.css" />
      <style>
        body {
          display: flex;
          background: ${backgroundColor};
        }
      </style>
      <h1 class="headline-1">${text}</h1>
    `);
  },
};
