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
  data.mustache = fs.readFileSync("./script/mustache.min.js", "utf8");
  var input = fs.readFileSync("./script/templateLoader.js.mustache", "utf8");
  var output = Mustache.render(input, data).replace(/\r/g, "");
  fs.writeFileSync("./script/templateLoader.js", output, "utf8");
});

task('menu.js', ['templateLoader.js'], function(){
  var templateLoader = fs.readFileSync("./script/templateLoader.js", "utf8");
  var menu_base = fs.readFileSync("./script/menu-base.js", "utf8");
  var output = (templateLoader+menu_base).replace(/\r/g, "");
  fs.writeFileSync("./script/menu.js", output, "utf8");
});

task('menu.min.js', ['menu.js'], function(){
  var child = exec("uglifyjs --unsafe --lift-vars -o ./script/menu.min.js  ./script/menu.js",
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

task('default', ['menu.min.js', 'main.min.css'], function(){
  console.log("Finished building");
});
