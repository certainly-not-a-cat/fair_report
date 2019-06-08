var displayData = [];
document.onLoad = main();


function formatVal(val, format) {
	if( !format ) return val;
	switch ( format ) {
		case "aztext" : 
			return val.toLowerCase().replace(/[^a-z]/g, "");
			break;
		case "sign" : 
			return val > 0 ? "+" + val : val ;
			break;
		case "d2pr" : 
			return Math.round(val*10000)/100 + "%";
			break;
		case "d2sd" :
			return Math.round(val*100)/100;
			break;
		case "2lz" :
			return val.substr(0, 1) + (val.length < 4 ? (val.length < 3 ? "00" : "0") : "") + val.substr(1, val.length-1);
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

function azContains(a, b){
	return formatVal(a, "aztext").indexOf( formatVal(b, "aztext") ) !== -1;
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
				var list = bakeSingleNamedDL("AP", details[k1], "d2pr");
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
	
	var headers = document.getElementById('data-headers');
	var headrow = headers.getElementsByTagName("div");
	for( var i = 0; i < headrow.length; i++) {
		headrow[i].className = headrow[i].className.replace("sorttable_sorted_reverse", "").replace("sorttable_sorted", "");
	}
	
}

function filterData(array) {
	var filterGoods	= document.getElementById("filterGoods").value;
	var filterInfo	= document.getElementById("filterInfo").value;
	var filterTrader	= document.getElementById("filterTrader").value;
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

	if ( (filterTrader.indexOf("-") !== -1) && (filterTrader.indexOf("-") == filterTrader.lastIndexOf("-")) ) {
		var filterTraderRange = filterTrader.split("-");
	}

	var searchbyref = [];
	for( var k in ItemReferenceList ) {
		if( filterGoods.indexOf(k) == 0) {
			document.getElementById("filterGoods").value = k;
			searchbyref = ItemReferenceList[k];
			break;
		}
	}

	for( var i = 0; i < array.length; i++) {
		array[i][13] = false; //unhide every single row
		var itemInfo = "";
		
		//filter by merch
		if( searchbyref.length > 0 ) {
			var containsRef = false;
			for( var j = 0; j < searchbyref.length; j++ ) {
				if( array[i][0] == searchbyref[j] ) {
					containsRef = true;
					break;
				}
			}
			if( !containsRef ) {
				array[i][13] = true;
				continue;
			}
		}
		else
			if( filterGoods.length > 0 ) {
				if( itemInfo == "") itemInfo = parseDetails(array[i][2]).innerHTML.replace(/<.*?>/g, " ");
				var itemName = array[i][1] + itemInfo;
				if( !azContains(itemName, filterGoods) ) {
					array[i][13] = true;
					continue;
				}
			}

		//filter by info
		if( filterInfo.length > 0 ) {
			if( itemInfo == "") itemInfo = parseDetails(array[i][2]).innerHTML.replace(/<.*?>/g, " ");
			if( !azContains(itemInfo, filterInfo) ) {
				array[i][13] = true;
				continue;
			}
		}

		//filter by trader
		if( filterTrader.length > 0 ) {
			var itemtraderName = array[i][12][1];
			var itemtraderID = array[i][12][0];
			if (filterTraderRange !== undefined) {
				if ( (itemtraderID.toUpperCase() < formatVal(filterTraderRange[0], "2lz").toUpperCase()) || (itemtraderID.toUpperCase() > formatVal(filterTraderRange[1], "2lz").toUpperCase()) ) {
					array[i][13] = true;
					continue;	
				}
			} else {
				if( ( !azContains(itemtraderName, filterTrader) ) && (itemtraderID.toUpperCase().indexOf(formatVal(filterTrader, "2lz").toUpperCase()) == -1) ) 
				{
					array[i][13] = true;
					continue;
				}
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
			if( !azContains(itemPrice, filterPrice) ){
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
		if( !(isNaN(filterPAMTmin) && isNaN(filterPAMTmax)) )
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
	var filters = document.getElementById("filters").childNodes;
	for(var i = 0; i < filters.length; i++)
		if( filters[i].nodeName = "#text" ) filters[i].value = "";
	refreshView();
}

function renderTable(array) {
	var tbody = table.getElementsByTagName("tbody")[0];
	while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
	for( var i = 0; i < array.length; i++) {
		if( array[i][13] == true ) continue;
		var row = document.createElement("tr");
		var cells = [];
		for( var j = 0; j <= 8; j++) {
			cells[j] = document.createElement("td");
		}

		//Brand
		var brand = "";
		var maxWidthBrand = 12;
		brand = (array[i][12][1] == "" ? array[i][12][0] : array[i][12][1]); //show name instead of ID if any
		// brand = array[i][12][0];
		
		if (brand.length > maxWidthBrand*2) {
			brand = brand.substr(0, maxWidthBrand*2)+"..";
			var ls = brand.lastIndexOf(" ");
			if (ls != -1)
				brand = brand.substr(0, ls)+"...";
		}


		if (brand.length > maxWidthBrand)
			if (brand.indexOf(" ") > maxWidthBrand || brand.indexOf(" ") == -1)
				brand = brand.substr(0, maxWidthBrand)+"..";
		cells[0].innerHTML = brand; 

		//Merch icon
		var imgcontainer = document.createElement("div");
		imgcontainer.classList.add("image-container");
		var img = document.createElement("img");
		if ( !opts.debug ) img.src = (basicURL + array[i][0]).replace("/gems/gemstone", "/gems/any");
		img.alt = array[i][0];
		imgcontainer.appendChild(img);
		cells[1].appendChild(imgcontainer);
		
		//Merch name
		cells[2].innerHTML = array[i][1];
		if( array[i][0].indexOf("coins/") != -1 ) 
		{
			var numberOfCoins = parseInt(array[i][1].split(" ")[0]);
			if (numberOfCoins > 1)
				cells[2].innerHTML = numberOfCoins + " " + array[i][2].coinage + "s";
			else
				cells[2].innerHTML = array[i][2].coinage;
		}

		//Merch quality
		if( array[i][3] ) {
			cells[3].innerHTML = array[i][3];	
		} else {
			cells[3].innerHTML = "";
		}

		//Merch left amount
		cells[4].innerHTML = array[i][4];



		//Price icon
		var pimgcontainer = document.createElement("div");
		pimgcontainer.classList.add("image-container");
		var pimg = document.createElement("img");
		if ( !opts.debug ) pimg.src = (basicURL + array[i][5]).replace("/gems/gemstone", "/gems/any");
		pimg.alt = array[i][5];
		pimgcontainer.appendChild(pimg);
		cells[5].appendChild(pimgcontainer);

		//price name
		if( array[i][5].indexOf("coins/") != -1 ) {
			cells[6].innerHTML = array[i][7];
		} else {
			cells[6].innerHTML = array[i][6];	
		}	

		//Price quality
		if( array[i][8] ) {
			cells[7].innerHTML = array[i][8];	
		} else {
			cells[7].innerHTML = "";
		}

		//Price amount
		if( array[i][9] ) 
			cells[8].innerHTML = array[i][9];		

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

function applyTheme() {
	if( opts.debug ) {
		var debugStyle = document.createElement("link");
		debugStyle.rel = "stylesheet";
		debugStyle.href = "debug.css";
		document.head.appendChild(debugStyle);
	}

	var themeStyle = document.createElement("link");
	themeStyle.rel = "stylesheet";
	themeStyle.href = "theme_" + opts.theme + ".css";
	document.head.appendChild(themeStyle);
}

function processQuery() {
	var querystring = window.location.href.split("?")[1];
	if( !querystring ) return;
	if( querystring.length == 0 ) return;

	var optionlist = {};
	var pairs = querystring.split("&");
	for( var i = 0; i < pairs.length; i++) optionlist[pairs[i].split("=")[0]] = pairs[i].split("=")[1];

	if( optionlist.debug ) opts.debug = optionlist.debug;
	if( optionlist.theme == "dark" ) opts.theme = "dark";   
}

function resizeDetailsDiv() {
	document.getElementById("lot-details").style.maxHeight = Math.max(48, window.innerHeight-660) + "px";
}

function addDropdownToInput(inputField, list) {
	var currentWidth = inputField.clientWidth;
	var fieldParent = inputField.parentNode;
	
	//adding dropdown button before target input
	var divReferenceButton = document.createElement("div");
	divReferenceButton.className = "dropdownButton";
	divReferenceButton.innerHTML = "+";
	inputField.style.width = currentWidth - 20 + "px";
	inputField.style.paddingLeft = 20 + "px";
	divReferenceButton.addEventListener("click", function () {toggleList(divReferenceList, divReferenceButton);} );
	fieldParent.insertBefore(divReferenceButton, inputField);

	//adding dropdown list to target input
	var divReferenceList = document.createElement("div");
	divReferenceList.div = "listReference";
	divReferenceList.className = "dropdownList";
	divReferenceList.style.display = "none";

	var listsize = 0;
	for( var i in list ) {
		var line = document.createElement("div");
		var text = document.createTextNode(i);
		line.appendChild(text);
		line.addEventListener("click", function() {
			inputField.value = this.innerHTML;
			toggleList(divReferenceList, divReferenceButton);
		})
		divReferenceList.appendChild(line);
		listsize += 1;
	}

	divReferenceList.style.height = listsize*17 + "px";
	fieldParent.insertBefore(divReferenceList, divReferenceButton);
}

function toggleList(list, button) {
	if( list.style.display == "block" ) {
		button.innerHTML = "+";
		list.style.display = "none";
	}
	else {
		list.style.display = "block";
		button.innerHTML = "-";
	}
	return;
}

function main() {
	document.title = "Loading data...";
	processQuery();
	applyTheme();
	window.addEventListener("keydown", function(event) {
		if (event)
			switch (event.keyCode) {
				case 27 : //ESC
					event.preventDefault();
					resetFields();
					break;
				case 13 : //Enter
					event.preventDefault();
					refreshView();
					break;
				default : return;
			}
		});
	document.getElementById("btnReset").addEventListener("click", resetFields);
	document.getElementById("btnSearch").addEventListener("click", refreshView);
	window.addEventListener("resize", resizeDetailsDiv);
	addDropdownToInput(document.getElementById("filterGoods"), ItemReferenceList);
	addDropdownToInput(document.getElementById("filterBonuses"), aBonuses);

	displayData = data.slice(0);
	document.title = "CF " + data[data.length-1][12];
	prepareData();

	refreshView();
	resizeDetailsDiv();
}

function prepareData() {
	for (var i = 0; i < displayData.length; i++) {
		var bsid = searchForId(i);
		bsid.push(displayData[i][12]);
		displayData[i][12] = bsid; //replacing tmstmp with [id, brand, tmstmp]
	}
}

function highlight() {
	var id = this.id;
	var x = displayData[id][10];
	var y = displayData[id][11];

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
	marker.setAttribute('cx', (x-fixx)*modx+offx);
	marker.setAttribute('cy', (y-fixy)*mody+offy);
	
	detailsToLot(id);
}

function searchForId(id, format){
	var x = displayData[id][10];
	var y = displayData[id][11];
	var searchDist = 5;
	for (var i = 0; i < coords.length; i++) {
		var bsid = coords[i][0];
		var bsOwnerName = coords[i][3];
		var x1 = coords[i][1];
		var y1 = coords[i][2];
		var dist = Math.pow((x1-x), 2) + Math.pow((y1-y), 2);
		if(  dist < searchDist ) {
			if (bsOwnerName == undefined) 
				bsOwnerName = "";
			return [formatVal(bsid, "2lz"), bsOwnerName];
		}
	}
	var uic = Math.round(x) + ", " + Math.round(y);
	// console.log(uic + " " + id);
	console.log(uic);
	return [uic, ""];
}

function detailsToLot(id){
	var lot = document.getElementById("lot");

	var stringProduct = displayData[id][1] + (displayData[id][3] ? " Q" + displayData[id][3] : "");
	var stringProductLeft = displayData[id][4] + " left";
	var stringPrice = displayData[id][6];
	if( displayData[id][8] && displayData[id][8] != "Any") stringPrice += " Q" + displayData[id][8];
	if( displayData[id][9] && displayData[id][9] > 1 ) stringPrice += " × " + displayData[id][9];
	
	var lprimg = lot.querySelector("#lot-product-image");
	while (lprimg.firstChild) lprimg.removeChild(lprimg.firstChild);
	var img = document.createElement("img");
	if ( !opts.debug ) img.src = (basicURL + displayData[id][0]).replace("/gems/gemstone", "/gems/any");
	img.alt = displayData[id][0];
	lprimg.appendChild(img);

	lot.querySelector("#lot-product").innerHTML = stringProduct;
	lot.querySelector("#lot-left").innerHTML = stringProductLeft;
	lot.querySelector("#lot-details").innerHTML = (parseDetails(displayData[id][2])).innerHTML;

	var lpriceimg = lot.querySelector("#lot-price-image");
	while (lpriceimg.firstChild) lpriceimg.removeChild(lpriceimg.firstChild);
	var pimg = document.createElement("img");
	if ( !opts.debug ) pimg.src = (basicURL + displayData[id][5]).replace("/gems/gemstone", "/gems/any");
	pimg.alt = displayData[id][5];
	lpriceimg.appendChild(pimg);

	lot.querySelector("#lot-price").innerHTML = stringPrice;
	if (displayData[id][7] != null) {
		lot.querySelector("#lot-pricedetails").innerHTML = displayData[id][7];
	} else {
		lot.querySelector("#lot-pricedetails").innerHTML = "";
	}
	var addInfo = "";
	addInfo += (displayData[id][12][1] != "" ? "" + displayData[id][12][1] + ", ": "");
	addInfo += (displayData[id][12][0] != "" ? "" + displayData[id][12][0] : "");
	addInfo += (displayData[id][12][2] != "" ? "</br> " + displayData[id][12][2] : "");
	lot.querySelector("#lot-timestamp").innerHTML = addInfo;
}