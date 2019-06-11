document.onLoad = mapGen();

function mapGen() {
	var svg = document.getElementById('mapSVG');
	while (map.firstChild) map.removeChild(map.firstChild);

	for (i = 0; i < coords.length; i++) {
		var newMarkText = coords[i][0];
		var newMarkX = (coords[i][1]-fixx)*modx+offx;
		var newMarkY = (coords[i][2]-fixy)*mody+offy;
		mapAddMark(newMarkText, newMarkX, newMarkY, 3.5);
	}
}

function mapAddMark (mt, mx, my, r)
{
	var rect_mark = document.createElementNS(ns, 'rect');
	if (mt.indexOf("X") !== -1) {
		rect_mark.setAttribute('class', 'hili');
		r+=0.5;
	}
	rect_mark.setAttribute('x', Math.round(mx-r));
	rect_mark.setAttribute('y', Math.round(my-r));
	rect_mark.setAttribute('width', r*2);
	rect_mark.setAttribute('height', r*2);
	map.appendChild(rect_mark);

	var mark = document.createElementNS(ns, 'text');
	mark.setAttribute('x', Math.round(mx));
	mark.setAttribute('y', Math.round(my));
	mark.appendChild(document.createTextNode(mt));
	if (mt.indexOf("X") !== -1) mark.setAttribute('class', 'hili-text');
	map.appendChild(mark);
}

function mapAddText (mx, my, p4)
{

}