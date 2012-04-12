describe('computes', function (){

    var test, testee, testEl, testeeEl

    before(function(){
        testEl = document.getElementById('test')
        test = moofx(testEl)
        testeeEl = document.getElementById('testee')
        testee = moofx(testeeEl)
    })

    it('should compute and normalize styles', function(){
        //get
        expect(testee.compute('width')).to.be("100px")

        //change the value for good measure
        testee.style('width', '10%')
        expect(testee.compute('width')).to.be("10px")

        //auto
        testee.style('width', 'auto')
        expect(testee.compute('height')).to.be(testeeEl.clientHeight - 20 + 'px') //clientHeight + paddings

        //more random computes/normalizers
        expect(testee.compute('backgroundColor')).to.be("rgba(0,0,0,1)")
        expect(testee.compute('borderTopStyle')).to.be("dotted")
        expect(testee.compute('borderStyle')).to.be("dotted dotted dotted dotted")
        expect(testee.compute('borderColor')).to.be("rgba(255,0,0,1) rgba(255,0,0,1) rgba(255,0,0,1) rgba(255,0,0,1)")
        expect(testee.compute('border')).to.be("2px dotted rgba(255,0,0,1)")
        expect(testee.compute('visibility')).to.be("visible")
        expect(test.compute('position')).to.be("absolute")
        expect(test.compute('top')).to.be("-1000px")
        expect(test.compute('left')).to.be("-1000px")

        //border normalizers
        testee.style('border', "0px none transparent")
        expect(testee.compute('border')).to.be("0px none rgba(0,0,0,0)")
    })

    it('should reset to default css', function(){
        testee.style('width', '')
        expect(testee.compute('width')).to.be("100px")
        testee.style('width', null)
        expect(testee.compute('width')).to.be("100px")
        testee.style('width')
        expect(testee.compute('width')).to.be("100px")
    })

    it('should be able to retrieve normalized margin and padding when set in the css', function(){
        expect(testee.compute('margin')).to.be("0px 0px 0px 0px")
        expect(testee.compute('padding')).to.be("10px 10px 10px 10px")
    })

    it('should be able to retrieve normalized margin and padding when not set in css', function(){
        expect(test.compute('margin')).to.be("0px 0px 0px 0px")
        expect(test.compute('padding')).to.be("0px 0px 0px 0px")
    })

    it('should get the opacity defined by the CSS', function(){
        expect(test.compute('opacity')).to.be("0.5")
    })

    it('should set/overwrite the opacity', function(){
        expect(test.compute('opacity')).to.be("0.5")
        test.style('opacity', 1)
        expect(test.compute('opacity')).to.be("1")
        test.style('opacity', null)
        expect(test.compute('opacity')).to.be("0.5")
    })

    it('should return the opacity of an Element without seting it before', function(){
        var div = document.createElement('div')
        document.body.appendChild(div)
        div.style.opacity == null ? div.style.filter = 'alpha(opacity=40)' : div.style.opacity = "0.4"
        var opacity = moofx(div).compute('opacity')
        expect(opacity >= 0.4 && opacity < 0.4001).to.be(true) //niiiiice
        document.body.removeChild(div)
    })

})
