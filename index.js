const serverless = require('serverless-http');
const express = require('express')
const { v4: uuidv4 } = require('uuid');

const app = express()

app.use(express.json());
// app.use((req, res, next) => {
// 	// control which client servers have access
// 	res.header('Access-Control-Allow-Origin', '*');
// 	//  control which headers have access to the API
// 	res.header(
// 		'Access-Control-Allow-Headers',
// 		'Origin, X-Requested-With, Content-Type, Accept, Authorisation'
// 	);
// 	// method is a property that gives us access to the http method used on request
// 	// add all the request keywords we want to support with the API
// 	if (req.method === 'OPTIONS') {
// 		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
// 		return res.status(200).json({});
// 	}
// 	// need to call next() so that the other routes can take over.
// 	next();
// });

const AWS = require('aws-sdk');

// const IS_OFFLINE = process.env.IS_OFFLINE;
// let dynamoDb;
// if (IS_OFFLINE === 'true') {
// 	dynamoDb = new AWS.DynamoDB.DocumentClient({
// 		region: 'localhost',
// 		endpoint: 'http://localhost:8000'
// 	})
// 	console.log(dynamoDb);
// } else {
// 	dynamoDb = new AWS.DynamoDB.DocumentClient();
// };

const FILMS_TABLE = process.env.FILMS_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient();

var table = 'film-test'

app.post('/add-film', async (req,res) => {
  var body = req.body
  var film = {
    "id": uuidv4(),
    "title": body.title,
    "director": body.director,
      "year": body.year,
      "rating": body.rating
  }
  var params = {
      TableName:table,
      Item: film
  };
  console.log("Adding a new item...");
  const data = await docClient.put(params).promise();
  res.send(data);
});

app.post('/films', async (req,res) => {
  var body = req.body
  var film = {
    "id": body.id
  }
  var params = {
      TableName:table,
      Key: film
  };
  console.log("Selecting film...");
  const data = await docClient.get(params).promise();
  res.send(data)
});


//  might need to define the inputs for film update check with jamie
// check how we make this process dynamic
app.post('/update-film', async (req,res) => {
  var body = req.body
  var film = {
    "id": body.id,
  }
  var params = {
    TableName:table,
    Key: film,
    // UpdateExpression: "set title = :t, director=:d, #year=:y, rating=:r",
    ExpressionAttributeValues:{
    //     ":t":body.title,
    //     ":d":body.director,
    //     ":y":body.year,
    //     ":r":body.rating
  },
  ReturnValues:"UPDATED_NEW"
	};
	var UpdateExpression = "set "
	if (body.title) {
		UpdateExpression += "title = :t, "
		params["ExpressionAttributeValues"][":t"] = body.title
	}
	if (body.director) {
		UpdateExpression += "director = :d, "
		params["ExpressionAttributeValues"][":d"] = body.director
	}
	if (body.year) {
		UpdateExpression += "#year = :y, "
		params["ExpressionAttributeValues"][":y"] = body.year
		params["ExpressionAttributeNames"] = {}
		params['ExpressionAttributeNames']["#year"] = 'year'
	}
	if (body.rating) {
		UpdateExpression += "rating = :r, "
		params["ExpressionAttributeValues"][":r"] = body.rating
	}
	params["UpdateExpression"] = UpdateExpression.substring(0, UpdateExpression.length-2)
  console.log("Updating the item...", params);
  const data = await docClient.update(params).promise();
  res.send(data)
});

app.put('/delete-film', async (req,res) => {
	var body = req.body
  var film = {
    "id": body.id,
  }
	var params = {
      TableName:table,
      Key: film
  };
  console.log("Attempting a conditional delete...");
	const data = await docClient.delete(params).promise();
  res.send(data)
});

// PORT TO LISTEN ON
// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Listening on port ${port}...`));


module.exports.handler = serverless(app);
