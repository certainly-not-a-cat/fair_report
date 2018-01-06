
var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19;
var offy = 164;
//var standStyle = 'fill:rgba(0,0,0,1);stroke-width:0.5;stroke:rgba(0,196,0,1)';
var standStyle = 'fill:rgba(0,196,0,1);stroke-width:0.0;stroke:rgba(0,0,0,0)';
var markerStyle = 'fill:rgba(64,255,128,1);stroke-width:3.5;stroke:rgba(0,0,0,0.7)'
var table = document.getElementById("data");
var map = document.getElementById('mapSVG');
var modx = 1/11*zoomx;
var mody = 1/11*zoomy;

document.onLoad = mapGen();

function applyFilters()
{
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
		tr[i].style.display = "";
	}
	filter(1,'filterGoods');
	filterSub(1,'filterInfo', 'span');
	filter(5,'filterPrice');
	filterInt(2, 'filterQmin', 'filterQmax');
	filterInt(3, 'filterLmin', 'filterLmax');
	filterInt(6, 'filterPQmin', 'filterPQmax');
	filterInt(7, 'filterPAMTmin', 'filterPAMTmax');
}

function filterSub(n, m, tag) {
	var input, filter, tr, sub, i;
	input = document.getElementById(m);
	filter = input.value.toUpperCase();
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
		var td = tr[i].getElementsByTagName("td")[n];
		if ((td)) sub = td.getElementsByTagName(tag)[0];
		if (sub) {
			var tempsub = sub.innerHTML.replace(/\&nbsp\;\+/g, " \+");
			if (tempsub.toUpperCase().indexOf(filter) > -1) {} else {
				tr[i].style.display = "none";
			}
		} 
	}
}

function filter(n, m) {
	var input, filter, tr, td, i;
	input = document.getElementById(m);
	filter = input.value.toUpperCase();
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[n];
		if (td) {
			if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {} else {
				tr[i].style.display = "none";
			}
		} 
	}
}

function filterInt(n, m1, m2) {
	var input, filter, tr, td, i;
	inputMin = document.getElementById(m1);
	inputMax = document.getElementById(m2);
	filterMin = inputMin.value;
	filterMax = inputMax.value;
	table = document.getElementById("data");
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[n];
		if (td) {
			if ((parseInt(td.innerHTML) > parseInt(filterMax)) && (filterMax == parseInt(filterMax)+"")) 
				tr[i].style.display = "none";
			if ((parseInt(td.innerHTML) < parseInt(filterMin)) && (filterMin == parseInt(filterMin)+"")) 
				tr[i].style.display = "none";
		} 
	}
}

function mapGen() {
	var i, j, x, y;
	var coords = [];
	var svg = document.getElementById('mapSVG');
	var tr = table.getElementsByTagName("tr");
	mapFlush(svg);
	//loadBG(svg, -63, 108, -61, 110);
	for (i = 1; i < tr.length; i++) {
		//adding event listener for every data table row
		if (tr[i].getElementsByTagName("td")[8] == undefined || tr[i].getElementsByTagName("td")[9] == undefined ) continue;
		x = parseInt(tr[i].getElementsByTagName("td")[8].innerHTML);
		y = parseInt(tr[i].getElementsByTagName("td")[9].innerHTML);
		tr[i].addEventListener("mouseover", highlight);
		//pushing BS coords into array
		var notInCoords = true;
		for (j = 0; j < coords.length; j++) {
			if ((coords[j][0] == x) && (coords[j][1] == y))
				notInCoords = false;
		}
		if (notInCoords) 
			coords.push([x, y]);
	}

	//fixing some images
	for (i = 1; i < tr.length; i++) {
		var imgCell = tr[i].getElementsByTagName("td")[0];
		if( (imgCell != undefined) && ( imgCell.querySelector(".img-container") != null) )
		{
			var pisrc = imgCell.querySelector(".img-container").querySelector("img").src;
			var pisrcFix = pisrc.replace("gemstone", "any");
			imgCell.querySelector(".img-container").querySelector("img").src = pisrcFix;
		}
	}

	for (i = 0; i < coords.length; i++) {
		var tempX = coords[i][0]*modx+offx;
		var tempY = coords[i][1]*mody+offy;
		mapAddMark(svg, tempX, tempY, 2.4);
	}
}

