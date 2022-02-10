var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
import fs from "fs";
import getNecessaryData from "./parseData.js";
const _parseInt = (x) => parseInt(x);
const [startId, endId, compoundId] = process.argv.slice(2).map(_parseInt);
const API_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/";
function fetchJson(compoundId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(API_URL + compoundId + "/JSON");
    });
}
const asyncForEach = (array, callback) => __awaiter(void 0, void 0, void 0, function* () {
    for (let index = 0; index < array.length; index++) {
        yield callback(array[index], index, array);
    }
});
const delay = (t) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(t);
        }, t);
    });
};
function split(arr, n) {
    var res = [];
    while (arr.length) {
        res.push(arr.splice(0, n));
    }
    return res;
}
export const throttledPromises = (asyncFunction, items, batchSize = 1, delayAmount) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const output = [];
        const batches = split(items, batchSize);
        yield asyncForEach(batches, (batch) => __awaiter(void 0, void 0, void 0, function* () {
            const promises = batch.map(asyncFunction).map((p) => p.catch(reject));
            const results = yield Promise.all(promises);
            results.forEach((response) => __awaiter(void 0, void 0, void 0, function* () {
                const { Record } = (yield response.json());
                const { RecordNumber } = Record;
                const id = RecordNumber - compoundId + startId;
                try {
                    console.log(`Success ${RecordNumber}/${id}`);
                    const reducedCompound = getNecessaryData(Record);
                    writeToFile(reducedCompound, RecordNumber, id);
                }
                catch (e) {
                    console.log(RecordNumber, e);
                }
            }));
            output.push(...results);
            yield delay(delayAmount);
        }));
        resolve(output);
    }));
};
function writeToFile(data, compoundId, id) {
    data.id = id;
    fs.writeFile("./compounds/" + compoundId + "_reduced.json", JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = [];
        for (let i = compoundId; i < compoundId + (endId - startId + 1); i++) {
            ids.push(i);
        }
        throttledPromises(fetchJson, ids, 5, 1000).then((data) => {
            console.log("yay");
        });
    });
}
init();
