const http = require('http');
const fs = require("fs");
		

let items = [					
	{name: "test"}
]
function send404(response){
	response.statusCode = 404;
	response.write("Unknown resource.");
	response.end();
}

function send500(response){
	response.statusCode = 500;
	response.write("Server error.");
	response.end();
}

const server = http.createServer(function (request, response) {
	console.log(request.url);
	if(request.method === "GET"){
		if(request.url === "/" {
			fs.readFile("todo.html", function(err, data){
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/html");
				response.write("Get Request");
				response.end();
			});
		}else if(request.url === "/list"){
			fs.readFile("todo.js", function(err, data) {
				if (err) {
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "application/javascript");
				response.write(data);
				response.end();
			});
		
		}else{
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}else if(request.method === "POST"){
		if(request.url === "/list"){
			let body = "";
			request.on('data', (chunk) => {
				body += chunk;
			})
			request.on('end', () => {
				let newItem = JSON.parse(body);
				if(newItem.hasOwnProperty("itemname")){
					items.push(newItem);
					response.statusCode = 201;
					response.write(String(newItem.name));
					response.end();
					return;
				}else{
					send404(response);
					alert("Try again!");
				}
			})
		}else{
			send404(response);
			alert("Try again!");
		}
	}
});

server.listen(3000);
console.log('Server running at Github.com!');
