const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API get method to get all players
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersListQuery = `SELECT * FROM cricket_team`;

  const playersList = await db.all(getPlayersListQuery);

  let teamPlayers = [];
  for (let player of playersList) {
    teamPlayers.push(convertDbObjectToResponseObject(player));
  }

  response.send(teamPlayers);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const player_id = playerId;
  const getPlayer = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayer);
  const responseOb = convertDbObjectToResponseObject(dbResponse);
  response.send(responseOb);
});

// API Delete PLayer
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const player_id = playerId;
  const getDeleteQuery = `DELETE FROM cricket_team WHERE player_id = ${player_id};`;

  await db.get(getDeleteQuery);

  response.send("Player Removed");
});

//API post method to add new player

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
    INSERT INTO 
        cricket_team 
    (player_name,jersey_number, role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

// // API update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const getUpdateQuery = `
  UPDATE 
    cricket_team
  SET 
    player_name = '${playerName}',
    jersey_number =${jerseyNumber},
    role ='${role}'
   WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(getUpdateQuery);
  const responseOb1 = convertDbObjectToResponseObject(dbResponse);

  response.send("Player Details Updated");
});

module.exports = app;
