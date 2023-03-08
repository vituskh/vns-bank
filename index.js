"use strict";
//import "./cli.js";

import express, { static as serveStatic, json, urlencoded } from "express";
const app = express();
import config from "./environment.js";
import session from "express-session";
import connectMongo from "connect-mongo";

import staffUIRouter from "./routes/staffUI.js";
import adminRouter from "./routes/admin.js";

app.set("view engine", "ejs");
app.use(serveStatic("public"));
app.use(json());
app.use(
	urlencoded({
		extended: true,
	})
);
app.use(
	session({
		secret: config.secret,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
		saveUninitialized: false,
		store: connectMongo.create({
			mongoUrl: config.dbURI,
		}),
	})
);

app.use(adminRouter);

app.use(staffUIRouter);

app.listen(config.port, () => console.log(`Listening on port ${config.port}!`));
