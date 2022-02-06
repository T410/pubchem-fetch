import { PubChemCompound, BaseSection } from "./types";

const getChemicalSafety = (raw: PubChemCompound) =>
	raw.Section.find((x) => x.TOCHeading === "Chemical Safety")
		?.Information.map((info) =>
			info.Value.StringWithMarkup.map((x) =>
				x.Markup.map(({ Type, URL, Extra }) => {
					return { Type, URL, Extra };
				})
			)
		)
		.flat();

const setToResult = (result: {}) => (keyValuePair: {} | undefined) => {
	if (keyValuePair) {
		return { ...result, ...keyValuePair };
	}
	return result;
};

const getH3 = (raw: PubChemCompound) => (h3: string) => raw.Section.find((x) => x.TOCHeading === h3);
const getSubsection = (raw: BaseSection<string>) => (h4: string) => raw.Section?.find((x) => x.TOCHeading === h4);

const getStringWithMarkupString = (section: BaseSection<string> | undefined) => {
	if (section === undefined) return [""];

	const stringWithMarkup = section.Information.map((info) => info.Value.StringWithMarkup.map((x) => x.String)).flat();

	if (!stringWithMarkup) return [""];

	return [...new Set(stringWithMarkup)];
};

const getUnit = (section: BaseSection<string> | undefined) => {
	if (section === undefined) return [""];

	const stringWithMarkup = section.Information.map((info) => info.Value.Unit).flat();

	if (!stringWithMarkup) return [""];

	return [...new Set(stringWithMarkup)];
};

const getNumber = (section: BaseSection<string> | undefined) => {
	if (section === undefined) return [""];

	const stringWithMarkup = section.Information.map((info) => info.Value.Number?.map((x) => x)).flat();

	if (!stringWithMarkup) return [""];

	return [...new Set(stringWithMarkup)];
};

export default function getNecessaryData(raw: PubChemCompound) {
	let res = {};

	res = setToResult(res)({ RecordNumber: raw.RecordNumber });
	res = setToResult(res)({ RecordTitle: raw.RecordTitle });

	const ChemicalSafety = getChemicalSafety(raw);

	res = setToResult(res)({ ChemicalSafety });

	const NamesAndIdentifiers = getH3(raw)("Names and Identifiers") as BaseSection<"Names and Identifiers">;
	if (NamesAndIdentifiers) {
		res = setToResult(res)({
			RecordDescription: getStringWithMarkupString(
				getSubsection(NamesAndIdentifiers)("Record Description") as BaseSection<"Record Description">
			),
		});

		const ComputedDescriptors = getSubsection(NamesAndIdentifiers)(
			"Computed Descriptors"
		) as BaseSection<"Computed Descriptors">;
		if (ComputedDescriptors) {
			["IUPAC Name", "InChI", "InChI Key", "Canonical SMILES"].forEach((x) => {
				let key = x.replace(/ /g, "");
				res = setToResult(res)({
					[key]: getStringWithMarkupString(getSubsection(ComputedDescriptors)(x)),
				});
			});
		}

		const MolecularFormula = getStringWithMarkupString(
			getSubsection(NamesAndIdentifiers)("Molecular Formula") as BaseSection<"Molecular Formula">
		);
		res = setToResult(res)({ MolecularFormula });

		const OtherIdentifiers = getSubsection(NamesAndIdentifiers)(
			"Other Identifiers"
		) as BaseSection<"Other Identifiers">;
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

			res = setToResult(res)({ Wikipedia: getSubsection(OtherIdentifiers)("Wikipedia")?.Information[0].URL });
		}
	}

	const ChemicalAndPhysicalProperties = getH3(raw)(
		"Chemical and Physical Properties"
	) as BaseSection<"Chemical and Physical Properties">;

	if (ChemicalAndPhysicalProperties) {
		const ComputedProperties = getSubsection(ChemicalAndPhysicalProperties)(
			"Computed Properties"
		) as BaseSection<"Computed Properties">;

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

		const ExperimentalProperties = getSubsection(ChemicalAndPhysicalProperties)(
			"Experimental Properties"
		) as BaseSection<"Experimental Properties">;

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

	const FoodAdditivesAndIngredients = getH3(raw)(
		"Food Additives and Ingredients"
	) as BaseSection<"Food Additives and Ingredients">;
	if (FoodAdditivesAndIngredients) {
		const FoodAdditiveClasses = getSubsection(FoodAdditivesAndIngredients)(
			"Food Additive Classes"
		) as BaseSection<"Food Additive Classes">;

		res = setToResult(res)({
			FoodAdditiveClasses: getStringWithMarkupString(FoodAdditiveClasses),
		});
	}

	const AgrochemicalInformation = getH3(raw)("Agrochemical Information") as BaseSection<"Agrochemical Information">;
	if (AgrochemicalInformation) {
		res = setToResult(res)({
			AgrochemicalCategory: getStringWithMarkupString(
				getSubsection(AgrochemicalInformation)("Agrochemical Category") as BaseSection<"Agrochemical Category">
			),
		});
	}

	return res;
}
