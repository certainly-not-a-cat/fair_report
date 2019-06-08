function mapGen(array) {
	var i, j, x, y;
	var coords = [];
	var coordsF = [];
	var svg = document.getElementById('mapSVG');
	while (svg.firstChild) svg.removeChild(svg.firstChild);

	//load external bg-images
	//loadBG(svg, -63, 108, -61, 110);

	/*
	//draw all stands
	for (i = 0; i < data.length; i++) {

		x = data[i][10];
		y = data[i][11];
		
		var notInCoords = true;
		for (j = 0; j < coords.length; j++) {
			if ((coords[j][0] == x) && (coords[j][1] == y))
				notInCoords = false;
		}
		if (notInCoords) 
			coords.push([x, y]);
	}

	for (i = 0; i < coords.length; i++) {
		var newMarkX = coords[i][0]*modx+offx;
		var newMarkY = coords[i][1]*mody+offy;
		mapAddMark(svg, "rect", newMarkX, newMarkY, 1.5, "SVGstandInactive");
	}
	*/	

	for (i = 0; i < array.length; i++) {
		if( array[i][13] ) continue;

		x = array[i][10];
		y = array[i][11];
		
		var notInCoords = true;
		for (j = 0; j < coordsF.length; j++) {
			if ((coordsF[j][0] == x) && (coordsF[j][1] == y))
				notInCoords = false;
		}
		if (notInCoords) 
			coordsF.push([x, y]);
	}

	for (i = 0; i < coordsF.length; i++) {
		var newMarkX = (coordsF[i][0]-fixx)*modx+offx;
		var newMarkY = (coordsF[i][1]-fixy)*mody+offy;
		mapAddMark(svg, "rect", newMarkX, newMarkY, 1.5, "SVGstand");
	}
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
			//bgImg.setAttribute('opacity','0.3');
			svg.appendChild(bgImg);		
		}
	}
}

function mapAddMark (svg, type, mx, my, r, elementClass)
{
	switch (type){
		case "circle" : 
			var mark = document.createElementNS(ns, 'circle');
			mark.setAttribute('cx', mx);
			mark.setAttribute('cy', my);
			mark.setAttribute('r', r);
			break;
		case "rect" : 
			var mark = document.createElementNS(ns, 'rect');
			mark.setAttribute('x', Math.round(mx-r));
			mark.setAttribute('y', Math.round(my-r));
			mark.setAttribute('width', r*2);
			mark.setAttribute('height', r*2);
			break;
		default:
			var mark = document.createElementNS(ns, 'circle');
			mark.setAttribute('cx', mx);
			mark.setAttribute('cy', my);
			mark.setAttribute('r', 1);
	}
	mark.setAttribute('class', elementClass);
	svg.appendChild(mark);
}