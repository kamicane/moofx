describe('requestFrame/cancelFrame', function (){

	it('should get the same time argument', function(){
		
		var time = null
		var isSuccess = true
		length = 0
	
		var next = function(now){
			length++
			if (time == null) time = now
			if (time != now) isSuccess = false
		}
	
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
		moofx.requestFrame(next)
			
		waits(100)
			
		runs(function(){
			expect(isSuccess).toBe(true)
			expect(length).toBe(4)
		})
	})
	
	it('should cancel the requestFrame(s)', function(){
		
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
			
		waits(100)
			
		runs(function(){
			expect(isSuccess).toBe(true)
		})
	})
	
})
