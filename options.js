var basicURL = "http://www.havenandhearth.com/mt/r/gfx/invobjs/";

var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19;
var offy = 164;

var modx = 1/11*zoomx;
var mody = 1/11*zoomy;

var table = document.getElementById("data");
var map = document.getElementById('mapSVG');
var opts = { theme : "light", debug : false }
	
var aBonuses = [
	"agi",
	"csm",
	"con",
	"dex",
	"int",
	"prc",
	"psy",
	"str",
	"wil",
	"carpentry",
	"cooking",
	"explore",
	"farming",
	"lore",
	"masonry",
	"melee",
	"ranged",
	"sewing",
	"smithing",
	"stealth",
	"survive",
	"unarmed"
]

var ItemReferenceList = { 
	"Common Metal" : [
		"bar-tin",
		"bar-castiron",
		"bar-wroughtiron",
		"bar-steel",
		"bar-bronze",
		"bar-copper",
		"nugget-tin",
		"nugget-castiron",
		"nugget-wroughtiron",
		"nugget-steel",
		"nugget-bronze",
		"nugget-copper"
	],

	"Hard Metal" : [
		"bar-castiron",
		"bar-wroughtiron",
		"bar-steel",
		"bar-bronze",
		"nugget-castiron",
		"nugget-wroughtiron",
		"nugget-steel",
		"nugget-bronze"
	],

	"Cloth" : [
		"hempcloth",
		"linencloth",
		"silkcloth",
		"leatherfabric",
		"woolcloth",
		"mohair"
	],

	"String" : [
		"herbs/cattailfibre",
		"flaxfibre",
		"hempfibre",
		"hidestrap",
		"silkthread",
		"herbs/spindlytaproot",
		"strawstring",
		"yarn-goat",
		"yarn-sheep",
		"herbs/stingingnettle"
	],

	"Fine bones" : [
		"beartooth",
		"boartusk",
		"borewormbeak",
		"crabshell",
		"flipperbone",
		"lynxclaws",
		"small/mammothtusk",
		"small/antlers-moose",
		"antlers-reddeer",
		"small/walrustusk",
		"small/wildgoathorn",
		"wishbone",
	],

	"Fine Clay" : [
		"clay-cave",
		"clay-pit"
	],

	"Flower" : [
		"herbs/bloodstern",
		"herbs/cavebulb",
		"herbs/chimingbluebell",
		"herbs/clover",
		"herbs/dandelion",
		"herbs/edelweiss",
		"herbs/frogscrown",
		"flower-poppy",
		"herbs/stingingnettle",
		"small/thornythistle",
		"small/snapdragon"
	],

	"Stone" : [
		"basalt",
		"catgold",
		"cinnabar",
		"dolomite",
		"feldspar",
		"flint",
		"gneiss",
		"granite",
		"hornblende",
		"limestone",
		"marble",
		"porphyry",
		"quartz",
		"sandstone",
		"schist",
		"cassiterite",
		"chalcopyrite",
		"malachite",
		"ilmenite",
		"limonite",
		"hematite",
		"magnetite",
		"galena",
		"argentite",
		"hornsilver",
		"petzite",
		"sylvanite",
		"nagyagite",
		"slag",
		"rockcrystal"
	],

	"Ore" : [
		"cassiterite",
		"chalcopyrite",
		"malachite",
		"ilmenite",
		"limonite",
		"hematite",
		"magnetite",
		"galena",
		"argentite",
		"hornsilver",
		"petzite",
		"sylvanite",
		"nagyagite",
		"slag"
	],
}