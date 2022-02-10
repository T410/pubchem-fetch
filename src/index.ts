import fetch, { Response } from "node-fetch";
import fs from "fs";
import type { PubChemCompound } from "./types";
import getNecessaryData from "./parseData.js";

const _parseInt = (x: string) => parseInt(x);

const [startId, endId, compoundId] = process.argv.slice(2).map(_parseInt);
const API_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/";

async function fetchJson(compoundId: number): Promise<Response> {
	return await fetch(API_URL + compoundId + "/JSON");
}

const asyncForEach = async <T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
};

const delay = (t: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(t);
		}, t);
	});
};

function split(arr: any[], n: number) {
	var res = [];
	while (arr.length) {
		res.push(arr.splice(0, n));
	}
	return res;
}

export const throttledPromises = (
	asyncFunction: (...args: any[]) => Promise<any>,
	items: number[],
	batchSize = 1,
	delayAmount: number
) => {
	return new Promise(async (resolve, reject) => {
		const output: any[] = [];
		const batches = split(items, batchSize);
		await asyncForEach(batches, async (batch) => {
			const promises = batch.map(asyncFunction).map((p) => p.catch(reject));
			const results = await Promise.all<Response>(promises);
			results.forEach(async (response) => {
				const { Record } = (await response.json()) as { Record: PubChemCompound };
				const { RecordNumber } = Record;
				const id = RecordNumber - compoundId + startId;
				try {
					console.log(`Success ${RecordNumber}/${id}`);
					const reducedCompound = getNecessaryData(Record) as PubChemCompound;
					writeToFile(reducedCompound, RecordNumber, id);
				} catch (e) {
					console.log(RecordNumber, e);
				}
			});
			output.push(...results);
			await delay(delayAmount);
		});
		resolve(output);
	});
};

function writeToFile(data: PubChemCompound, compoundId: number, id: number) {
	data.id = id;
	fs.writeFile("./compounds/" + compoundId + "_reduced.json", JSON.stringify(data), (err) => {
		if (err) {
			console.log(err);
		}
	});
}

async function init() {
	let ids = [];

	for (let i = compoundId; i < compoundId + (endId - startId + 1); i++) {
		ids.push(i);
	}

	throttledPromises(fetchJson, ids, 5, 1000).then((data) => {
		console.log("yay");
	});
}

init();
