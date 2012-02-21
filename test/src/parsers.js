describe('CSS Parsers', function (){

	it('should parse simple strings', function(){
		expect(new CSSStringParser("").toString()).toBe("")
		expect(new CSSStringParser().toString()).toBe("")
		expect(new CSSStringParser(null).toString()).toBe("")
		expect(new CSSStringParser("arbitrary").toString()).toBe("arbitrary")
	})
	
	it('should parse lengths', function(){
		var testee = document.getElementById('testee')
		
		expect(new CSSLengthParser("").toString()).toBe("")
		expect(new CSSLengthParser().toString()).toBe("")
		expect(new CSSLengthParser(null).toString()).toBe("")
		expect(new CSSLengthParser("arbitrary").toString()).toBe("")
		expect(new CSSLengthParser("auto").toString()).toBe("auto")
		expect(new CSSLengthParser("10").toString()).toBe("10px")
		expect(new CSSLengthParser(10).toString()).toBe("10px")
		expect(new CSSLengthParser(0).toString()).toBe("0px")
		expect(new CSSLengthParser("0%").toString()).toBe("0px")
		expect(new CSSLengthParser("10%").toString()).toBe("10%")
		
		// normalized
		expect(new CSSLengthParser("").toString(true)).toBe("0px")
		expect(new CSSLengthParser().toString(true)).toBe("0px")
		expect(new CSSLengthParser(null).toString(true)).toBe("0px")
		expect(new CSSLengthParser("arbitrary").toString(true)).toBe("0px")
		
		// normalized to pixel
		expect(new CSSLengthParser("10%").toString(true, testee)).toBe("10px")
	})
	
	it('should parse 4 values shorthands', function(){
		var testee = document.getElementById('testee')
		
		expect(new CSSLengthParsers("").toString()).toBe("")
		expect(new CSSLengthParsers().toString()).toBe("")
		expect(new CSSLengthParsers(null).toString()).toBe("")
		expect(new CSSLengthParsers("arbitrary").toString()).toBe("")
		expect(new CSSLengthParsers("auto").toString()).toBe("auto auto auto auto")
		expect(new CSSLengthParsers("10").toString()).toBe("10px 10px 10px 10px")
		expect(new CSSLengthParsers(10).toString()).toBe("10px 10px 10px 10px")
		expect(new CSSLengthParsers(0).toString()).toBe("0px 0px 0px 0px")
		expect(new CSSLengthParsers("0%").toString()).toBe("0px 0px 0px 0px")
		expect(new CSSLengthParsers("10%").toString()).toBe("10% 10% 10% 10%")
		expect(new CSSLengthParsers("10% 20px").toString()).toBe("10% 20px 10% 20px")
		expect(new CSSLengthParsers("10% 20px 30em").toString()).toBe("10% 20px 30em 20px")
		expect(new CSSLengthParsers("10% 20px 30em 40mm").toString()).toBe("10% 20px 30em 40mm")
		
		//normalized
		expect(new CSSLengthParsers("").toString(true)).toBe("0px 0px 0px 0px")
		expect(new CSSLengthParsers().toString(true)).toBe("0px 0px 0px 0px")
		expect(new CSSLengthParsers(null).toString(true)).toBe("0px 0px 0px 0px")
		expect(new CSSLengthParsers("arbitrary").toString(true)).toBe("0px 0px 0px 0px")
		
		expect(new CSSLengthParsers("10% auto 30em").toString()).toBe("10% auto 30em auto")
		
		// normalized to pixel
		expect(new CSSLengthParsers("10%").toString(true, testee)).toBe("10px 10px 10px 10px")
		expect(new CSSLengthParsers("10% 20% 30%").toString(true, testee)).toBe("10px 20px 30px 20px")

	})
	
	it('should parse numbers', function(){
		expect(new CSSNumberParser("").toString()).toBe("")
		expect(new CSSNumberParser().toString()).toBe("")
		expect(new CSSNumberParser(null).toString()).toBe("")
		expect(new CSSNumberParser("arbitrary").toString()).toBe("arbitrary")
		expect(new CSSNumberParser("10").toString()).toBe("10")
		expect(new CSSNumberParser("10px").toString()).toBe("10")
		expect(new CSSNumberParser(0).toString()).toBe("0")
		expect(new CSSNumberParser("0%").toString()).toBe("0")
		expect(new CSSNumberParser("10%").toString()).toBe("10")
	})
	
	it('should parse colors', function(){
		expect(new CSSColorParser("").toString()).toBe("")
		expect(new CSSColorParser().toString()).toBe("")
		expect(new CSSColorParser(null).toString()).toBe("")
		expect(new CSSColorParser("arbitrary").toString()).toBe("")
		expect(new CSSColorParser("10").toString()).toBe("")
		expect(new CSSColorParser("10px").toString()).toBe("")
		expect(new CSSColorParser(0).toString()).toBe("")
		expect(new CSSColorParser("0%").toString()).toBe("")
		expect(new CSSColorParser("10%").toString()).toBe("")

		expect(new CSSColorParser("#000").toString()).toBe("rgb(0,0,0)")
		expect(new CSSColorParser("#0000").toString()).toBe("transparent")
		expect(new CSSColorParser("#000f").toString()).toBe("rgb(0,0,0)")
		expect(new CSSColorParser("rgb(0, 0, 0, 0.5)").toString()).toBe("rgba(0,0,0,0.5)")
		expect(new CSSColorParser("rgba(0, 0, 0, 1)").toString()).toBe("rgb(0,0,0)")
		expect(new CSSColorParser("rgb(0,0,0)").toString()).toBe("rgb(0,0,0)")
		expect(new CSSColorParser("#ff330099").toString()).toBe("rgba(255,51,0,0.6)")
		expect(new CSSColorParser("#f309").toString()).toBe("rgba(255,51,0,0.6)")
		
		// normalized
		expect(new CSSColorParser("").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser().toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser(null).toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("arbitrary").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("10").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("10px").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser(0).toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("0%").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("10%").toString(true)).toBe("rgba(0,0,0,1)")

		expect(new CSSColorParser("#000").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("#0000").toString(true)).toBe("rgba(0,0,0,0)")
		expect(new CSSColorParser("#000f").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("rgb(0, 0, 0, 0.5)").toString(true)).toBe("rgba(0,0,0,0.5)")
		expect(new CSSColorParser("rgb(0,0,0)").toString(true)).toBe("rgba(0,0,0,1)")
		expect(new CSSColorParser("#ff330099").toString(true)).toBe("rgba(255,51,0,0.6)")
		expect(new CSSColorParser("#f309").toString(true)).toBe("rgba(255,51,0,0.6)")
	
	})
	
	it('should parse borderStyle', function(){
		expect(new CSSBorderStyleParser("").toString()).toBe("")
		expect(new CSSBorderStyleParser().toString()).toBe("")
		expect(new CSSBorderStyleParser(null).toString()).toBe("")
		expect(new CSSBorderStyleParser("arbitrary").toString()).toBe("")
		expect(new CSSBorderStyleParser("solid").toString()).toBe("solid")

		expect(new CSSBorderStyleParser("").toString(true)).toBe("none")
		expect(new CSSBorderStyleParser().toString(true)).toBe("none")
		expect(new CSSBorderStyleParser(null).toString(true)).toBe("none")
		expect(new CSSBorderStyleParser("arbitrary").toString(true)).toBe("none")
	})
	
	it('should parse border', function(){
		var testee = document.getElementById('testee')

		expect(new CSSBorderParsers("").toString()).toBe("")
		expect(new CSSBorderParsers().toString()).toBe("")
		expect(new CSSBorderParsers(null).toString()).toBe("")
		expect(new CSSBorderParsers("arbitrary").toString()).toBe("")
		
		expect(new CSSBorderParsers("1px dashed green").toString()).toBe("1px dashed rgb(0,128,0)")
		expect(new CSSBorderParsers("1px none red").toString()).toBe("1px none rgb(255,0,0)")
		expect(new CSSBorderParsers("0 double #0000").toString()).toBe("0px double transparent")
		expect(new CSSBorderParsers("10% double rgba(0,0,0,0)").toString(true, testee)).toBe("10px double rgba(0,0,0,0)")
		
		expect(new CSSBorderParsers("").toString(true)).toBe("0px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers().toString(true)).toBe("0px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers(null).toString(true)).toBe("0px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers("arbitrary").toString(true)).toBe("0px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers("none").toString(true)).toBe("0px none rgba(0,0,0,1)")
		
		expect(new CSSBorderParsers("none").toString(true)).toBe("0px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers("10px").toString(true)).toBe("10px none rgba(0,0,0,1)")
		expect(new CSSBorderParsers("red").toString(true)).toBe("0px none rgba(255,0,0,1)")
		expect(new CSSBorderParsers("red 10px").toString(true)).toBe("10px none rgba(255,0,0,1)")
		expect(new CSSBorderParsers("dashed blue").toString(true)).toBe("0px blue rgba(0,0,255,1)")
		expect(new CSSBorderParsers("dotted 20%").toString(true)).toBe("20% dotted rgba(0,0,0,1)")
		expect(new CSSBorderParsers("red 10px double").toString(true)).toBe("10px double rgba(255,0,0,1)")
	})
	
	it('should parse borderColor', function(){
		expect(new CSSBorderColorParsers("").toString()).toBe("")
		expect(new CSSBorderColorParsers().toString()).toBe("")
		expect(new CSSBorderColorParsers(null).toString()).toBe("")
		expect(new CSSBorderColorParsers("arbitrary").toString()).toBe("")

		expect(new CSSBorderColorParsers("red green").toString()).toBe("rgb(255,0,0) rgb(0,128,0) rgb(255,0,0) rgb(0,128,0)")
		expect(new CSSBorderColorParsers("red green #0000ff").toString()).toBe("rgb(255,0,0) rgb(0,128,0) rgb(0,0,255) rgb(0,128,0)")
		expect(new CSSBorderColorParsers("red green #0000ff rgba(255,0,0,1)").toString()).toBe("rgb(255,0,0) rgb(0,128,0) rgb(0,0,255) rgb(255,0,0)")

		expect(new CSSBorderColorParsers("").toString(true)).toBe("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
		expect(new CSSBorderColorParsers().toString(true)).toBe("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
		expect(new CSSBorderColorParsers(null).toString(true)).toBe("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
		expect(new CSSBorderColorParsers("arbitrary").toString(true)).toBe("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
	})

})
