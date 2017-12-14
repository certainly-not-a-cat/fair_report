
var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19;
var offy = 164;
var standStyle = 'fill:rgba(0,196,0,1);stroke-width:0;stroke:rgba(255,255,255,0.5)';
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
	filter(0,'filterGoods');
	filterSub(0,'filterInfo', 'span');
	filter(3,'filterPrice');
	filterInt(1, 'filterQmin', 'filterQmax');
	filterInt(2, 'filterLmin', 'filterLmax');
	filterInt(4, 'filterPQmin', 'filterPQmax');
	filterInt(5, 'filterPAMTmin', 'filterPAMTmax');
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
		if (tr[i].getElementsByTagName("td")[6] == undefined || tr[i].getElementsByTagName("td")[7] == undefined ) continue;
		x = parseInt(tr[i].getElementsByTagName("td")[6].innerHTML);
		y = parseInt(tr[i].getElementsByTagName("td")[7].innerHTML);
		tr[i].addEventListener("mouseover", highlight);
		var notInCoords = true;
		for (j = 0; j < coords.length; j++) {
			if ((coords[j][0] == x) && (coords[j][1] == y))
				notInCoords = false;
		}
		if (notInCoords) 
			coords.push([x, y]);
		if (tr[i].getElementsByTagName("td")[0].getElementsByTagName("span")[0] != undefined)	
		{	
			var tempGDetails = tr[i].getElementsByTagName("td")[0].getElementsByTagName("span")[0].innerHTML;
			tempGDetails = tempGDetails.replace(/ \/ /g, "<p>");
			tempGDetails = tempGDetails.replace(/ \+/g, "&nbsp;\+");
			tr[i].getElementsByTagName("td")[0].getElementsByTagName("span")[0].innerHTML = tempGDetails;
		}
	}
	for (i = 0; i < coords.length; i++) {
		var tempX = coords[i][0]*modx+offx;
		var tempY = coords[i][1]*mody+offy;
		mapAddMark(svg, tempX, tempY, 2.5);
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
		var x = parseFloat(this.getElementsByTagName("td")[6].innerHTML);
		var y = parseFloat(this.getElementsByTagName("td")[7].innerHTML);
		if (map	== undefined)
			var map = document.getElementById('mapSVG');
		var marker = mapSVG.getElementById('mapMarker');
		if (marker == undefined){
			marker = document.createElementNS(ns, 'circle');
			marker.setAttribute('r', 4);
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

		var pdc = row[0].innerHTML.split("<span>")[0];
		var pdt = row[0].getElementsByTagName("span")[0].innerHTML;

		var prc = row[3].innerHTML.split("<span>")[0];
		var prd = row[3].getElementsByTagName("span")[0].innerHTML;
		if (prc.toLowerCase().includes("coin")) {
			prc = row[3].getElementsByTagName("span")[0].innerHTML;
			prd = "";
		}

		var pdq = "";
		if (row[1].innerHTML != "Any" && row[1].innerHTML != "") pdq = " Q"+row[1].innerHTML;

		var prq = "";
		if (row[4].innerHTML != "Any" && row[4].innerHTML != "") prq = " Q"+row[4].innerHTML;

		var pdx = "" + row[2].innerHTML + " left";
		
		var prx = "";
		if (row[5].innerHTML != "1") {
			prx = " × " + row[5].innerHTML;
		}
		
		lot.querySelector("#lot-product").innerHTML = pdc+pdq;
		lot.querySelector("#lot-left").innerHTML = pdx;
		lot.querySelector("#lot-details").innerHTML = pdt;
		lot.querySelector("#lot-price").innerHTML = prc+prq+prx;
		lot.querySelector("#lot-pricedetails").innerHTML = prd;
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