function mapFlush(svg)
{
	var mapElements = svg.childNodes;
	for (var i = mapElements.length-1; i > 0; i--) mapElements[i].remove();
}

function loadBG(svg, sx, sy, ex, ey)
{
	var x, y;
	if (sx > ex) {
		var a = ex;
		ex = sx;
		sx = a;
	}
	if (sy > ey) {
		var a = ey;
		ey = sy;
		sy = a;
	}
	for (x = sx; x <= ex; x++){
		for (y = sy; y <= ey; y++){
			var bgImg = document.createElementNS(ns, 'image');
			bgImg.setAttribute('href', 'http://www.odditown.com:8080/haven/tiles/live/9/'+x+'_'+y+'.png');
			bgImg.setAttribute('width', '100px');
			bgImg.setAttribute('height', '100px');
			bgImg.setAttribute('x', (x-sx)*100);
			bgImg.setAttribute('y', (y-sy)*100);
			bgImg.setAttribute('opacity','1');
			svg.appendChild(bgImg);		
		}
	}
}

function highlight(){
	var x = parseFloat(this.getElementsByTagName("td")[8].innerHTML);
	var y = parseFloat(this.getElementsByTagName("td")[9].innerHTML);
	if (map	== undefined)
		var map = document.getElementById('mapSVG');
	var marker = mapSVG.getElementById('mapMarker');
	if (marker == undefined){
		marker = document.createElementNS(ns, 'circle');
		marker.setAttribute('r', 5);
		marker.setAttribute('style', markerStyle);
		marker.setAttribute('id', 'mapMarker');
		map.appendChild(marker);
	}
	marker.setAttribute('cx', x*modx+offx);
	marker.setAttribute('cy', y*mody+offy);
	detailsToLot(this);
}

function detailsToLot(R){
	var row = R.getElementsByTagName("td");
	var lot = document.getElementById("lot");

	var pdc = row[1].innerHTML.split("<span>")[0];
	var pdt = row[1].getElementsByTagName("span")[0].innerHTML;

	var prc = row[5].innerHTML.split("<span>")[0];
	var prd = "";
	if (row[5].getElementsByTagName("span").length !== 0) prd = row[5].getElementsByTagName("span")[0].innerHTML;
	if (prc.toLowerCase().includes("coin")) {
		prc = row[5].getElementsByTagName("span")[0].innerHTML;
		prd = "";
	}

	var pdq = "";
	if (row[2].innerHTML != "Any" && row[2].innerHTML != "") pdq = " Q"+row[2].innerHTML;

	var prq = "";
	if (row[6].innerHTML != "Any" && row[6].innerHTML != "") prq = " Q"+row[6].innerHTML;

	var pdx = "" + row[3].innerHTML + " left";
	
	var prx = "";
	if (row[7].innerHTML != "1") {
		prx = " × " + row[7].innerHTML;
	}

	var tsp = row[10].innerHTML;

	var pdi = row[0].innerHTML;
	var pri = row[4].innerHTML;
	
	lot.querySelector("#lot-product-image").innerHTML = pdi;
	lot.querySelector("#lot-product").innerHTML = pdc+pdq;
	lot.querySelector("#lot-left").innerHTML = pdx;
	lot.querySelector("#lot-details").innerHTML = pdt;

	lot.querySelector("#lot-price-image").innerHTML = pri;
	lot.querySelector("#lot-price").innerHTML = prc+prq+prx;
	lot.querySelector("#lot-pricedetails").innerHTML = prd;
	lot.querySelector("#lot-timestamp").innerHTML = tsp;
}

function mapAddMark (svg, mx, my, r)
{
	var mark = document.createElementNS(ns, 'circle');
	mark.setAttribute('cx', mx);
	mark.setAttribute('cy', my);
	mark.setAttribute('r', r);
	mark.setAttribute('style', standStyle);
	svg.appendChild(mark);
}