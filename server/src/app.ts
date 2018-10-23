import { createServer } from "http";
import { join } from "path";
import { json } from "body-parser";
import express = require("express");
import socketIO = require("socket.io");

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as cellController from "./controllers/cell";
import * as wallController from "./controllers/wall";

// Create Express server
const app = express();

// Create SocketIO server
const server = createServer(app);
const io = socketIO(server);

// Express configuration
export const port = process.env.PORT || 3000;
export const env = app.get("env");
app.use(json());

app.use(express.static(join(__dirname, "../public"), { maxAge: 36000 }));
homeController.serveModules(app, ["interactjs/dist", "socket.io-client/dist"]);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/is-cellwall-server", homeController.isCellWall);
app.get("/wall", wallController.getWall);
app.get("/wall/actions", wallController.getActions);
app.get("/wall/action", wallController.postAction);
app.get("/cell/:id", cellController.getState.checks, cellController.getState);

export default server;
