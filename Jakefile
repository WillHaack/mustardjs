var Mustache = require("./script/mustache.min.js");
var fs = require("fs");
var exec = require("child_process").exec;
task('templateLoader.js', function(){
  var spaces = /\r\n\s*/g;
  var data = {};
  var menu = fs.readFileSync("./templates/menu.html.mustache", "utf8");
  data.menu = menu.replace(spaces, "").replace(/"/g, "\\\"");
  var dialog = fs.readFileSync("./templates/dialog.html.mustache", "utf8");
  data.dialog = dialog.replace(spaces, "").replace(/"/g, "\\\"");
  var trayItem = fs.readFileSync("./templates/trayItem.html.mustache", "utf8");
  data.trayItem = trayItem.replace(spaces, "").replace(/"/g, "\\\"");
  var restaurants = fs.readFileSync("./templates/restaurants.html.mustache", "utf8");
  data.restaurants = restaurants.replace(spaces, "").replace(/"/g, "\\\"");
  data.mustache = fs.readFileSync("./script/mustache.min.js", "utf8");
  var input = fs.readFileSync("./script/templateLoader.js.mustache", "utf8");
  var output = Mustache.render(input, data).replace(/\r/g, "");
  fs.writeFileSync("./script/templateLoader.js", output, "utf8");
});

task('mustard.js', ['templateLoader.js'], function(){
  var api = fs.readFileSync("./script/api.js", "utf8");
  var templateLoader = fs.readFileSync("./script/templateLoader.js", "utf8");
  var mustard_base = fs.readFileSync("./script/mustard-base.js", "utf8");
  var output = (api+templateLoader+mustard_base).replace(/\r/g, "");
  fs.writeFileSync("./script/mustard.js", output, "utf8");
});

task('mustard.min.js', ['mustard.js'], function(){
  var child = exec("uglifyjs --unsafe --lift-vars -o ./script/mustard.min.js  ./script/mustard.js",
                   function(error, stdout, stderr){
                     if(error !== null){
                       console.log('error: ' + error);
                     }
                   });
});

task('main.min.css', function(){
  var child = exec("cleancss -o ./style/main.min.css ./style/main.css",
                   function(error, stdout, stderr){
                     if(error !== null){
                       console.log('error: ' + error);
                     }
                   });
});

task('default', ['mustard.min.js', 'main.min.css'], function(){
  console.log("Finished building");
});
