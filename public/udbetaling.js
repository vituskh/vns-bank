function getAktier() {
	let name = document.getElementById('name').value;
	let klasse = document.getElementById('klasse').value;
	let password = document.getElementById('password').value;
	document.getElementById('password').type = "password";
	document.getElementById('luk').hidden = false;
	let data = {
		name: name,
		klasse: klasse,
		password: password
	}
	//Ajax call to server
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				let aktier = JSON.parse(this.responseText);
				let table = document.getElementById('aktier');
				table.innerHTML = "";
				let tableBody = new DocumentFragment()
				for (let i = 0; i < aktier.length; i++) {
					let aktie = aktier[i];
					tableBody.appendChild(createRow(aktie));
					
					console.log(tableBody.innerHTML);
				}
				table.appendChild(tableBody);
			} else {
				alert('Forkert kodeord, navn eller klasse');
			}
			console.log(this.responseText, this.status);
		}
	}
	xhttp.open("GET", `/getAktier?name=${name.toLowerCase()}&klasse=${klasse.toLowerCase()}`, true);
	xhttp.setRequestHeader('Authorization', `Basic ${btoa(`${name.toLowerCase()}:${password}`)}`);
	xhttp.send();
}
function createRow(aktie) {
	let row = document.createElement('tr');
	let investedIn = document.createElement('td');
	investedIn.innerHTML = aktie.investedIn;
	let amount = document.createElement('td');
	amount.innerHTML = aktie.amount;
	let id = document.createElement('td');
	id.innerHTML = aktie.id;
	let udbetal = document.createElement('td');
	udbetal.innerHTML = `<button onclick="udbetal('${aktie.id}')">Udbetal</button>`;
	row.appendChild(id);
	row.appendChild(investedIn);
	row.appendChild(amount);
	row.appendChild(udbetal);
	
	return row;
}
function udbetal(id) {
	let data = {
		id: id,
		name: document.getElementById('name').value.toLowerCase(),
		klasse: document.getElementById('klasse').value.toLowerCase(),
		password: document.getElementById('password').value
	}
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				alert("Udbetalt");
				getAktier();
			} else if (this.status == 500) {
				alert("500 Internal Server Error");
			}
			console.log(this.responseText, this.status);
		}
	}
	xhttp.open("POST", `/udbetal`, true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send(JSON.stringify(data));
}
function luk() {
	document.getElementById('luk').hidden = true;
	document.getElementById('password').type = "text";
	document.getElementById('password').value = "";
	document.getElementById('name').value = "";
	document.getElementById('klasse').value = "";

}