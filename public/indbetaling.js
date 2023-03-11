function resetMenu() {
	const makeAktie = document.getElementById("makeAktie");
	const makeUser = document.getElementById("makeUser");

	makeAktie.style.display = "none";
	makeUser.style.display = "flex";
	makeUser.username.disabled = false;
	makeUser.submitButton.disabled = false;
	makeUser.username.value = "";
	makeUser.password.value = "";
	makeUser.makeSure.value = "";
	document.getElementById("passwordDiv").hidden = true;
}
// check if user exists
// if it does, show the form to make an aktie
// if it doesn't, show the form to create the user
function makeUser(e, form) {
	e.preventDefault();
	const username = form.username.value;
	const passwordDiv = document.getElementById("passwordDiv");
	if (passwordDiv.hidden) {
		// check if user exists
		const url = new URL(`/indbetaling/api/user/`, window.location);
		url.searchParams.append("username", username);
		fetch(`${url}`)
			.then((res) => res.json())
			.then((data) => {
				if (data) {
					continueToMakeAktie();
				} else {
					document.getElementById("makeAktie").style.display = "none";
					passwordDiv.hidden = false;
				}
				form.username.disabled = true;
			});
	} else {
		// create user
		const password = form.password.value;
		const makeSure = form.makeSure.value;
		if (password != makeSure) {
			alert("Koder matcher ikke");
			return;
		}
		fetch("/indbetaling/api/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		})
			.then((res) => {
				if (res.ok) {
					continueToMakeAktie();
				} else {
					return res.json();
				}
			})
			.then((data) => {
				if (data) {
					alert(data.message);
				}
			})
			.catch((err) => {
				console.error({
					error: err,
					password,
					makeSure,
					username,
				});
				alert("Der skete en katastrofisk fejl. Kontakt Vitus");
			});
	}
}

function continueToMakeAktie() {
	document.getElementById("makeAktie").style.display = "flex";
	document.getElementById("passwordDiv").hidden = true;
	const makeUser = document.getElementById("makeUser");
	makeUser.username.disabled = true;
	makeUser.submitButton.disabled = true;
}

function makeAktie(e, form) {
	e.preventDefault();
	const aktieType = form.aktieType.value;
	const amount = form.amount.value;
	const username = document.getElementById("makeUser").username.value;

	fetch("/indbetaling/api/aktie", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			aktieType,
			amount,
			username,
		}),
	})
		.then((res) => {
			if (res.ok) {
				alert("Aktie oprettet");
				resetMenu();
			} else {
				return res.json();
			}
		})
		.then((data) => {
			if (data) {
				alert(data.message);
			}
		})
		.catch((err) => {
			console.error({
				error: err,
				aktieType,
				amount,
				username,
			});
			alert("Der skete en katastrofisk fejl. Kontakt Vitus");
		});
}
