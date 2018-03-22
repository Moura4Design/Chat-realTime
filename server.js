const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const sqlite = require("sqlite");
const request = require('request');

let db = null;

app.use(express.static('app'));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/home.html'));
});

app.post('/contact', (req, res) => {
	if (
		req.body.captcha === undefined ||
		req.body.captcha === '' ||
		req.body.captcha === null
	) {
		return res.json({'success': false, 'message':'select captcha'});
	

	}

	//secret key
	const secretKey = '6LeIfEsUAAAAAKywsCctSEua2NT4lp4jAgesomgd';

  request.post('https://www.google.com/recaptcha/api/siteverify')

	//verify
	const verify = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

	//make request to verify
	request(verify, (err, response, body) => {
		body = JSON.parse(body);
		console.log(body);

		//if not success
		if(body.success !== undefined && !body.success) {
			return res.json({'success': false, 'message':'Failed'});	
		}

		//if is success
		return res.json({'success': true, 'message':'Success'});
	});

});

users = [];
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('setUsername', function(data) {
      console.log(data);
      
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data);
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      }
   });
   
   socket.on('msg', function(data) {
      //Send message to everyone
      io.sockets.emit('newmsg', data);
   })
});

app.get('/', async (req, res) => {
	const today_visits = await db.get("SELECT COUNT(*) AS num_visitors_today FROM visitors WHERE visit_date = DATE('now')");
  const num_visitors_today = today_visits.num_visitors_today;

  const visitors = g_db.all("SELECT * FROM visitors ORDER BY id DESC");

  res.render('feedb', {
  	num_visitors_today,
  	visitors
  });
});

app.post("/", async (req, res) => {

  db.run("INSERT INTO visitors ( feedback, visit_date ) VALUES ( $feedback, DATE('now') )", {
    $feedback: req.body.feedback
  });

  res.redirect("/");
});

sqlite.open("./forum.sqlite")
  .then(db => {
    http.listen(9080, () => {
      console.log("running");
    });
  });




