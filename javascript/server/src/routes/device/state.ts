import { cellStateSchema, CellData, CellState } from '@cell-wall/cells';
import { ErrorReply, errorSchema, SerialParams } from '../helpers';
import { RouteOptions } from '../register';

export const statusState: RouteOptions<{
  Params: Required<SerialParams>;
  Reply: ErrorReply | { devices: Record<string, CellState> };
}> = {
  method: 'GET',
  url: '/v3/device/state/:serial',
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          devices: {
            type: 'object',
            additionalProperties: cellStateSchema,
          },
        },
      },
      404: errorSchema,
    },
  },
  async handler(request, reply) {
    const { serial } = request.params;

    const cell = this.cells.get(serial);
    if (cell) {
      reply.status(200).send({
        devices: {
          [serial]: cell.state,
        },
      });
    } else {
      reply.status(404).send({ error: `Could not find device ${serial}` });
    }
  },
  wsHandler(connection, _req, params) {
    const { serial } = params as Required<SerialParams>;
    connection.setEncoding('utf8');

    function onState(data: CellData) {
      if (data.serial === serial) {
        connection.socket.send(JSON.stringify(data.state));
      }
    }

    this.cells.on('state', onState);
    connection.socket.on('close', () => {
      this.cells.off('state', onState);
    });
  },
};

export const statusStateAll: RouteOptions<{
  Reply: ErrorReply | { devices: Record<string, CellState> };
}> = {
  method: 'GET',
  url: '/v3/device/state',
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          devices: {
            type: 'object',
            additionalProperties: cellStateSchema,
          },
        },
      },
    },
  },
  async handler(_request, reply) {
    let cells = new Map(
      Array.from(this.cells.values()).map(
        (cell) => [cell.serial, cell.state] as const,
      ),
    );

    reply.status(200).send({
      devices: Object.fromEntries(cells),
    });
  },
};

export const actionState: RouteOptions<{
  Params: Required<SerialParams>;
  Body: CellState;
  Reply: { devices: string[] };
}> = {
  method: 'POST',
  url: '/v3/device/state/:serial',
  schema: {
    body: cellStateSchema,
    response: {
      200: {
        type: 'object',
        properties: {
          devices: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  async handler(request, reply) {
    const { serial } = request.params;
    const state = request.body;

    this.cells.setState(serial, state);
    reply.status(200).send({
      devices: [serial],
    });
  },
};

export const actionStateAll: RouteOptions<{
  Body: Record<string, CellState>;
  Reply: ErrorReply | { devices: string[] };
}> = {
  method: 'POST',
  url: '/v3/device/state',
  schema: {
    body: {
      type: 'object',
      properties: {
        devices: {
          type: 'object',
          additionalProperties: cellStateSchema,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          devices: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  async handler(request, reply) {
    let deviceStates = request.body;

    const devices: string[] = [];
    for (const [serial, state] of Object.entries(deviceStates)) {
      this.cells.setState(serial, state);
      devices.push(serial);
    }

    reply.status(200).send({ devices });
  },
};