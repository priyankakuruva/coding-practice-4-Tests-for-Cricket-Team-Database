const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
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
      console.log("Sever Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//
const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API 1
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  try {
    const dbResponse = await db.run(addPlayerQuery);
    const playerId = dbResponse.lastID;
    response.send("Player Added to Team");
  } catch (e) {
    console.log(e.message);
  }
});
//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertPlayerDbObjectToResponseObject(player));
});
//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log({ playerId });
  const playerDetails = request.body;
  //console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team SET
 player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}'
 WHERE player_id = ${playerId};`;
  try {
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});
//API 5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
