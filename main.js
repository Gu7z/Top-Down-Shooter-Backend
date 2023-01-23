const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 3000;

const historyFile = path.join(__dirname, "/history.json");

const getHistory = () => {
  let rawdata = fs.readFileSync(historyFile);
  let history = JSON.parse(rawdata);

  return history;
};

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  const history = getHistory();

  const rank = Object.entries(history)
    .sort(([nameA, pointsA], [nameB, pointsB]) => pointsB - pointsA)
    .splice(0, 5);

  res.send(rank);
});

app.post("/", (req, res) => {
  const history = getHistory();
  const newHistory = { ...history, [req.body.name]: req.body.points };

  fs.writeFileSync(historyFile, JSON.stringify(newHistory));
  res.send({ ok: true });
});

app.listen(PORT, () => {
  console.log("Server iniciado");
});
