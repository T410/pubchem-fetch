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
function fetchJson(compoundId, id) {
    return new Promise((resolve, reject) => {
        fetch(API_URL + compoundId + "/JSON")
            .then((res) => res.json())
            .then((res) => resolve({ compound: res, id }));
    });
}
function writeToFile(data) {
    fs.writeFile("./compounds/" + compoundId + ".json", JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
    });
}
function writeToFileReduced(data) {
    fs.writeFile("./compounds/" + compoundId + "_reduced.json", JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
init();
