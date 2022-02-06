export default function parse(raw) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_d = (_c = (_b = (_a = raw.Record.Section.find((x) => x.TOCHeading === "Chemical Safety")) === null || _a === void 0 ? void 0 : _a.Information) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.Value) === null || _d === void 0 ? void 0 : _d.StringWithMarkup[0].Markup.map((x) => {
        return x;
    })) !== null && _e !== void 0 ? _e : "No data");
}
