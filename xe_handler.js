var request = require('request');
var _ = require('./util');

module.exports = function()
{
	var Cfg ={
		success_delay: 4,
		error_delay: 3,
		success_times: 10,
		error_times: 3
	}
	
    function xeHandler()
    {
        this.type = 'xe';
		this.sCnt = 0;
		this.eCnt = 0;
    }

    xeHandler.prototype.work = function(payload, callback)
    {
	
		function handleErr(err){
			console.log(err)
			Handler.eCnt ++;
			if(Handler.eCnt == Cfg.error_times)
				process.exit(0);
			callback('release', Cfg.error_delay);
		}
	
		//request(opt, function (error, response, body) {
		var doc ={rate:'0.6'};
		
		_.initDB(function(db){
			var o = {
					"from": payload.from,
					"to": payload.to,
					"created_at": new Date(),
					"rate": doc.rate
				};
			if (db) {
				db.collection('rate').save(o, function(err){
					if(err) {
						handleErr(err);
					} else {
						Handler.eCnt = 0;
						Handler.sCnt ++;
						console.log('insert:'+Handler.sCnt);
						if(Handler.sCnt == Cfg.success_times)
							process.exit(0);
						callback('release', Cfg.success_delay);
					}
				})
			} else {
				handleErr('db is not ready!');
			}
		})
		//});
    }

    var Handler = new xeHandler();
    return Handler;
};