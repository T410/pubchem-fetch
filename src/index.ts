import fetch from "node-fetch";

const [startId, endId, compoundId] = process.argv.slice(2);
const API_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/";

async function fetchJson(compoundId: number) {
	const res = await fetch(API_URL + compoundId + "/JSON");
	const json = await res.json();
	console.log(json);
}

function init() {
	fetchJson(parseInt(compoundId));
}

init();
