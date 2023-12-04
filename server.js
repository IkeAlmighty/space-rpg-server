require("dotenv").config();

const net = require("net");
const EventEmitter = require("events");
const actionHandlers = require("./actionHandlers");
const {MongoClient} = require("mongodb");

// Connection URI for MongoDB
const mongoURI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!mongoURI || !dbName) {
  console.log("mongoURI or dbName not defined");
  process.exit(1);
}

const eventEmitter = new EventEmitter();

const handlers = {
  add: actionHandlers.addAction,
  multiply: actionHandlers.multiplyAction,
  // Add more action handlers as needed
};

const serverId = process.env.SERVER_ID || generateUniqueId();

async function setupServer() {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    addServerToDatabase(db, serverId);

    const server = net.createServer(async (socket) => {
      console.log("Client connected");

      socket.on("data", async (data) => {
        try {
          const requestData = JSON.parse(data.toString());

          if (
            !requestData.hasOwnProperty("action") ||
            !requestData.hasOwnProperty("clientId")
          ) {
            throw new Error(
              'Request must have both "action" and "clientId" properties.'
            );
          }

          const {clientId, action, args} = requestData;

          const isCorrectServer = await checkServerCorrectness(
            db,
            clientId,
            serverId
          );

          if (!isCorrectServer) {
            socket.write(JSON.stringify({wrongServer: true}));
            socket.end();
            return;
          }

          if (!handlers.hasOwnProperty(action)) {
            throw new Error(`Invalid action type: ${action}`);
          }

          const result = await new Promise((resolve) => {
            eventEmitter.emit(action, clientId, action, args, resolve);
          });

          socket.write(JSON.stringify({result}));
        } catch (error) {
          console.error("Error processing request:", error.message);
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");
      });
    });

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || "127.0.0.1";

    server.listen(PORT, HOST, () => {
      console.log(
        `Server listening on ${HOST}:${PORT} with server ID: ${serverId}`
      );
    });

    Object.keys(handlers).forEach((action) => {
      eventEmitter.on(action, (...args) => handlers[action](...args));
    });

    process.on("SIGINT", async () => {
      console.log("Server shutting down");
      await removeServerFromDatabase(db, serverId);
      client.close();
      process.exit(0);
    });
  } catch (err) {
    console.error("Error during server setup:", err);
    process.exit(1);
  }
}

function generateUniqueId() {
  return `server-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function addServerToDatabase(db, serverId) {
  const collection = db.collection("runningServers");
  collection.insertOne({_id: serverId, connectedClients: []}, (err) => {
    if (err) {
      console.error("Error adding server to the database:", err);
      process.exit(1);
    } else {
      console.log("Server added to the database");
    }
  });
}

async function removeServerFromDatabase(db, serverId) {
  const collection = db.collection("runningServers");
  await collection.deleteOne({_id: serverId});
  console.log("Server removed from the database");
}

async function checkServerCorrectness(db, clientId, serverId) {
  const collection = db.collection("runningServers");
  const result = await collection.findOne({
    _id: serverId,
    connectedClients: {$in: [clientId]},
  });
  return result !== null;
}

setupServer();
