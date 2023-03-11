const loginForm = document.getElementById("loginForm");
const tableBody = document.getElementById("aktierBody");

function getAktier(event, form) {
	event.preventDefault();
	var username = form.username.value;
	var password = form.password.value;
	if (!username || !password) {
		alert("Du skal udfylde begge felter");
		return;
	}
	fetch("/getAktier", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username,
			password: password,
		}),
	})
		.then((res) => res.json())
		.then((res) => {
			console.log(res.aktier);
			tableBody.innerHTML = "";
			res.aktier.forEach((aktie) => {
				let row = document.createElement("tr");
				let type = document.createElement("td");
				type.innerHTML = aktie.investedIn;
				let amount = document.createElement("td");
				amount.innerHTML = aktie.amount;
				let buttonTd = document.createElement("td");
				let button = document.createElement("button");
				button.innerText = "Udbetal";
				button.addEventListener(
					"click",
					udbetaling.bind(null, aktie.id, aktie.amount, button)
				);

				buttonTd.appendChild(button);
				row.appendChild(type);
				row.appendChild(amount);
				row.appendChild(buttonTd);
				tableBody.appendChild(row);

				lockForm();
			});
		})
		.catch((err) => {
			console.error({
				error: err,
				password,
				username,
			});
			alert("Der skete en katastrofisk fejl. Kontakt Vitus");
		});
}

function udbetaling(id, amount, button) {
	let username = loginForm.username.value;
	fetch("/udbetalAktie", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			aktieId: id,
			amount: amount,
			username: username,
		}),
	})
		.then((res) => {
			if (res.ok) {
				return res;
			} else {
				throw new Error(res);
			}
		})

		.then((res) => {
			button.parentElement.parentElement.remove();
			alert("Aktien er udbetalt");
		})
		.catch((err) => {
			console.error({
				error: err,
				aktieId: id,
				amount: amount,
				username,
			});
			alert("Der skete en katastrofisk fejl. Kontakt Vitus");
		});
}

function lockForm() {
	loginForm.username.disabled = true;
	loginForm.password.disabled = true;
	loginForm.submit.disabled = true;
}

function reset() {
	loginForm.username.disabled = false;
	loginForm.password.disabled = false;
	loginForm.submit.disabled = false;
	loginForm.username.value = "";
	loginForm.password.value = "";

	tableBody.innerHTML = "";
}
