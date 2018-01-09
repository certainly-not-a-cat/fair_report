var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19;
var offy = 164;
var standStyle = 'fill:rgba(0,196,0,1);stroke-width:0.0;stroke:rgba(0,0,0,0)';
var markerStyle = 'fill:rgba(64,255,128,1);stroke-width:3.5;stroke:rgba(0,0,0,0.7)'
var table = document.getElementById("data");
var map = document.getElementById('mapSVG');
var modx = 1/11*zoomx;
var mody = 1/11*zoomy;

document.onLoad = mapGen();

function clearFilters()
{
	var fList = [
		'filterGoods', 
		'filterInfo', 
		'filterPrice', 
		'filterQmin', 
		'filterQmax', 
		'filterLmin', 
		'filterLmax', 
		'filterPQmin', 
		'filterPQmax', 
		'filterPAMTmin', 
		'filterPAMTmax'
	];
	for( var i = 0; i < fList.length; i++ )
	{
		var field = document.getElementById(fList[i]);
		if( field != undefined ) field.value = "";
	}
	applyFilters();
}

function applyFilters()
{
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
		tr[i].classList.remove("hidden");
		tr[i].classList.add("visible");
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
				tr[i].classList.remove("visible");
				tr[i].classList.add("hidden");
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
				tr[i].classList.remove("visible");
				tr[i].classList.add("hidden");
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
				tr[i].classList.remove("visible");
				tr[i].classList.add("hidden");
			if ((parseInt(td.innerHTML) < parseInt(filterMin)) && (filterMin == parseInt(filterMin)+"")) 
				tr[i].classList.remove("visible");
				tr[i].classList.add("hidden");
		} 
	}
}

function mapGen() {
	var i, j, x, y;
	var coords = [];
	var svg = document.getElementById('mapSVG');
	var tr = table.getElementsByTagName("tr");
	mapFlush(svg);
	for (i = 1; i < tr.length; i++) {
		//adding event listener for every data table row
		if (tr[i].getElementsByTagName("td")[8] == undefined || tr[i].getElementsByTagName("td")[9] == undefined ) continue;
		x = parseInt(tr[i].getElementsByTagName("td")[8].innerHTML);
		y = parseInt(tr[i].getElementsByTagName("td")[9].innerHTML);
		tr[i].addEventListener("click", highlight);
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
		mapAddMark(svg, tempX, tempY, 2.0);
	}
}

function mapFlush(svg)
{
	var mapElements = svg.childNodes;
	for (var i = mapElements.length-1; i > 0; i--) mapElements[i].remove();
}

function highlight(){
	this.classList.toggle("expanded");
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