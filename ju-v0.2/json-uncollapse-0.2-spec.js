var testText = '111 11 111';
var findSymbol = JsonUncollapse._findSymbolNandNp1;

describe("findSymbolNandNp1 spec for '" + testText + "'", function () {
    it("return [0, 3] when n = 0", function () {
        expect(findSymbol(testText, ' ', 0)).toEqual([1,3]);
    });
});