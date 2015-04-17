var Mongodb = require('mongodb');
var Mongo = Mongodb.MongoClient;

module.exports = {
	/**
	 * initDB() initial a db connection
	 * @param {Function} cb
	 */
	initDB : function (cb) {
		Mongo.connect('mongodb://localhost:27017/as', function (err, db) {
			cb(db)
		});
	}
};
