const express = require('express');
const app = express();
const config = require('./config.json');

const aktieManager = require('./aktieManager.js');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('indtast');
})

app.get('/personExists', (req,res) => {
	if (aktieManager.personExists(req.query.name, req.query.klasse)) {
		res.sendStatus(200);
	} else {
		res.sendStatus(404);
	}
})

app.post('/invest', (req, res) => {
	if (!config.aktier.includes(req.query.aktie)) {
		res.sendStatus(404);
	} else {
		aktieManager.indtast(req.query.name, req.query.klasse, req.query.aktie, req.query.antal, req.query.pris)
			.then(() => {
				res.sendStatus(200);
			})
			.catch((err) => {
				res.send(err);
			})
	}
})

app.post('/createPerson', (req,res) => {
	if (aktieManager.personExists(req.query.name, req.query.klasse)) {
		res.sendStatus(400);
		return
	}
	if (!req.query.name || !req.query.klasse || !req.query.password) {
		res.sendStatus(400);
		return
	}
	aktieManager.createPerson(req.query.name, req.query.klasse, req.query.password)
		.then((res) => {
			res.send(res);
		})
		.catch((err) => {
			res.send(err);
		})
})

app.post('/getAktier', (req,res) => {
	if (!aktieManager.checkPass(req.query.name, req.query.klasse, req.query.password)) {
		res.sendStatus(403);
		return
	}
	aktieManager.getAktier(req.query.name, req.query.klasse)
		.then((res) => {
			res.send(res);
		})
		.catch((err) => {
			res.send(err);
		})
})

app.post('/udbetal', (req,res) => {
	if (!aktieManager.checkPass(req.query.name, req.query.klasse, req.query.password)) {
		res.sendStatus(403);
		return
	}
	aktieManager.udbetal(req.query.name, req.query.klasse, req.query.aktie, req.query.antal, req.query.pris)
		.then((response) => {
			res.status(200).send(response);
		})
		.catch((err) => {
			res.send(err);
		})
})

app.listen(8080, () => {
	console.log('App listening on port 8080!');
})

/*Todo
	- client side
	- 

*/