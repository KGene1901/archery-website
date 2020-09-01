/* eslint-disable no-delete-var */
const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const app = express();
// eslint-disable-next-line no-unused-vars
const path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('client'));

/////////////////////////////////////////
//     POST request for images         //    
////////////////////////////////////////

let tagWord;
app.post('/imgUpload', (req, res) => {
  let fields = []
  try{
    new formidable.IncomingForm().parse(req)
      .on('field', (name, field) => {
        fields.push(field); // adding all values of the submitted form fields to a list
      })
      .on('fileBegin', (name, file) => {
          file.path = __dirname + '/client/uploads/' + file.name  // adding uploaded image to defined path
      })
      .on('file', (name, file) => {
        fs.readFile('./client/images.json', 'utf8', function readFileCallback(err, data){ // opening JSON file to add image name with path to allow easier link for the client to access instead of sending the actual image file to the client
          if (err){
              console.log(err);
          } else {
            const obj = JSON.parse(data); //now it's an object
            switch(fields[2]){  // specifies the category the uploaded image falls in
              case "event":
                tagWord = 'event';
              break;
              case "eq":
                tagWord = 'eq';
              break;
              case "training":
                tagWord = 'training';
            }

            obj.push({'url': './uploads/'+file.name, 'title': fields[0], 'desc': fields[1], 'tag': tagWord}); //add some data
            let json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('./client/images.json', json, 'utf8', function(){console.log("Data updated")}); // write it back 
          }});
        console.log('Uploaded image:', file.name);
      })

      .on('aborted', () => {
        console.error('Request aborted by the user')
      })

      .on('error', (err) => {
        console.error('Error', err)
        throw err
      })
      .on('end', () => {
        res.sendStatus(200);
        res.end()
      })

  } catch(e){
    console.log('Failed to execute Formidable method with error: ' + e);
  }
    
})

/////////////////////////////////////////
//           End of request            //    
////////////////////////////////////////


//////////////////////////////////////////////////////////
//       GET request for images from 'images.json'      //
/////////////////////////////////////////////////////////

app.get('/imgdir', function(req, res){
  try{
    fs.readFile('./client/images.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("File read failed:", err)
          return 
      }
      try {
        const imgs = JSON.parse(jsonString)
        res.send(imgs); // sends JSON containing all image names and paths stored in the server to the client to be retrieved and displayed
      } catch(err) {
        console.log('Error parsing JSON string:', err)
      } 
    })
  } catch(e){
    console.log('Failed to execute method with error: ' + e);
  }

});

//////////////////////////////////////////////////////////
//                  End of request                      //
/////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
//       GET request for events based on search query         //    
///////////////////////////////////////////////////////////////

app.get("/search", function (request, response){
  var matching = [];
  const keyword = request.query.keyword;
  const time = request.query.time;
  const loc = request.query.loc;
  const sysDate = Date.parse(new Date(Date.now()).toLocaleString().split(',')[0].split("/").reverse().join("-")); // translates the user's system data (real-time) to the number of milliseconds since January 1, 1970, 00:00:00 UTC (standardizes format for easy comparison)
  
  function dateCompare(time, idate, sysDate, ele){  // logic to filter out events that match the given specifications
    if(time=='past' && idate<=sysDate){
      matching.push(ele);
    }else if(time=='upc' && idate>=sysDate){
      matching.push(ele)
    }else if(time=='null'){
      matching.push(ele);
    }
  }

  fs.readFile('./client/events.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return null;
    }

    try {
      const events = JSON.parse(jsonString);
      for(var i of events){
        var idate = Date.parse(i['date'].split("/").reverse().join("-"));
        
        if(i['title'].toLowerCase().startsWith(keyword.toLowerCase())){ // sets everything to lower case for ease of comparison and removes human error

            if(loc=='loc' && i['country']=='UK'){
              dateCompare(time, idate, sysDate, i)
            }else if(loc=='int' && i['country']!='UK'){
              dateCompare(time, idate, sysDate, i)
            }else if(loc=='null'){
              dateCompare(time, idate, sysDate, i)
            }

      }}
        
      if (matching.length == 0){
        response.send('No events found with given input. Please try again.')
      }else{
      response.send(matching);
      }
    } catch(err) {
      console.log('Error parsing JSON string:', err)
    } 
  })
});

///////////////////////////////////////////////////////////////
//                      End of request                       //    
//////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
//       GET request for scores from "scoredata.json"         //    
///////////////////////////////////////////////////////////////

app.get("/scoreData", function(req,response){
  fs.readFile('./client/scoredata.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return 
    }
    try {
      const scores = JSON.parse(jsonString)
      response.send(scores);
    } catch(err) {
      console.log('Error parsing JSON string:', err)
    } 
}) 
});

////////////////////////////////////////////////////////////////
//                    End of request                          //    
///////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////
//     POST request for newly uploaded score by user   //
////////////////////////////////////////////////////////

app.post("/newScoreData", function (request, response){

  try{
    fs.readFile('./client/scoredata.json', 'utf8', (err, data) => {
      if (err){
          console.log('File cannot be read');
      } else {
        const obj = JSON.parse(data); //now its an object
        obj.push(request.body); //add some data
        // eslint-disable-next-line no-unused-vars
        let json = JSON.stringify(obj); //convert it back to json
        fs.writeFile('./client/scoredata.json', json, 'utf8', function(){return}); // write it back 
      }});

      response.sendStatus(200);

  } catch(e){
    console.log(e);
  }    
});

/////////////////////////////////////////////////////////
//                  End of request                     //
////////////////////////////////////////////////////////


///////////////////////////////////////////////////////
//           GET request for queries                 //
//////////////////////////////////////////////////////

app.get("/customerquery", function(req,response){
  fs.readFile('./client/queries.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return 
    }
    try {
      const query = JSON.parse(jsonString)
      response.send(query);
    } catch(err) {
      console.log('Error parsing JSON string:', err)
    } 
}) 
});

///////////////////////////////////////////////////////
//                 End of request                    //
//////////////////////////////////////////////////////


///////////////////////////////////////////////////////
//          POST request for new queries             //
//////////////////////////////////////////////////////

app.post("/newUserQuery", function (request, response){
  if(request.body.name.trim()=='' || request.body.email.trim()=='' || request.body.subject.trim()=='' || request.body.msg.trim()=='' ){
    response.send('Error: Missing required field info');
  }else{
    try{
      fs.readFile('./client/queries.json', 'utf8', function readFileCallback(err, info){
        if (err){
            console.log('File cannot be read');
        } else {
          const q = JSON.parse(info);
          q.push(request.body); 
          // eslint-disable-next-line no-unused-vars
          let json = JSON.stringify(q); 
          fs.writeFile('./client/queries.json', json, 'utf8', function(){return}); // write it back 
        }});

      response.sendStatus(200);
    } catch(e){
      console.log(e);
    }
  }  
});


///////////////////////////////////////////////////////
//                 End of request                    //
//////////////////////////////////////////////////////

module.exports = app;