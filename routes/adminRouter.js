import { Router } from "express";
import asyncHandler from "express-async-handler";

import dbManager, { models } from "../src/dbManager.js";
import passwordManager from "../src/passwordManager.js";
import logger from "../src/logging.js";

const router = Router();

router.get("/", asyncHandler(getAdmin));
router.post("/api/staff", asyncHandler(addStaff));
router.delete("/api/staff", asyncHandler(deleteStaff));
router.get("/api/user", asyncHandler(getUser));
router.post("/api/user/updatePassword", asyncHandler(updatePassword));

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
function escapeRegex(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export async function getUser(req, res) {
	logger.debug(
		`${req.session.username} (admin: ${req.session.admin}) GET /admin/user`
	);
	if (req.session.username && req.session.admin) {
		let username = passwordManager.sanitizeUsername(req.query.username || "");
		let user;
		if (req.query.wildcard == "on") {
			user = await models.User.find({
				username: { $regex: ".*" + escapeRegex(req.query.username) + ".*" },
			}).lean();
		} else {
			user = await models.User.findOne({ username: username }).lean();
		}

		if (!user) {
			res.status(400).send({ success: false, message: "User not found" });
			return;
		}
		res.status(200).send({ success: true, user: user });
	} else {
		res.sendStatus(403);
	}
}

export async function updatePassword(req, res) {
	logger.debug(
		`${req.session.username} (admin: ${req.session.admin}) updatePassword ${req.body.username}`
	);

	if (req.session.username && req.session.admin) {
		let username = passwordManager.sanitizeUsername(req.body.username || "");
		let password = req.body.password || "";
		let result = await dbManager.methods.user.updatePassword(
			username,
			password
		);

		if (result.success) {
			logger.activity(
				`Staff ${req.session.username} updated password for ${username}`
			);
			res.status(200).send({ success: true });
			return;
		}
		logger.error(
			`Staff ${req.session.username} failed to update password for ${username} due to ${result.message}`
		);
		res.status(400).send({ success: false, message: result.message });
	} else {
		res.sendStatus(403);
	}
}

export default router;
