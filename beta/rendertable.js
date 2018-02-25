var displayData = [];
document.onLoad = main();


function formatVal(val, format) {
	if( !format ) return val;
	switch ( format ) {
		case "sign" : 
			return val > 0 ? "+" + val : val ;
			break;
		case "d2pr" : 
			return Math.round(val*10000)/100 + "%";
			break;
		case "d2sd" :
			return Math.round(val*100)/100;
			break;
		case "h2hm" :
			var hrs = (val/60 < 10 ? "0" : "") + Math.floor(val/60);
			var mns = (val%60 < 10 ? "0" : "") + Math.round(val%60);
			return hrs + ":" + mns;
			break;
		default :
			return val;
	}	
}

function bakeUL(array) {
	if( array.length == 0) return;
	var result = document.createElement("ul");
	for(var k = 0; k < array.length; k++) {
		var li = document.createElement("li");
		li.innerHTML = array[k];
		result.appendChild(li);
	}
	return result
}

function bakeDL(array, propertyDT, propertyDD, valformat) {

	if( array.length == 0 ) return;
	var result = document.createElement("dl");
	for( var k in array ) {
		var dt = document.createElement("dt");
		dt.innerHTML = array[k][propertyDT] + ": ";
		var dd = document.createElement("dd");
		var val = array[k][propertyDD];
		dd.innerHTML = formatVal(val, valformat);
		result.appendChild(dt);
		result.appendChild(dd);
	}
	return result	
}

function bakeSingleNamedDL(title, val, valformat) {
	var result = document.createElement("dl");
	result.className = "single";
	var dt = document.createElement("dt");
	dt.innerHTML = title + ": ";
	var dd = document.createElement("dd");
	dd.innerHTML = formatVal(val, valformat);
	result.appendChild(dt);
	result.appendChild(dd);
	return result	
}

function parseDetails(details) {
	var result = document.createElement("div");
	for( var k1 in details ) {
		switch( k1 ) {
			case "fnrj":
				var list = bakeSingleNamedDL("Energy", details[k1], "d2pr");
				result.appendChild(list);
				break;
			case "fhng":
				var list = bakeSingleNamedDL("Hunger", details[k1], "d2pr");
				result.appendChild(list);
				break;
			case "armpen":
				var list = bakeSingleNamedDL("Armor ignore", details[k1], "d2pr");
				result.appendChild(list);
				break;
			case "weight":
				var list = bakeSingleNamedDL("Type", details[k1]);
				result.appendChild(list);
				break;
			case "damage":
				var list = bakeSingleNamedDL("Damage", details[k1]);
				result.appendChild(list);
				break;
			case "wear":
				var list = bakeSingleNamedDL("Wear", details[k1].d + "/" + details[k1].m);
				result.appendChild(list);
				break;
			case "armor":
				var list = bakeSingleNamedDL("Armor class", details[k1].hard + "/" + details[k1].soft);
				result.appendChild(list);
				break;
			case "hmod":
				var list = bakeSingleNamedDL("Hunger mod", details[k1], "d2pr");
				result.appendChild(list);
				break;
			case "fmod":
				var list = bakeSingleNamedDL("FEP mod", details[k1], "d2pr");
				result.appendChild(list);
				break;
			case "fep":
				var header = document.createElement("h4");
				header.innerHTML = "FEP";
				var list = bakeDL(details[k1], "atr", "mod", "d2sd");
				result.appendChild(header);
				result.appendChild(list);
				break;
			case "madeof":
				var header = document.createElement("h4");
				header.innerHTML = "Made of";
				var list = bakeDL(details[k1], "ing", "frc", "d2pr");
				result.appendChild(header);
				result.appendChild(list);
				break;
			case "gildings":
				var header = document.createElement("h4");
				header.innerHTML = "Gildings" + " (" + details[k1].gildn + ")";
				var list = bakeUL(details[k1].gilds);
				result.appendChild(header);
				result.appendChild(list);
				
				if (details[k1].gildm) {
					var modheader = document.createElement("h4");
					modheader.innerHTML = "Gildings' bonuses";
					var modlist = bakeDL(details[k1].gildm, "atr", "mod", "sign");	
					result.appendChild(modheader);
					result.appendChild(modlist);
				}
				break;
			case "atrm":
				var header = document.createElement("h4");
				header.innerHTML = "Attribute mods";
				var list = bakeDL(details[k1], "atr", "mod", "sign");
				result.appendChild(header);
				result.appendChild(list);
				break;
			case "gilding":
				var header = document.createElement("h4");
				header.innerHTML = "As gilding";
				var list = bakeDL(details[k1], "atr", "mod", "sign");
				result.appendChild(header);
				result.appendChild(list);
				break;
			case "curio":
				var header = document.createElement("h4");
				header.innerHTML = "As curiosity";
				var llp = bakeSingleNamedDL("LP", details[k1].lp);
				var lxp = bakeSingleNamedDL("XP", details[k1].xp);
				var lmw = bakeSingleNamedDL("Mental weight", details[k1].mw);
				var time = bakeSingleNamedDL("Time", details[k1].time, "h2hm");
				var lpperhr = bakeSingleNamedDL("LP/hr", details[k1].lp/(details[k1].time/60), "d2sd");
				result.appendChild(header);
				result.appendChild(llp);
				result.appendChild(lxp);
				result.appendChild(lmw);
				result.appendChild(time);
				result.appendChild(lpperhr);
				break;
			case "coinage":
				var list = bakeSingleNamedDL("Coinage", details[k1]);
				result.appendChild(list);
				break;
			case "vessel":
				var list = bakeSingleNamedDL("Inside of", details[k1].vesselName + " Q" + details[k1].vesselQ);
				result.appendChild(list);
				break;
			case "vesselQ":
				var list = bakeSingleNamedDL("", details[k1]);
				result.appendChild(list);
				break;

			default:
				var text = document.createElement("span");
				text.innerHTML = "Unknown detail type: " + k1;
				result.appendChild(text);
		} 
	}
	return result;
}

