import fetch from "node-fetch";
import fs from "fs";
import type { PubChemCompound } from "./types";
import getNecessaryData from "./parseData.js";

const _parseInt = (x: string) => parseInt(x);

const [startId, endId, compoundId] = process.argv.slice(2).map(_parseInt);
const API_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/";

function fetchJson(
	compoundId: number,
	id: number
): Promise<{ compound: PubChemCompound; compoundId: number; id: number }> {
	return new Promise((resolve, reject) => {
		fetch(API_URL + compoundId + "/JSON")
			.then((res) => res.json())
			.then((res) => {
				const { Record } = res as { Record: PubChemCompound };
				resolve({ compound: Record, compoundId, id });
			});
	});
}

function writeToFile(data: PubChemCompound, compoundId: number, id: number) {
	data.id = id;
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

	let i = 0;

	Promise.all(promises).then((res) => {
		res.forEach(({ compound, compoundId, id }) => {
			const reducedCompound = getNecessaryData(compound) as PubChemCompound;
			writeToFile(reducedCompound, compoundId, id);
		});
	});
}

init();
