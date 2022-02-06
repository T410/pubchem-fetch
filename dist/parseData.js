const getChemicalSafety = (raw) => {
    var _a;
    return (_a = raw.Record.Section.find((x) => x.TOCHeading === "Chemical Safety")) === null || _a === void 0 ? void 0 : _a.Information[0].Value.StringWithMarkup[0].Markup.map(({ Type, URL, Extra }) => {
        return { Type, URL, Extra };
    });
};
const setToResult = (result) => (keyValuePair) => {
    if (keyValuePair) {
        return Object.assign(Object.assign({}, result), keyValuePair);
    }
    return result;
};
const getH3 = (raw) => (h3) => raw.Record.Section.find((x) => x.TOCHeading === h3);
const getSubsection = (raw) => (h4) => { var _a; return (_a = raw.Section) === null || _a === void 0 ? void 0 : _a.find((x) => x.TOCHeading === h4); };
export default function getNecessaryData(raw) {
    var _a;
    let res = {};
    const ChemicalSafety = getChemicalSafety(raw);
    res = setToResult(res)({ ChemicalSafety });
    const NamesAndIdentifiers = getH3(raw)("Names and Identifiers");
    const RecordDescription = getSubsection(NamesAndIdentifiers)("Record Description");
    res = setToResult(res)({ RecordDescription: RecordDescription.Information[0].Value.StringWithMarkup[0].String });
    const ComputedDescriptors = getSubsection(NamesAndIdentifiers)("Computed Descriptors");
    ["IUPAC Name", "InChI", "InChI Key", "Canonical SMILES"].forEach((x) => {
        let key = x.replace(/ /g, "");
        res = setToResult(res)({
            [key]: getSubsection(ComputedDescriptors)(x).Information[0].Value.StringWithMarkup[0].String,
        });
    });
    const MolecularFormula = getSubsection(NamesAndIdentifiers)("Molecular Formula");
    res = setToResult(res)({ MolecularFormula: MolecularFormula.Information[0].Value.StringWithMarkup[0].String });
    const OtherIdentifiers = getSubsection(NamesAndIdentifiers)("Other Identifiers");
    [
        "CAS",
        "Related CAS",
        "European Community (EC) Number",
        "ICSC Number",
        "RTECS Number",
        "UN Number",
        "UNII",
        "FEMA Number",
        "DSSTox Substance ID",
        "NCI Thesaurus Code",
    ].forEach((x) => {
        let key = x.replace(/ /g, "");
        res = setToResult(res)({
            [key]: getSubsection(OtherIdentifiers)(x).Information[0].Value.StringWithMarkup[0].String,
        });
    });
    res = setToResult(res)({ Wikipedia: (_a = getSubsection(OtherIdentifiers)("Wikipedia")) === null || _a === void 0 ? void 0 : _a.Information[0].URL });
    const ChemicalAndPhysicalProperties = getH3(raw)("Chemical and Physical Properties");
    const ComputedProperties = getSubsection(ChemicalAndPhysicalProperties)("Computed Properties");
    //Information > Value > StringWithMarkup > String
    ["Molecular Weight", "Compound Is Canonicalized"].forEach((x) => {
        let key = x.replace(/ /g, "");
        res = setToResult(res)({
            [key]: getSubsection(ComputedProperties)(x).Information[0].Value.StringWithMarkup[0].String,
        });
    });
    ["Exact Mass", "Monoisotopic Mass"].forEach((x) => {
        let key = x.replace(/ /g, "");
        const value = getSubsection(ComputedProperties)(x).Information[0].Value;
        res = setToResult(res)({
            [key]: { String: value.StringWithMarkup[0].String, Unit: value.Unit },
        });
    });
    const topological = getSubsection(ComputedProperties)("Topological Polar Surface Area").Information[0].Value;
    res = setToResult(res)({ "Topological Polar Surface Area": { Number: topological.Number, Unit: topological.Unit } });
    // //Information > Value > Number
    [
        "XLogP3",
        "Hydrogen Bond Donor Count",
        "Hydrogen Bond Acceptor Count",
        "Rotatable Bond Count",
        "Heavy Atom Count",
        "Formal Charge",
        "Complexity",
        "Isotope Atom Count",
        "Defined Atom Stereocenter Count",
        "Undefined Atom Stereocenter Count",
        "Defined Bond Stereocenter Count",
        "Undefined Bond Stereocenter Count",
        "Covalently-Bonded Unit Count",
    ].forEach((x) => {
        var _a;
        let key = x.replace(/ /g, "");
        res = setToResult(res)({
            [key]: (_a = getSubsection(ComputedProperties)(x).Information[0].Value.Number) === null || _a === void 0 ? void 0 : _a[0],
        });
    });
    return res;
}
