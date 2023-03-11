import config from "../environment.js";
import { Router } from "express";
const router = Router();
import asyncHandler from "express-async-handler";
import { User } from "../dbManager.js";
import { sanitizeUsername } from "../passwordManager.js";

router.get("/udbetaling", (req, res) => {
	if (req.session.username) {
		res.render("udbetaling", {
			aktieTypes: config.aktieTypes,
		});
	} else {
		res.redirect("/login");
	}
});

router.post(
	"/getAktier",
	asyncHandler(async (req, res) => {
		if (!req.session.username) {
			res.sendStatus(403);
			return;
		}
		var username = sanitizeUsername(req.session.username);
		var password = req.body.password;
		if (!username || !password) {
			res.status(400).send({ success: false, message: "Missing fields" });
			return;
		}
		let result = await User.model.findOne({ username: username });
		if (!result) {
			res
				.status(400)
				.send({ success: false, message: "Wrong password or username" });
			return;
		}
		let passwordResult = await User.checkPassword(username, password);
		if (!passwordResult.success) {
			res
				.status(400)
				.send({ success: false, message: "Wrong password or username" });
			return;
		}

		let aktier = [];
		result.aktier.forEach((aktie) => {
			aktier.push({
				investedIn: typeToReadable(aktie.investedIn),
				id: aktie.investedIn,
				amount: aktie.amount,
			});
		});
		res.send({ success: true, aktier: aktier });
	})
);

router.post(
	"/udbetalAktie",
	asyncHandler(async (req, res) => {
		if (!req.session.username) {
			res.sendStatus(403);
			return;
		}
		var aktieId = req.body.aktieId;
		var amount = parseInt(req.body.amount);
		var username = sanitizeUsername(req.body.username);
		if (!username || !aktieId || !amount) {
			res.status(400).send({ success: false, message: "Missing fields" });
			return;
		}

		let result = await User.removeAktie(username, aktieId, amount);
		if (!result.success) {
			res.status(409).send({ success: false, message: result.message });
			return;
		}
		res.send({ success: true });
	})
);

export default router;

function typeToReadable(aktieId) {
	return config.aktieTypes.find((aktie) => aktie.id === aktieId).name;
}

console.log(typeToReadable("test1"));