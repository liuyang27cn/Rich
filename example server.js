var port = 8000;
var serverUrl = "127.0.0.1";
var defaultHomePage = '/index.html';

var http = require("http");
var path = require("path"); 
var fs = require("fs"); 		
var url = require('url');
var qs = require('querystring');
var stripe = require('stripe')("sk_test_BQokikJOvBiI2HlWgH4olfQ2");
 
http.createServer( function(req, res) {

	preprocessedRequestData = preRequestHandler(req);
	if (req.method == 'POST') {
		postRequestHandler(req, res, preprocessedRequestData);
    }else{
    	getRequestHandler(req, res, preprocessedRequestData);
    }
 
}).listen(port, serverUrl);
 
function getFile(localPath, res, mimeType) {
	fs.readFile(localPath, function(err, contents) {
		if(!err) {
			res.setHeader("Content-Length", contents.length);
			res.setHeader("Content-Type", mimeType);
			res.statusCode = 200;
			res.end(contents);
		} else {
			res.writeHead(500);
			res.end();
		}
	});
}

console.log("Starting web server at " + serverUrl + ":" + port);

var preRequestHandler = function(req){
	var requestUrl = req.url;
	var filename = requestUrl == "/"? defaultHomePage : requestUrl;
	var mainpathIndex = filename.indexOf('?')
	if( mainpathIndex > 0){
		filename = filename.substr(0, mainpathIndex);
	}
	
	return data = {
					'filename': filename
				};
}

var postRequestHandler = function(req, res, preprocessedRequestData){
	var body = '';
	req.on('data', function (data) {
		body += data;
		// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
		if (body.length > 1e6) { 
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			request.connection.destroy();
		}
	});
	req.on('end', function () {
		var filename = preprocessedRequestData.filename;
		var basename = path.basename(filename);
		var postData = qs.parse(body);

		var stripeToken = postData.stripeToken;
		var chargeAmount = postData.amount * 100; // amount in cents
		var email = postData.email;
		debugger;
		var charge = stripe.charges.create({
		  amount: chargeAmount,
		  currency: "usd",
		  card: stripeToken,
		  description: email
		}, function(err, charge) {
		  if (err && err.type === 'StripeCardError') {
			console.log('The card has been declined');
			debugger;
		  }else{
		  	console.log('The card has chanrged');
		  	debugger;
		  }
		});
		
		preprocessedRequestData.filename = defaultHomePage;
		getRequestHandler(req, res, preprocessedRequestData);
	});
};

var getRequestHandler = function(req, res, preprocessedRequestData){
	var filename = preprocessedRequestData.filename;
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var ext = path.extname(filename);	
	var localPath = __dirname;
	var validExtensions = {
		".html" : "text/html",			
		".js": "application/javascript", 
		".css": "text/css",
		".txt": "text/plain",
		".jpg": "image/jpeg",
		".gif": "image/gif",
		".ico": "image/ico",
		".png": "image/png"
	};
	var isValidExt = validExtensions[ext];
	if (isValidExt) {
		
		localPath += filename;
		fs.exists(localPath, function(exists) {
			if(exists) {
				console.log("Serving file: " + localPath);
				getFile(localPath, res, isValidExt);
			} else {
				console.log("File not found: " + localPath);
				res.writeHead(404);
				res.end();
			}
		});
 
	} else {
		console.log("Invalid file extension detected: " + ext + "\nfilename: " + filename)
	}
};

// var http = require('http');
// http.createServer(function (req, res) {
// 	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
//   	res.end('Hello 小兔兔\n');
// 	response.end(); 
// }).listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');
// 
// var http = require('http');
// var fs = require('fs');
// 
// http.createServer(function(req, res){
//     fs.readFile('./index.html',function (err, data){
//         res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
//         res.write(data);
//         res.end();
//     });
// }).listen(8000);