function resetSorted() {
	var tHead = table.getElementsByTagName('thead')[0];
	var headrow = tHead.rows[0].cells;
	for( var i = 0; i < headrow.length; i++) {
		headrow[i].className = headrow[i].className.replace("sorttable_sorted_reverse", "").replace("sorttable_sorted", "");
	}
}

function filterData(array) {
	var filterGoods	= document.getElementById("filterGoods").value;
	var filterInfo	= document.getElementById("filterInfo").value;
	var filterQmin	= parseInt(document.getElementById("filterQmin").value);
	var filterQmax	= parseInt(document.getElementById("filterQmax").value);
	var filterLmin = parseInt(document.getElementById("filterLmin").value);
	var filterLmax = parseInt(document.getElementById("filterLmax").value);

	var filterPrice = document.getElementById("filterPrice").value;
	var filterPQmin = parseInt(document.getElementById("filterPQmin").value);
	var filterPQmax = parseInt(document.getElementById("filterPQmax").value);
	var filterPAMTmin = parseInt(document.getElementById("filterPAMTmin").value);
	var filterPAMTmax = parseInt(document.getElementById("filterPAMTmax").value);

	var filterBonuses = document.getElementById("filterBonuses").value;
	var enableBonusSearch = false;
	if( filterBonuses.lastIndexOf(" ") !== -1 )
	{
		var filterBonusesAtr = filterBonuses.slice(0, filterBonuses.lastIndexOf(" "));
		var filterBonusesMod = parseInt(filterBonuses.slice(filterBonuses.lastIndexOf(" ")));
		if( filterBonusesAtr.length > 2 && !isNaN(filterBonusesMod) )
			enableBonusSearch = true;
	}

	for( var i = 0; i < array.length; i++) {
		array[i][13] = false; //unhide every single row
		var itemInfo = "";
		
		//filter by merch
		if( filterGoods.length > 0 ) {
			if( itemInfo == "") itemInfo = parseDetails(array[i][2]).innerHTML.replace(/<.*?>/g, " ");
			var itemName = array[i][1] + itemInfo;
			if( itemName.toUpperCase().indexOf(filterGoods.toUpperCase()) == -1 ) {
				array[i][13] = true;
				continue;
			}
		}

		//filter by info
		if( filterInfo.length > 0 ) {
			if( itemInfo == "") itemInfo = parseDetails(array[i][2]).innerHTML.replace(/<.*?>/g, " ");
			if( itemInfo.toUpperCase().indexOf(filterInfo.toUpperCase()) == -1 ) {
				array[i][13] = true;
				continue;
			}
		}

		//filter by merch Q
		if( !(isNaN(filterQmin) && isNaN(filterQmax)) )
			if( array[i][3] < filterQmin || array[i][3] > filterQmax  ) {
				array[i][13] = true;
				continue;
			}

		//filter by merch stock
		if( !(isNaN(filterLmin) && isNaN(filterLmax)) )
			if( array[i][4] < filterLmin || array[i][4] > filterLmax  ) {
				array[i][13] = true;		
				continue;
			}

		//filter by price
		if( filterPrice != "") {
			var itemPrice = array[i][6] + (array[i][7] ? array[i][7] : "");
			if( itemPrice.toUpperCase().indexOf(filterPrice.toUpperCase()) == -1 ) {
				array[i][13] = true;
				continue;
			}
		}

		//filter by price Q
		if( !(isNaN(filterPQmin) && isNaN(filterPQmax)) )
			if( array[i][8] < filterPQmin || array[i][8] > filterPQmax  ) {
				array[i][13] = true;		
				continue;
			}

		//filter by price AMT
		if( !(isNaN(filterPAMTmin) && isNaN(filterPAMTmin)) )
			if( array[i][9] < filterPAMTmin || array[i][9] > filterPAMTmax  ) {
				array[i][13] = true;	
				continue;
			}

		//filter by bonuses
		if( enableBonusSearch ) {
			if( array[i][2] == null) {
				array[i][13] = true;
				continue;
			}
	
			var gm = []; //gilds' bonuses
			var am = []; //item's bonuses
			var fm = []; //fep stats
			var gi = []; //item as gilding bonuses
			var ItemBonus = 0;

			if( array[i][2].gildings )
				if( array[i][2].gildings.gildm ) gm = array[i][2].gildings.gildm.slice(0);
			if( array[i][2].atrm ) am = array[i][2].atrm.slice(0);
			if( array[i][2].fep ) fm = array[i][2].fep.slice(0);
			if( array[i][2].gilding ) gi = array[i][2].gilding.slice(0);
	
			if( (gm.length > 0) || (am.length > 0) )
			{
				ItemBonus = 0;
				for( var j = 0; j < gm.length; j++)
					if( gm[j].atr.toUpperCase() == filterBonusesAtr.toUpperCase() ) 
						ItemBonus += gm[j].mod;
				for( var j = 0; j < am.length; j++)
					if( am[j].atr.toUpperCase() == filterBonusesAtr.toUpperCase() )
						ItemBonus += am[j].mod;
			}
			if( fm.length > 0 ) 
			{
				ItemBonus = 0;
				for( var j = 0; j < fm.length; j++)
					if( fm[j].atr.toUpperCase().indexOf(filterBonusesAtr.toUpperCase()) !== -1 )
						ItemBonus += fm[j].mod;
			}
			if( gi.length > 0 ) {
				ItemBonus = 0;
				for( var j = 0; j < gi.length; j++)
					if( gi[j].atr.toUpperCase() == filterBonusesAtr.toUpperCase() ) 
						ItemBonus += gi[j].mod;
			}
	
			if( ItemBonus < filterBonusesMod ) array[i][13] = true;	
			delete gm;
			delete am;
			delete fm;
			delete gi;
		}
	}
	
}

