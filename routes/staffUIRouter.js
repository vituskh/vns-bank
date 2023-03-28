import { Router } from "express";
const router = Router();
import asyncHandler from "express-async-handler";

import passwordManager from "../src/passwordManager.js";
import staff from "../models/staff.js";
import logger from "../src/logging.js";

router.get("/", (req, res) => {
	if (req.session.username) {
		res.render("index", {
			username: req.session.username,
			admin: req.session.admin,
		});
	} else {
		res.redirect("/login");
	}
});

router.post("/login", asyncHandler(login));
export async function login(req, res) {
	logger.debug(`login attempt ${req.body.username} `);
	let username = passwordManager.sanitizeUsername(req.body.username || "");
	let password = req.body.password;
	if (!username || !password) {
		res.status(400).send({ success: false, message: "Missing fields" });
		return;
	}

	let result = await staff.checkPassword(username, password);
	if (result.success) {
		req.session.username = username;
		req.session.admin = result.admin;
		logger.debug(`${req.session.username} login success`);
		res.status(200).send({ success: true });
	} else {
		res.status(403).send({ success: false, message: result.message });
	}
}

router.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

router.get("/login", (req, res) => {
	if (req.session.username) {
		res.redirect("/");
	} else {
		res.render("login");
	}
});

export default router;
