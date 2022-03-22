function submitName() {
	let name = document.getElementById('name').value;
	let klasse = document.getElementById('klasse').value;
	//Ajax call to server
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				//Person findes
				document.getElementById('newAktie').hidden = false;
				document.getElementById('newPerson').hidden = true;
			} else {
				//Person findes ikke
				document.getElementById('newAktie').hidden = true;
				document.getElementById("newPerson").hidden = false;

			}
			document.getElementById('videre1').hidden = true;

			console.log(this.responseText, this.status);
		}
	}
	xhttp.open("GET", `/personExists?name=${name}&klasse=${klasse}`, true);
	xhttp.send();
}

function createPerson() {
	let name = document.getElementById('name').value;
	let klasse = document.getElementById('klasse').value;
	let password = document.getElementById('password').value;
	let data = {
		name: name,
		klasse: klasse,
		password: password
	}
	//Ajax call to server
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			
			document.getElementById('newAktie').hidden = false;
			document.getElementById('newPerson').hidden = true;
		}
	}
	xhttp.open("POST", `/createPerson`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));


}

function invest() {
	let name = document.getElementById('name').value;
	let klasse = document.getElementById('klasse').value;
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				document.getElementById('newAktie').hidden = true;
				document.getElementById('newPerson').hidden = true;
				document.getElementById('videre1').hidden = false;
				alert("Investeret");
			} else if (this.status == 500) {
				alert("500 Internal Server Error");
			}
			console.log(this.responseText, this.status);
		}
	}
	xhttp.open("POST", `
		/invest
		?name=${name}
		&klasse=${klasse}
		&aktie=${document.getElementById('aktie').value}
		&antal=${document.getElementById('amount').value}
	`.replaceAll("\t", "").replaceAll("\n",""), true);
	xhttp.send()
}