function resetFields() {
	// document.getElementById("filterGoods").value = "";
	// document.getElementById("filterInfo").value = "";
	// document.getElementById("filterQmin").value = "";
	// document.getElementById("filterQmax").value = "";
	// document.getElementById("filterLmin").value = "";
	// document.getElementById("filterLmax").value = "";
	// document.getElementById("filterBonuses").value = "";
	// document.getElementById("filterPrice").value = "";
	// document.getElementById("filterPQmin").value = "";
	// document.getElementById("filterPQmax").value = "";
	// document.getElementById("filterPAMTmin").value = "";
	// document.getElementById("filterPAMTmax").value = "";
	var filters = document.getElementById("filters").childNodes;
	for(var i = 0; i < filters.length; i++)
		if( filters[i].nodeName = "#text" ) filters[i].value = "";
	refreshView();
	document.getElementById("filterGoods").focus();
}

function hotkeys(ev){
	if (ev)
		switch (ev.keyCode) {
			case 27 : //ESC
				resetFields();
				break;
			case 13 : //Enter
				refreshView();
				break;
			default : return;
		}
}

function renderTable(array) {
	var tbody = table.getElementsByTagName("tbody")[0];
	while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
	for( var i = 0; i < array.length; i++) {
		if( array[i][13] == true ) continue;
		var row = document.createElement("tr");
		var cells = [];
		for( var j = 0; j <= 7; j++) {
			cells[j] = document.createElement("td");
		}

		//Merch icon
		var img = document.createElement("img");
		if (!debug) img.src = (basicURL + array[i][0]).replace("/gems/gemstone", "/gems/any");
		img.alt = array[i][0];
		cells[0].appendChild(img);
		
		//Merch name
		cells[1].innerHTML = array[i][1];
		if( array[i][0].indexOf("coins/") != -1 ) 
		{
			var numberOfCoins = parseInt(array[i][1].split(" ")[0]);
			if (numberOfCoins > 1)
				cells[1].innerHTML = numberOfCoins + " " + array[i][2].coinage + "s";
			else
				cells[1].innerHTML = array[i][2].coinage;
		}

		//Merch quality
		if( array[i][3] ) {
			cells[2].innerHTML = array[i][3];	
		} else {
			cells[2].innerHTML = "";
		}

		//Merch left amount
		cells[3].innerHTML = array[i][4];

		//Price icon
		var pimg = document.createElement("img");
		if (!debug) pimg.src = basicURL + array[i][5];
		pimg.alt = array[i][5];
		cells[4].appendChild(pimg);

		//price name
		if( array[i][5].indexOf("coins/") != -1 ) {
			cells[5].innerHTML = array[i][7];
		} else {
			cells[5].innerHTML = array[i][6];	
		}	

		//Price quality
		if( array[i][8] ) {
			cells[6].innerHTML = array[i][8];	
		} else {
			cells[6].innerHTML = "";
		}

		//Price amount
		if( array[i][9] ) 
			cells[7].innerHTML = array[i][9];		

		for( var j = 0; j < cells.length; j++) {
			row.appendChild(cells[j]);
		}

		row.addEventListener("mouseover", highlight);
		row.id = i;
		tbody.appendChild(row);
	}
}

