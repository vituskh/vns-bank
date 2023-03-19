import { Router } from "express";
import asyncHandler from "express-async-handler";

import dbManager, { models } from "../src/dbManager.js";
import passwordManager from "../src/passwordManager.js";

const router = Router();

router.get("/", asyncHandler(getAdmin));
router.post("/api/staff", asyncHandler(addStaff));
router.delete("/api/staff", asyncHandler(deleteStaff));

export async function getAdmin(req, res) {
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
	if (req.session.username && req.session.admin) {
		let username = passwordManager.sanitizeUsername(req.body.username || "");
		if (!username) {
			res.status(400).send({ success: false, message: "Missing field" });
			return;
		}
		let result = await dbManager.methods.staff.create(username);
		if (result.success) {
			res.status(200).send({ success: true });
			return;
		}
		res.status(400).send({ success: false, message: result.message });
	} else {
		res.sendStatus(403);
	}
}

export async function deleteStaff(req, res) {
	if (req.session.username && req.session.admin) {
		let result = await dbManager.methods.staff.delete(req.body.username);

		if (result.success) {
			res.status(200).send({ success: true });
			return;
		}
		res.status(400).send({ success: false, message: result.message });
	}
	res.sendStatus(403);
}

export default router;
