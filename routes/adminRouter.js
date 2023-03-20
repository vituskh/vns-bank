import { Router } from "express";
import asyncHandler from "express-async-handler";

import dbManager, { models } from "../src/dbManager.js";
import passwordManager from "../src/passwordManager.js";
import logger from "../src/logging.js";

const router = Router();

router.get("/", asyncHandler(getAdmin));
router.post("/api/staff", asyncHandler(addStaff));
router.delete("/api/staff", asyncHandler(deleteStaff));

export async function getAdmin(req, res) {
	logger.debug(
		`${req.session.username} (admin: ${req.session.admin}) GET /admin`
	);
	if (req.session.username && req.session.admin) {
		let users = await models.User.find({});
		let staff = await models.Staff.find({});
		res.render("admin", {
			users: users,
			staff: staff,
		});
	} else {
		res.redirect("/");
	}
}

export async function addStaff(req, res) {
	logger.debug(
		`${req.session.username} (admin: ${req.session.admin}) addStaff ${req.body.username}`
	);
	if (req.session.username && req.session.admin) {
		let username = passwordManager.sanitizeUsername(req.body.username || "");
		if (!username) {
			res.status(400).send({ success: false, message: "Missing field" });
			return;
		}
		let result = await dbManager.methods.staff.create(username);
		if (result.success) {
			logger.activity(`Staff ${req.session.username} added staff ${username}`);
			res.status(200).send({ success: true });
			return;
		}
		logger.activity(
			`Staff ${req.session.username} failed to add ${username} due to ${result.message}`
		);
		res.status(400).send({ success: false, message: result.message });
	} else {
		res.sendStatus(403);
	}
}

export async function deleteStaff(req, res) {
	logger.debug(
		`${req.session.username} (admin: ${req.session.admin}) deleteStaff ${req.body.username}`
	);
	if (req.session.username && req.session.admin) {
		let result = await dbManager.methods.staff.delete(req.body.username);

		if (result.success) {
			logger.activity(
				`Staff ${req.session.username} deleted staff ${req.body.username}`
			);
			res.status(200).send({ success: true });
			return;
		}
		logger.error(
			`Staff ${req.session.username} failed to delete staff ${req.body.username} due to ${result.message}`
		);
		res.status(400).send({ success: false, message: result.message });
	}
	res.sendStatus(403);
}

export default router;
