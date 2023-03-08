import { Router } from "express";
const router = Router();
import passwordManager from "../passwordManager.js";

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

router.post("/login", async (req, res) => {
	let username = passwordManager.sanitizeUsername(req.body.username || "");
	let password = req.body.password;
	console.log(username, password, req.body);
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
