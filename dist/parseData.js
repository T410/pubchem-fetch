const getChemicalSafety = (raw) => {
    var _a;
    return (_a = raw.Section.find((x) => x.TOCHeading === "Chemical Safety")) === null || _a === void 0 ? void 0 : _a.Information.map((info) => info.Value.StringWithMarkup.map((x) => x.Markup.map(({ Type, URL, Extra }) => {
        return { Type, URL, Extra };
    }))).flat();
};
const setToResult = (result) => (keyValuePair) => {
    if (keyValuePair) {
        return Object.assign(Object.assign({}, result), keyValuePair);
    }
    return result;
};
const getH3 = (raw) => (h3) => raw.Section.find((x) => x.TOCHeading === h3);
const getSubsection = (raw) => (h4) => { var _a; return (_a = raw.Section) === null || _a === void 0 ? void 0 : _a.find((x) => x.TOCHeading === h4); };
const getStringWithMarkupString = (section) => {
    if (section === undefined)
        return [""];
    const stringWithMarkup = section.Information.map((info) => info.Value.StringWithMarkup.map((x) => x.String)).flat();
    if (!stringWithMarkup)
        return [""];
    return [...new Set(stringWithMarkup)];
};
const getUnit = (section) => {
    if (section === undefined)
        return [""];
    const stringWithMarkup = section.Information.map((info) => info.Value.Unit).flat();
    if (!stringWithMarkup)
        return [""];
    return [...new Set(stringWithMarkup)];
};
const getNumber = (section) => {
    if (section === undefined)
        return [""];
    const stringWithMarkup = section.Information.map((info) => { var _a; return (_a = info.Value.Number) === null || _a === void 0 ? void 0 : _a.map((x) => x); }).flat();
    if (!stringWithMarkup)
        return [""];
    return [...new Set(stringWithMarkup)];
};
export default function getNecessaryData(raw) {
    var _a;
    let res = {};
    res = setToResult(res)({ RecordNumber: raw.RecordNumber });
    res = setToResult(res)({ RecordTitle: raw.RecordTitle });
    const ChemicalSafety = getChemicalSafety(raw);
    res = setToResult(res)({ ChemicalSafety });
    const NamesAndIdentifiers = getH3(raw)("Names and Identifiers");
    if (NamesAndIdentifiers) {
        res = setToResult(res)({
            RecordDescription: getStringWithMarkupString(getSubsection(NamesAndIdentifiers)("Record Description")),
        });
        const ComputedDescriptors = getSubsection(NamesAndIdentifiers)("Computed Descriptors");
        if (ComputedDescriptors) {
            ["IUPAC Name", "InChI", "InChI Key", "Canonical SMILES"].forEach((x) => {
                let key = x.replace(/ /g, "");
                res = setToResult(res)({
                    [key]: getStringWithMarkupString(getSubsection(ComputedDescriptors)(x)),
                });
            });
        }
        const MolecularFormula = getStringWithMarkupString(getSubsection(NamesAndIdentifiers)("Molecular Formula"));
        res = setToResult(res)({ MolecularFormula });
        const OtherIdentifiers = getSubsection(NamesAndIdentifiers)("Other Identifiers");
        if (OtherIdentifiers) {
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
                    [key]: getStringWithMarkupString(getSubsection(OtherIdentifiers)(x)),
                });
            });
            res = setToResult(res)({ Wikipedia: (_a = getSubsection(OtherIdentifiers)("Wikipedia")) === null || _a === void 0 ? void 0 : _a.Information[0].URL });
        }
    }
    const ChemicalAndPhysicalProperties = getH3(raw)("Chemical and Physical Properties");
    if (ChemicalAndPhysicalProperties) {
        const ComputedProperties = getSubsection(ChemicalAndPhysicalProperties)("Computed Properties");
        if (ComputedProperties) {
            //Information > Value > StringWithMarkup > String
            ["Molecular Weight", "Compound Is Canonicalized"].forEach((x) => {
                let key = x.replace(/ /g, "");
                res = setToResult(res)({
                    [key]: getStringWithMarkupString(getSubsection(ComputedProperties)(x)),
                });
            });
            ["Exact Mass", "Monoisotopic Mass"].forEach((x) => {
                let key = x.replace(/ /g, "");
                const section = getSubsection(ComputedProperties)(x);
                res = setToResult(res)({
                    [key]: { String: getStringWithMarkupString(section), Unit: getUnit(section) },
                });
            });
            //This needs both number and unit
            const topological = getSubsection(ComputedProperties)("Topological Polar Surface Area");
            res = setToResult(res)({
                "Topological Polar Surface Area": { Number: getNumber(topological), Unit: getUnit(topological) },
            });
            //Information > Value > Number
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
                let key = x.replace(/ /g, "");
                res = setToResult(res)({
                    [key]: getNumber(getSubsection(ComputedProperties)(x)),
                });
            });
        }
        const ExperimentalProperties = getSubsection(ChemicalAndPhysicalProperties)("Experimental Properties");
        if (ExperimentalProperties) {
            [
                "Physical Description",
                "Color/Form",
                "Odor",
                "Taste",
                "Boiling Point",
                "Melting Point",
                "Flash Point",
                "Solubility",
                "Density",
                "Vapor Density",
                "Vapor Pressure",
                "LogP",
                "Henrys Law Constant",
                "Atmospheric OH Rate Constant",
                "Stability/Shelf Life",
                "Autoignition Temperature",
                "Decomposition",
                "Viscosity",
                "Corrosivity",
                "Heat of Combustion",
                "Heat of Vaporization",
                "pH",
                "Surface Tension",
                "Ionization Potential",
                "Polymerization",
                "Odor Threshold",
                "Refractive Index",
                "Dissociation Constants",
                "Other Experimental Properties",
            ].forEach((x) => {
                let key = x.replace(/ /g, "");
                res = setToResult(res)({
                    [key]: getStringWithMarkupString(getSubsection(ExperimentalProperties)(x)),
                });
            });
            res = setToResult(res)({
                "Kovats Retention Index": getNumber(getSubsection(ExperimentalProperties)("Kovats Retention Index")),
            });
        }
    }
    const FoodAdditivesAndIngredients = getH3(raw)("Food Additives and Ingredients");
    if (FoodAdditivesAndIngredients) {
        const FoodAdditiveClasses = getSubsection(FoodAdditivesAndIngredients)("Food Additive Classes");
        res = setToResult(res)({
            FoodAdditiveClasses: getStringWithMarkupString(FoodAdditiveClasses),
        });
    }
    const AgrochemicalInformation = getH3(raw)("Agrochemical Information");
    if (AgrochemicalInformation) {
        res = setToResult(res)({
            AgrochemicalCategory: getStringWithMarkupString(getSubsection(AgrochemicalInformation)("Agrochemical Category")),
        });
    }
    return res;
}
