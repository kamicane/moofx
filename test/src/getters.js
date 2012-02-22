describe('getters', function (){
	
	var test, testee;

	it('should get and normalize styles', function(){
		testee = document.getElementById('testee')
		test = document.getElementById('test')
		
		//get
		expect(getter('width').call(testee)).toBe("100px")
		
		//change the value for good measure
		setter('width').call(testee, '10%')
		expect(getter('width').call(testee)).toBe("10px")
		
		//auto
		setter('height').call(testee, 'auto')
		expect(getter('height').call(testee)).toBe(testee.clientHeight - 20 + 'px') //clientHeight + paddings
		
		//more random getters/normalizers
		expect(getter('backgroundColor').call(testee)).toBe("rgba(0,0,0,1)")
		expect(getter('borderTopStyle').call(testee)).toBe("dotted")
		expect(getter('borderStyle').call(testee)).toBe("dotted dotted dotted dotted")
		expect(getter('borderColor').call(testee)).toBe("rgba(255,0,0,1) rgba(255,0,0,1) rgba(255,0,0,1) rgba(255,0,0,1)")
		expect(getter('border').call(testee)).toBe("2px dotted rgba(255,0,0,1)")
		expect(getter('visibility').call(testee)).toBe("visible")
		expect(getter('position').call(test)).toBe("absolute")
		expect(getter('top').call(test)).toBe("-1000px")
		expect(getter('left').call(test)).toBe("-1000px")
		
		//border normalizers
		setter('border').call(testee, "0px none transparent")
		expect(getter('border').call(testee)).toBe("0px none rgba(0,0,0,0)")
	})
	
	it('should reset to default css', function(){
		setter('width').call(testee, '')
		expect(getter('width').call(testee)).toBe("100px")
		setter('width').call(testee, null)
		expect(getter('width').call(testee)).toBe("100px")
		setter('width').call(testee)
		expect(getter('width').call(testee)).toBe("100px")
	})
	
	it('should be able to retrieve normalized margin and padding when set in the css', function(){
		expect(getter('margin').call(testee)).toBe("0px 0px 0px 0px")
		expect(getter('padding').call(testee)).toBe("10px 10px 10px 10px")
	})
	
	it('should be able to retrieve normalized margin and padding when not set in css', function(){
		expect(getter('margin').call(test)).toBe("0px 0px 0px 0px")
		expect(getter('padding').call(test)).toBe("0px 0px 0px 0px")
	})
	
	it('should get the opacity defined by the CSS', function(){
		expect(getter('opacity').call(test)).toBe("0.5");
	})
	
	it('should set/overwrite the opacity', function(){
		setter('opacity').call(test, 1)
		expect(getter('opacity').call(test)).toBe("1")
		setter('opacity').call(test, null)
		expect(getter('opacity').call(test)).toBe("0.5")
	})
	
	it('should return the opacity of an Element without seting it before', function(){
		var div = document.createElement('div')
		document.body.appendChild(div)
		div.style.opacity = "0.4"
		div.style.filter = 'alpha(opacity=40)'
		expect(getter('opacity').call(div)).toBe("0.4");
		document.body.removeChild(div)
	})

	it('should not remove existent filters on browsers with filters', function(){
		var div = document.createElement('div')
		document.body.appendChild(div)
		div.style.filter = 'blur(strength=50)'
		setter('opacity').call(div, "0.4")
		expect(div.style.filter || 'blur(strength=50)').toMatch(/blur\(strength=50\)/i)
		document.body.removeChild(div)
	})

})
