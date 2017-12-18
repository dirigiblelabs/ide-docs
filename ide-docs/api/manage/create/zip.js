/* globals $ */
/* eslint-env node, dirigible */

var request = require("http/v3/request");
var response = require("http/v3/response");
var upload = require('http/v3/upload');
var requestHandler = require("docs-explorer/api/lib/request-handler");
var zipLib = require("docs-explorer/api/lib/zip");

requestHandler.handleRequest({
	handlers : {
		POST: handlePost
	}
});

function handlePost(){
	if (upload.isMultipartContent()) {
		var path = request.getParameter('path');
		if (path) { path = unescapePath(path); }
		var documents = upload.parseRequest();
		var result = [];
		for (var i = 0; i < documents.size(); i ++){
			result.push(zipLib.unpackZip(path, documents.get(i)));
		}
	} else {
		printError(response.BAD_REQUEST, 4, "The request's content must be 'multipart'");
	}
	
	response.println(JSON.stringify(result));
}

function unescapePath(path){
	return path.replace(/\\/g, '');
}


function printError(httpCode, errCode, errMessage, errContext) {
    var body = {'err': {'code': errCode, 'message': errMessage}};
    response.setStatus(httpCode);
    response.setHeader("Content-Type", "application/json");
    response.print(JSON.stringify(body));
    console.error(JSON.stringify(body));
    if (errContext) {
    	console.error(JSON.stringify(errContext));
    }
}
