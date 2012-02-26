describe('requestFrame/cancelFrame', function (){

	it('should get the same time argument', function(done){
		
		var time = null
		var length = 0
	
		var next = function(now){
			length++
			if (time == null) time = now
			if (time != now) isSuccess = false
			if (length == 4) done()
		}
	
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
	})
	
	it('should cancel the requestFrame(s)', function(done){
		
		var isSuccess = true
			
		var next = function(){
			isSuccess = false
		}
			
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		
		moofx.cancelFrame(next)
		moofx.cancelFrame(next)
		moofx.cancelFrame(next)
		moofx.cancelFrame(next)
		
		setTimeout(function(){
			expect(isSuccess).to.be(true)
			done()
		}, 500)

	})
	
})
