import { Router } from "express";
import dbManager, { models } from "../dbManager.js";
import passwordManager from "../passwordManager.js";

const router = Router();

router.get("/admin", async (req, res) => {
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
});

router.post("/admin/staff", async (req, res) => {
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
});

router.delete("/admin/staff", async (req, res) => {
	if (req.session.username && req.session.admin) {
		let result = await dbManager.methods.staff.delete(req.body.username);

		if (result.success) {
			res.status(200).send({ success: true });
			return;
		}
		res.status(400).send({ success: false, message: result.message });
	}
	res.sendStatus(403);
});

export default router;
