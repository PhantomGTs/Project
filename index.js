const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const low = require('lowdb');
const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const gamesRouter = require("./routes/games")

const PORT = process.env.PORT || 4000;

const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ games: [] }).write();

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Camp Games API",
			version: "1.0.0",
			description: "A simple collection of games for the camp",
		},
		servers: [
			{
				url: "http://localhost:4000",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options)

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.db = db;

const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); 
app.use(cors());
app.use(morgan("dev"));

app.use("/games", gamesRouter);

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));