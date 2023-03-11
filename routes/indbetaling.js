import config from "../environment.js";
import { Router } from "express";
import asyncHandler from "express-async-handler";

import dbManager from "../dbManager.js";
import passwordManager from "../passwordManager.js";
const { Staff, User } = dbManager.models;

const router = Router();

router.get(
	"/indbetaling",
	asyncHandler(async (req, res) => {
		if (req.session.username) {
			res.render("indbetaling", {
				aktieTypes: config.aktieTypes,
			});
		} else {
			res.redirect("/login");
		}
	})
);

router.get(
	"/userExists",
	asyncHandler(async (req, res) => {
		if (!req.session.username) {
			res.sendStatus(403);
			return;
		}
		if (!req.query.username) {
			res.status(400).send({ success: false, message: "Missing fields" });
			return;
		}
		let username = passwordManager.sanitizeUsername(req.query.username);
		if (await User.exists({ username: username })) {
			res.status(200).send(true);
		} else {
			res.status(200).send(false);
		}
	})
);

router.post(
	"/createUser",
	asyncHandler(async (req, res) => {
		if (!req.session.username) {
			res.sendStatus(403);
			return;
		}
		if (!req.body.username || !req.body.password) {
			res.status(400).send({ success: false, message: "Missing fields" });
			return;
		}

		let username = passwordManager.sanitizeUsername(req.body.username);
		let password = req.body.password;

		if (await User.exists({ username: username })) {
			res.status(400).send({ success: false, message: "User already exists" });
			return;
		}

		let result = await dbManager.methods.user.create(username, password);
		if (result.success) {
			res.status(200).send({ success: true });
		} else {
			res.status(400).send({ success: false, message: result.message });
		}
	})
);

router.post(
	"/createAktie",
	asyncHandler(async (req, res) => {
		if (!req.session.username) {
			res.sendStatus(403);
			return;
		}
		req.body.amount = parseInt(req.body.amount);
		if (!req.body.username || !req.body.aktieType || !req.body.amount) {
			res.status(400).send({ success: false, message: "Missing fields" });
			return;
		}

		let username = passwordManager.sanitizeUsername(req.body.username);
		let aktieType = req.body.aktieType;
		let amount = req.body.amount;

		if (!config.aktieTypes.some((type) => type.id === aktieType)) {
			res.status(400).send({ success: false, message: "Invalid aktie type" });
			return;
		}

		if (amount <= 0) {
			res.status(400).send({ success: false, message: "Invalid amount" });
			return;
		}

		let result = await dbManager.methods.user.addAktie(
			username,
			aktieType,
			amount
		);
		if (result.success) {
			res.status(200).send({ success: true });
		} else {
			res.status(400).send({ success: false, message: result.message });
		}
	})
);

export default router;
