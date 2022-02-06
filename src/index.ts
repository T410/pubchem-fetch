import fetch from "node-fetch";
import fs from "fs";
import type { PubChemCompound } from "./types";
import getNecessaryData from "./parseData.js";

const _parseInt = (x: string) => parseInt(x);

const [startId, endId, compoundId] = process.argv.slice(2).map(_parseInt);
const API_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/";

function fetchJson(compoundId: number, id: number): Promise<{ compound: PubChemCompound; id: number }> {
	return new Promise((resolve, reject) => {
		fetch(API_URL + compoundId + "/JSON")
			.then((res) => res.json())
			.then((res) => resolve({ compound: res as PubChemCompound, id }));
	});
}

function writeToFile(data: {}) {
	fs.writeFile("./compounds/" + compoundId + ".json", JSON.stringify(data), (err) => {
		if (err) {
			console.log(err);
		}
	});
}

function writeToFileReduced(data: {}) {
	fs.writeFile("./compounds/" + compoundId + "_reduced.json", JSON.stringify(data), (err) => {
		if (err) {
			console.log(err);
		}
	});
}

async function init() {
	let promises = [];
	let count = 0;

	for (let i = startId; i <= endId; i++) {
		promises.push(fetchJson(compoundId + count, startId + count));
		count++;
	}

	Promise.all(promises).then((res) => {
		res.forEach(({ compound, id }) => {
			const reducedCompound = getNecessaryData(compound);
			writeToFileReduced(reducedCompound);
			// writeToFile(compound);
		});
	});
}

init();