function refreshView() {
	resetSorted();
	filterData(displayData);
	renderTable(displayData);
	mapGen(displayData);
}

function processQuery() {
	var Query = window.location.href.split("?")[1];
	if( !Query ) return;
	var Options = {};
	if( Query.length > 0 ) {
		var pairs = Query.split("&");
		for( var i = 0; i < pairs.length; i++) {
			Options[pairs[i].split("=")[0]] = pairs[i].split("=")[1];
		}
	}
	if( Options.debug ) {
		debug = Options.debug;
		var theme = document.createElement("link");
		theme.id = "styleDebug";
		theme.rel = "stylesheet";
		theme.href = "debug.css";
		document.head.appendChild(theme);
		return;
	}
	if( Options.theme = "dark" ) {
		var themeLight = document.getElementById("styleLight");
		var themeDark = document.createElement("link");
		themeDark.id = "styleDark";
		themeDark.rel = "stylesheet";
		themeDark.href = "theme_dark.css";
		document.head.appendChild(themeDark);
		if (themeLight);
			document.head.removeChild(themeLight);
    }
	
}

function main() {
	processQuery();
	document.addEventListener("keydown", function() {hotkeys(event)});
	document.getElementById("btnReset").addEventListener("click", resetFields);
	document.getElementById("btnSearch").addEventListener("click", refreshView);
/*
	var filters = document.getElementById("filters").childNodes;
	for( var i = 0; i < filters.length; i++ )
		if( filters[i].nodeName = "#text" ) filters[i].addEventListener("keydown", function() {hotkeys(event)});
*/
	displayData = data.slice(0);
	document.title = "CF " + displayData[displayData.length-1][12];
	refreshView();
}

function highlight() {
	var id = this.id;
	var x = data[id][10];
	var y = data[id][11];

	if (map	== undefined)
		var map = document.getElementById('mapSVG');

	var marker = mapSVG.getElementById('mapMarker');
	if (marker == undefined) {
		marker = document.createElementNS(ns, 'circle');
		marker.setAttribute('r', 5);
		marker.setAttribute('class', "SVGmarker");
		marker.setAttribute('id', 'mapMarker');
		map.appendChild(marker);
	}
	marker.setAttribute('cx', x*modx+offx);
	marker.setAttribute('cy', y*mody+offy);
	
	detailsToLot(id);
}

function detailsToLot(id){
	var lot = document.getElementById("lot");

	var stringProduct = data[id][1] + (data[id][3] ? " Q" + data[id][3] : "");
	var stringProductLeft = data[id][4] + " left";
	var stringPrice = data[id][6];
	if( data[id][8] && data[id][8] != "Any") stringPrice += " Q" + data[id][8];
	if( data[id][9] && data[id][9] > 1 ) stringPrice += " × " + data[id][9];
	
	var lprimg = lot.querySelector("#lot-product-image");
	while (lprimg.firstChild) lprimg.removeChild(lprimg.firstChild);
	var img = document.createElement("img");
	if (!debug) img.src = (basicURL + data[id][0]).replace("/gems/gemstone", "/gems/any");
	img.alt = data[id][0];
	lprimg.appendChild(img);

	lot.querySelector("#lot-product").innerHTML = stringProduct;
	lot.querySelector("#lot-left").innerHTML = stringProductLeft;
	lot.querySelector("#lot-details").innerHTML = (parseDetails(data[id][2])).innerHTML;

	var lpriceimg = lot.querySelector("#lot-price-image");
	while (lpriceimg.firstChild) lpriceimg.removeChild(lpriceimg.firstChild);
	var pimg = document.createElement("img");
	if (!debug) pimg.src = (basicURL + data[id][5]).replace("/gems/gemstone", "/gems/any");
	pimg.alt = data[id][5];
	lpriceimg.appendChild(pimg);

	lot.querySelector("#lot-price").innerHTML = stringPrice;
	lot.querySelector("#lot-pricedetails").innerHTML = data[id][7];
	lot.querySelector("#lot-timestamp").innerHTML = data[id][12];
}