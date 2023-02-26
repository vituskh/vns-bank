"use strict";
import { Models } from "./fileManager.js";
import passwordManager from "./passwordManager.js";
//import "./cli.js";

import express, { static as serveStatic, json, urlencoded } from "express";
const app = express();
const port = 3000;
import { config } from "dotenv";
config();
import session from "express-session";
import connectMongo from "connect-mongo";

app.set("view engine", "ejs");
app.use(serveStatic("public"));
app.use(json());
app.use(
	urlencoded({
		extended: true,
	})
);
console.log(process.env.SECRET);
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
		saveUninitialized: false,
		store: connectMongo.create({
			mongoUrl: process.env.dbURI || "mongodb://127.0.0.1:27017/vns-bank",
		}),
	})
);

app.get("/", (req, res) => {
	if (req.session.username) {
		res.render("index", {
			username: req.session.username,
			admin: req.session.admin,
		});
	} else {
		res.redirect("/login");
	}
});

app.post("/login", async (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (!username || !password) {
		res.status(400).send({ success: false, message: "Missing fields" });
		return;
	}

	let result = await passwordManager.checkPasswordStaff(username, password);
	if (result.success) {
		req.session.username = username;
		req.session.admin = result.admin;
		res.status(200).send({ success: true });
	} else {
		res.status(403).send({ success: false, message: result.message });
	}
});

app.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

app.get("/login", (req, res) => {
	if (req.session.username) {
		res.redirect("/");
	} else {
		res.render("login");
	}
});

app.listen(process.env.PORT || port, () =>
	console.log(`Listening on port ${port}!`)
);
