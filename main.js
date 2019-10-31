var config = require("./config.json");
var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('public'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post("/api/register", (req, res) =>
{
  register(req.body.source, req.body.target);
  //res.sendStatus(200); //why doesnt this work with jq post?
  res.status(200).send({ success: true });
})

app.post("/api/unregister", (req, res) =>
{
  unregister(req.body.source, req.body.target);
  //res.sendStatus(200);
  res.status(200).send({ success: true });
})

app.post("/api/routes", (req, res) =>
{
  res.json(config.routes);
})

app.listen(config.uiPort, () => console.log(`Example app listening on port ${config.uiPort}!`))

var proxy = require('redbird')({port: config.proxyPort});

for(var route of config.routes)
{
  proxy.register(route.source, route.target);
}

function register(source, target)
{
  console.log("register", source, target)
  proxy.register(source, target)
  config.routes.push({source, target})
  sortRoutes();
  save();
}

function unregister(source, target)
{
  console.log("unregister", source, target)
  proxy.unregister(source, target)
  for(var i = 0; i < config.routes.length; i++)
  {
    var r = config.routes[i];
    if(r.source == source && r.target == target)
    {
      config.routes.splice(i, 1);
      break;
    }
  }
  sortRoutes();
  save();
}

function sortRoutes()
{
  config.routes.sort((a, b) =>
  {
    var sourceCompare = a.source.localeCompare(b.source);
    if(sourceCompare != 0)
    {
      return sourceCompare;
    }
    return a.target.localeCompare(b.target);
  });
}

function save()
{
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
}

// OPTIONAL: Setup your proxy but disable the X-Forwarded-For header
//var proxy = require('redbird')({port: 8080, xfwd: false});
