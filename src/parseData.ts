import { PubChemCompound, BaseSection } from "./types";

const getChemicalSafety = (raw: PubChemCompound) =>
	raw.Record.Section.find(
		(x) => x.TOCHeading === "Chemical Safety"
	)?.Information[0].Value.StringWithMarkup[0].Markup.map(({ Type, URL, Extra }) => {
		return { Type, URL, Extra };
	});

const setToResult = (result: {}) => (keyValuePair: {} | undefined) => {
	if (keyValuePair) {
		return { ...result, ...keyValuePair };
	}
	return result;
};

const getH3 = (raw: PubChemCompound) => (h3: string) => raw.Record.Section.find((x) => x.TOCHeading === h3);
const getSubsection = (raw: BaseSection<string>) => (h4: string) => raw.Section?.find((x) => x.TOCHeading === h4);

export default function getNecessaryData(raw: PubChemCompound) {
	let res = {};
	const ChemicalSafety = getChemicalSafety(raw);

	res = setToResult(res)({ ChemicalSafety });

	const NamesAndIdentifiers = getH3(raw)("Names and Identifiers") as BaseSection<"Names and Identifiers">;

	const RecordDescription = getSubsection(NamesAndIdentifiers)(
		"Record Description"
	) as BaseSection<"Record Description">;
	res = setToResult(res)({ RecordDescription: RecordDescription.Information[0].Value.StringWithMarkup[0].String });

	const ComputedDescriptors = getSubsection(NamesAndIdentifiers)(
		"Computed Descriptors"
	) as BaseSection<"Computed Descriptors">;

	["IUPAC Name", "InChI", "InChI Key", "Canonical SMILES"].forEach((x) => {
		let key = x.replace(/ /g, "");
		res = setToResult(res)({
			[key]: getSubsection(ComputedDescriptors)(x)!.Information[0].Value.StringWithMarkup[0].String,
		});
	});

	const MolecularFormula = getSubsection(NamesAndIdentifiers)("Molecular Formula") as BaseSection<"Molecular Formula">;
	res = setToResult(res)({ MolecularFormula: MolecularFormula.Information[0].Value.StringWithMarkup[0].String });

	const OtherIdentifiers = getSubsection(NamesAndIdentifiers)("Other Identifiers") as BaseSection<"Other Identifiers">;
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
			[key]: getSubsection(OtherIdentifiers)(x)!.Information[0].Value.StringWithMarkup[0].String,
		});
	});

	res = setToResult(res)({ Wikipedia: getSubsection(OtherIdentifiers)("Wikipedia")?.Information[0].URL });

	const ChemicalAndPhysicalProperties = getH3(raw)(
		"Chemical and Physical Properties"
	) as BaseSection<"Chemical and Physical Properties">;
	const ComputedProperties = getSubsection(ChemicalAndPhysicalProperties)(
		"Computed Properties"
	) as BaseSection<"Computed Properties">;

	//Information > Value > StringWithMarkup > String
	["Molecular Weight", "Compound Is Canonicalized"].forEach((x) => {
		let key = x.replace(/ /g, "");
		res = setToResult(res)({
			[key]: getSubsection(ComputedProperties)(x)!.Information[0].Value.StringWithMarkup[0].String,
		});
	});

	["Exact Mass", "Monoisotopic Mass"].forEach((x) => {
		let key = x.replace(/ /g, "");
		const value = getSubsection(ComputedProperties)(x)!.Information[0].Value;
		res = setToResult(res)({
			[key]: { String: value.StringWithMarkup[0].String, Unit: value.Unit },
		});
	});

	//This needs both number and unit
	const topological = getSubsection(ComputedProperties)("Topological Polar Surface Area")!.Information[0].Value;
	res = setToResult(res)({ "Topological Polar Surface Area": { Number: topological.Number, Unit: topological.Unit } });

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
			[key]: getSubsection(ComputedProperties)(x)!.Information[0].Value.Number?.[0],
		});
	});

	const ExperimentalProperties = getSubsection(ChemicalAndPhysicalProperties)(
		"Experimental Properties"
	) as BaseSection<"Experimental Properties">;

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
		const section = getSubsection(ExperimentalProperties)(x);
		if (!section) return;
		console.log(section);
		res = setToResult(res)({
			[key]: section.Information.map((info) => info.Value.StringWithMarkup.map((x) => x.String)).flat(),
		});
	});
	const kovats = getSubsection(ExperimentalProperties)("Kovats Retention Index")!.Information[0].Value.Number;
	res = setToResult(res)({ "Kovats Retention Index": kovats });

	return res;
}
