import { Server } from "http";
import { join } from "path";
import { Wall } from "./wall-class";
import express = require("express");
import SocketIO = require("socket.io");
import { CellMode, CellState } from "./cell-struct";
import { serveModules } from "./static";

const app = express();
const http = new Server(app);
const io = SocketIO(http);

const cell = io.of("/cell");
const editor = io.of("/edit");

interface CellSocket extends SocketIO.Socket {
  emit(event: "cell-update", mode: CellMode, data: CellState["data"]): boolean;

  on(
    event: "touch",
    listener: (x: number, y: number, action: string) => void
  ): this;
  on(event: "disconnect", listener: () => void): this;
}

interface EditorSocket extends SocketIO.Socket {
  emit(
    event: "resize-wall",
    dimension: "width" | "height",
    value: number
  ): boolean;
  emit(event: "show-preview", value: boolean): boolean;
  emit(event: "add-cell", cell: { id: string; x: number; y: number }): boolean;
  emit(event: "move-cell", cell: { id: string; x: number; y: number }): boolean;

  on(
    event: "resize-wall",
    listener: (dimension: "width" | "height", value: number) => void
  ): this;
  on(event: "show-preview", listener: (value: boolean) => void): this;
  on(
    event: "move-cell",
    listener: (cell: { id: string; x: number; y: number }) => void
  ): this;

  broadcast: EditorSocket;
}

const wall = new Wall().on("cell-update", (id, state) =>
  cell.to(id).emit("cell-update", state.mode, state.data)
);
wall.createCell("red", 32, 40);
wall.createCell("blue", 50, 40);

app.use("/", express.static(join(__dirname, "../public")));
serveModules(app, ["interactjs/dist", "socket.io-client/dist"]);

app.get("/is-cellwall-server", (req, res) => {
  res.sendStatus(204);
});

app.get("/", (req, res) => {
  console.log("root");
  res.sendStatus(200);
});

app.get("/data/:mode/:id", (req, res) => {
  const { id, mode } = req.params;
  const cell = wall.cells.get(id);
  if (cell == null) {
    // ID was incorrect or the cell disconnected
    res.sendStatus(401);
  } else if (mode !== cell.state.mode) {
    // Mode did not match the current mode
    res.sendStatus(400);
  } else {
    res.json(cell.state.data);
  }
});

editor.on("connection", (socket: EditorSocket) => {
  console.log("editor connected");

  // Emit initial values
  socket.emit("resize-wall", "width", wall.width);
  socket.emit("resize-wall", "height", wall.height);
  socket.emit("show-preview", wall.showingPreview);
  for (const cell of wall) {
    socket.emit("add-cell", cell);
  }

  // Add listeners
  socket.on("move-cell", data => {
    wall.moveCell(data.id, data.x, data.y);
    socket.broadcast.emit("move-cell", data);
  });
  socket.on("resize-wall", (dimension, value) => {
    wall[dimension] = value;
    socket.broadcast.emit("resize-wall", dimension, value);
  });
  socket.on("show-preview", show => {
    wall.showingPreview = show;
    socket.broadcast.emit("show-preview", show);
  });
});

cell.on("connection", (socket: CellSocket) => {
  console.log("cell connected");
  const { query } = socket.handshake;
  const width = parseInt(query.width, 10) || 0;
  const height = parseInt(query.height, 10) || 0;
  const cell = wall.createCell(socket.id, width, height);
  editor.emit("add-cell", cell);

  socket.emit("cell-update", cell.state.mode, cell.state.data);

  socket.on("disconnect", () => {
    wall.removeCell(socket.id);
    editor.emit("delete-cell", socket.id);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});