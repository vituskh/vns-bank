const express = require('express');
const app = express();
const config = require('./config.json');
const cookieParser = require('cookie-parser');
const misc = require('./misc.js');
const bcrypt = require('bcrypt');

var staff = require('./staff.json');

const aktieManager = require('./aktieManager.js');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser(config.secret))
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
let sessionKeys = new Map();

app.use((req, res) => {
	//lowercase everything except password

	//
	for (const param in req.query) {
		if (Object.hasOwnProperty.call(req.query, param)) {
			if (param != "password") {
				req.query[param] = req.query[param].toLowerCase();
			}
		}
	}
	for (const param in req.body) {
		if (Object.hasOwnProperty.call(req.body, param)) {
			if (param != "password") {
				req.body[param] = req.body[param].toLowerCase();
			}
		}
	}

	req.next()
})

app.get('/', (req, res) => {
	res.render('index')

})
app.get('/login', (req, res) => {
	if (isStaff(req.query.username, req.query.password)) {
		let sessionKey;
		do {
			sessionKey = misc.generateRandomString(32);
		} while (sessionKeys.has(sessionKey));
		res.cookie('sessionKey', sessionKey, {
			maxAge: 1000 * 60 * 120,
			signed: true,
			httpOnly: true
		});
		sessionKeys.set(sessionKey, { expires: Date.now() + 1000 * 60 * 120, username: req.query.username });

		res.redirect('/');
	} else {
		res.sendStatus(403);
	}
})

app.get('/personExists', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	if (aktieManager.personExists(req.query.name, req.query.klasse)) {
		res.sendStatus(200);
	} else {
		res.sendStatus(405);
	}
})

app.post('/invest', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	if (!config.aktier.includes(req.query.aktie)) {
		res.sendStatus(405);
	} else {
		console.log(req.query.name, req.query.klasse, req.query.aktie, req.query.antal);
		aktieManager.indtast(req.query.name, req.query.klasse, req.query.aktie, req.query.antal)
			.then(() => {
				res.sendStatus(200);
			})
			.catch((err) => {
				console.warn(err);
				res.status(500).send(err);
			})
	}
})

app.post('/createPerson', (req, res) => {
	const { name, klasse, password } = req.body;
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	if (!name || !klasse || !password) {
		console.log("Missing parameters");
		res.sendStatus(400);
		return
	}
	if (aktieManager.personExists(name, klasse)) {
		console.log("Person already exists");
		res.sendStatus(400);
		return
	}
	aktieManager.createPerson(name, klasse, password)
		.then((res) => {
			res.send(res);
		})
		.catch((err) => {
			res.send(err);
		})
})

app.get('/getAktier', (req, res) => {
	let auth = req.headers.authorization.split(" ")[1] || ":"
	auth = Buffer.from(auth, 'base64').toString('ascii').split(':')
	let password = auth[1] || "";
	console.log(password)
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	aktieManager.checkPass(req.query.name, req.query.klasse, password)
		.then((response) => {
			if (response) {

				aktieManager.getAktier(req.query.name, req.query.klasse)
					.then((response) => {
						res.send(response);
						return
					})
					.catch((err) => {
						console.warn(err);
						res.status(500).send(err);
						return
					})
			} else {
				res.sendStatus(403);
				return
			}
		})
		.catch((err) => {
			console.warn(err);
			res.status(500).send(err);
			return
		})
})


app.post('/udbetal', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	aktieManager.checkPass(req.body.name, req.body.klasse, req.body.password)
		.then((response) => {
			if (response) {

				aktieManager.udbetal(req.body.name, req.body.klasse, req.body.id)
					.then((response) => {
						res.status(200).send(response);
					})
					.catch((err) => {

						res.status(500).send(err);
					})
			} else {
				res.sendStatus(403);
				return
			}
		})
		.catch((err) => {
			console.warn(err);
			res.status(500).send(err);
			return
		})

})

function checkSession(key) {
	//dev
	return { staff: true, admin: true };
}
function isStaff(username, password) {
	return new Promise((resolve, reject) => {
		if (staff[username]) {
			bcrypt.compare(password, staff[username], (err, res) => {
				if (err) {
					reject(err);
				} else {
					if (res) {
						resolve(true);
					} else {
						resolve(false);
					}
				}
			})
		} else {
			resolve(false);
		}
	})
}


app.get('/indbetaling', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	res.render('indbetaling', {
		possibleAktier: config.aktier
	});
});
app.get('/udbetaling', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).staff) {
		res.sendStatus(403);
		return
	}
	res.render('udbetaling', {
	});
});

app.listen(config.port, () => {
	console.log(`App listening on port ${config.port}!`);
})

/*Todo
	- client side
	- 
	
*/



//Admin
app.get('/admin', (req, res) => {
	if (!checkSession(req.signedCookies.sessionKey).admin) {
		res.sendStatus(403);
		return
	}
	res.render('admin', {});
})