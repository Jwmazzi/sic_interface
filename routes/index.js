var express = require('express');
var path    = require('path');
var pg      = require('pg');
var router  = express.Router();

// Get Home Page
router.get('/', function(req, res, next) {
  res.sendFile('/index.html', {root: path.join(__dirname, '../views')});
});

// Post Data to PostgreSQL
router.post('/insert', (req, res, next) => {

	var req_data = req.body['sql[]'];

	if (req_data == undefined) {
		return res.json({message: 'Server Received Empty Request'});

	} else {
		var conn_string = 'postgres://postgres:postgres@localhost:5432/sic_interface';
		pg.connect(conn_string, (err, client, done) => {

			if (err) {
				done();
				return res.status(500).json({message: 'API Could Not Complete Request'});
			}

			for (i = 0; i < req_data.length; i++) {
				client.query(req_data[i], (err, res) => {
					if (err) {
						console.log('Insertion Failed');
						console.log(err);

					} else {
						console.log('Insertion Successful');
					}
				});
			}
		});

		return res.json({message: 'Response Inserted Into Database'});
	}
});


router.get('/subject', (req, res, next) => {

	var conn_string = 'postgres://postgres:postgres@localhost:5432/sic_base';

	pg.connect(conn_string, (err, client, done)=> {

		client.query('select max(subject)+1 as id from t1_circles', (err, r)=> {
			
			return res.json({message: r.rows[0].id});
		});

		done();

	});

});


module.exports = router;