var spawn = require("child_process").spawn
var version = require(__dirname+"/../../package.json").version;
var split = version.split('.');
var wild = '';
for(var i=0; i<split.length-1; i++){
  wild+=split[i]+'.';
}
wild+="x";
spawn("git", ["tag", "v"+version]);
spawn("git", ["tag", "v"+wild]);
