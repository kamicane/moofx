describe('CSS Parsers', function (){

    it('should parse lengths', function(){

        expect(moofx.parse('width', "")).to.be("")
        expect(moofx.parse('width')).to.be("")
        expect(moofx.parse('width', null)).to.be("")
        expect(moofx.parse('width', "auto")).to.be("auto")
        expect(moofx.parse('width', "10")).to.be("10px")
        expect(moofx.parse('width', 10)).to.be("10px")
        expect(moofx.parse('width', 0)).to.be("0px")
        expect(moofx.parse('width', "0%")).to.be("0%")
        expect(moofx.parse('width', "10%")).to.be("10%")

        // normalized
        expect(moofx.parse('width', "", true)).to.be("0px")
        expect(moofx.parse('width', undefined, true)).to.be("0px")
        expect(moofx.parse('width', null, true)).to.be("0px")
    })

    it('should parse 4 values shorthands', function(){

        expect(moofx.parse('margin', "")).to.be("")
        expect(moofx.parse('margin', undefined)).to.be("")
        expect(moofx.parse('margin', null)).to.be("")
        expect(moofx.parse('margin', "auto")).to.be("auto auto auto auto")
        expect(moofx.parse('margin', "10")).to.be("10px 10px 10px 10px")
        expect(moofx.parse('margin', 10)).to.be("10px 10px 10px 10px")
        expect(moofx.parse('margin', 0)).to.be("0px 0px 0px 0px")
        expect(moofx.parse('margin', "0%")).to.be("0% 0% 0% 0%")
        expect(moofx.parse('margin', "10%")).to.be("10% 10% 10% 10%")
        expect(moofx.parse('margin', "10% 20px")).to.be("10% 20px 10% 20px")
        expect(moofx.parse('margin', "10% 20px 30em")).to.be("10% 20px 30em 20px")
        expect(moofx.parse('margin', "10% 20px 30em 40mm")).to.be("10% 20px 30em 40mm")

        //normalized
        expect(moofx.parse('margin', "", true)).to.be("0px 0px 0px 0px")
        expect(moofx.parse('margin', undefined, true)).to.be("0px 0px 0px 0px")
        expect(moofx.parse('margin', null, true)).to.be("0px 0px 0px 0px")

        expect(moofx.parse('margin', "10% auto 30em", true)).to.be("10% auto 30em auto")

    })

    it('should parse numbers', function(){
        expect(moofx.parse('opacity', "")).to.be("")
        expect(moofx.parse('opacity', undefined)).to.be("")
        expect(moofx.parse('opacity', null)).to.be("")
        expect(moofx.parse('opacity', "arbitrary")).to.be("1")
        expect(moofx.parse('opacity', "10")).to.be("10")
        expect(moofx.parse('opacity', "10px")).to.be("1")
        expect(moofx.parse('opacity', 0)).to.be("0")
        expect(moofx.parse('opacity', "0%")).to.be("1")
        expect(moofx.parse('opacity', "10%")).to.be("1")
    })

    it('should parse colors', function(){

        // not normalized
        expect(moofx.parse('color', "")).to.be("")
        expect(moofx.parse('color', undefined)).to.be("")
        expect(moofx.parse('color', null)).to.be("")
        expect(moofx.parse('color', "arbitrary")).to.be("")
        expect(moofx.parse('color', "10")).to.be("")
        expect(moofx.parse('color', "10px")).to.be("")
        expect(moofx.parse('color', 0)).to.be("")
        expect(moofx.parse('color', "0%")).to.be("")
        expect(moofx.parse('color', "10%")).to.be("")

        expect(moofx.parse('color', "#000")).to.be("rgb(0,0,0)")
        expect(moofx.parse('color', "#0000")).to.be("transparent")
        expect(moofx.parse('color', "#000f")).to.be("rgb(0,0,0)")
        expect(moofx.parse('color', "rgb(0, 0, 0, 0.5)")).to.be("rgba(0,0,0,0.5)")
        expect(moofx.parse('color', "rgba(0, 0, 0, 1)")).to.be("rgb(0,0,0)")
        expect(moofx.parse('color', "rgb(0,0,0)")).to.be("rgb(0,0,0)")
        expect(moofx.parse('color', "#ff330099")).to.be("rgba(255,51,0,0.6)")
        expect(moofx.parse('color', "#f309")).to.be("rgba(255,51,0,0.6)")
        expect(moofx.parse('color', "hsla(0,0%,100%,0.3)")).to.be("rgba(255,255,255,0.3)")

        // normalized
        expect(moofx.parse('color', "", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', undefined, true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', null, true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "arbitrary", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "10", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "10px", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', 0, true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "0%", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "10%", true)).to.be("rgba(0,0,0,1)")

        expect(moofx.parse('color', "#000", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "#0000", true)).to.be("rgba(0,0,0,0)")
        expect(moofx.parse('color', "#000f", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "rgb(0, 0, 0, 0.5)", true)).to.be("rgba(0,0,0,0.5)")
        expect(moofx.parse('color', "rgb(0,0,0)", true)).to.be("rgba(0,0,0,1)")
        expect(moofx.parse('color', "#ff330099", true)).to.be("rgba(255,51,0,0.6)")
        expect(moofx.parse('color', "#f309", true)).to.be("rgba(255,51,0,0.6)")
    })

    it('should parse borderStyle', function(){
        expect(moofx.parse('border-top-style', "")).to.be("")
        expect(moofx.parse('border-top-style', undefined)).to.be("")
        expect(moofx.parse('border-top-style', null)).to.be("")
        expect(moofx.parse('border-top-style', "arbitrary")).to.be("")
        expect(moofx.parse('border-top-style', "solid")).to.be("solid")

        expect(moofx.parse('border-top-style', "", true)).to.be("none")
        expect(moofx.parse('border-top-style', undefined, true)).to.be("none")
        expect(moofx.parse('border-top-style', null, true)).to.be("none")
        expect(moofx.parse('border-top-style', "arbitrary", true)).to.be("none")
    })

    it('should parse border', function(){

        expect(moofx.parse('border', "")).to.be("")
        expect(moofx.parse('border', undefined)).to.be("")
        expect(moofx.parse('border', null)).to.be("")

        expect(moofx.parse('border', "arbitrary")).to.be("")

        expect(moofx.parse('border', "1px dashed green")).to.be("1px dashed rgb(0,128,0)")
        expect(moofx.parse('border', "1px none red")).to.be("1px none rgb(255,0,0)")
        expect(moofx.parse('border', "0 double #0000")).to.be("0px double transparent")

        expect(moofx.parse('border', "", true)).to.be("0px none rgba(0,0,0,1)")
        expect(moofx.parse('border', undefined, true)).to.be("0px none rgba(0,0,0,1)")
        expect(moofx.parse('border', null, true)).to.be("0px none rgba(0,0,0,1)")
        expect(moofx.parse('border', "arbitrary", true)).to.be("0px none rgba(0,0,0,1)")
        expect(moofx.parse('border', "none", true)).to.be("0px none rgba(0,0,0,1)")

        // unordered border ftw

        expect(moofx.parse('border', "none", true)).to.be("0px none rgba(0,0,0,1)")
        expect(moofx.parse('border', "10px", true)).to.be("10px none rgba(0,0,0,1)")
        expect(moofx.parse('border', "red", true)).to.be("0px none rgba(255,0,0,1)")
        expect(moofx.parse('border', "red 10px", true)).to.be("10px none rgba(255,0,0,1)")
        expect(moofx.parse('border', "dashed blue", true)).to.be("0px dashed rgba(0,0,255,1)")
        expect(moofx.parse('border', "dotted 20%", true)).to.be("20% dotted rgba(0,0,0,1)")
        expect(moofx.parse('border', "red 10px double", true)).to.be("10px double rgba(255,0,0,1)")
    })

    it('should parse borderColor', function(){
        expect(moofx.parse('border-color', "")).to.be("")
        expect(moofx.parse('border-color', undefined)).to.be("")
        expect(moofx.parse('border-color', null)).to.be("")
        expect(moofx.parse('border-color', "arbitrary")).to.be("")

        expect(moofx.parse('border-color', "red green")).to.be("rgb(255,0,0) rgb(0,128,0) rgb(255,0,0) rgb(0,128,0)")
        expect(moofx.parse('border-color', "red green #0000ff")).to.be("rgb(255,0,0) rgb(0,128,0) rgb(0,0,255) rgb(0,128,0)")
        expect(moofx.parse('border-color', "red green #0000ff rgba(255,0,0,1)")).to.be("rgb(255,0,0) rgb(0,128,0) rgb(0,0,255) rgb(255,0,0)")

        expect(moofx.parse('border-color', "", true)).to.be("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
        expect(moofx.parse('border-color', undefined, true)).to.be("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
        expect(moofx.parse('border-color', null, true)).to.be("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
        expect(moofx.parse('border-color', "arbitrary", true)).to.be("rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1) rgba(0,0,0,1)")
    })

})
