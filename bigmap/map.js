document.onLoad = mapGen();

function mapGen() {
	var svg = document.getElementById('mapSVG');
	while (map.firstChild) map.removeChild(map.firstChild);

	for (i = 0; i < coords.length; i++) {
		var newMarkX = (coords[i][1]-fixx)*modx+offx;
		var newMarkY = (coords[i][2]-fixy)*mody+offy;
		mapAddMark(newMarkX, newMarkY, 5);
	}

	for (i = 0; i < coords.length; i++) {
		var newMarkX = (coords[i][1]-fixx)*modx+offx;
		var newMarkY = (coords[i][2]-fixy)*mody+offy/*+(i%2)*5-3*/;
		mapAddText(newMarkX, newMarkY, coords[i][0]);
	}
}

function mapAddMark (mx, my, r)
{
	var rect_mark = document.createElementNS(ns, 'rect');
	rect_mark.setAttribute('x', Math.round(mx-r));
	rect_mark.setAttribute('y', Math.round(my-r));
	rect_mark.setAttribute('width', r*2);
	rect_mark.setAttribute('height', r*2);
	map.appendChild(rect_mark);
}

function mapAddText (mx, my, p4)
{
	var mark = document.createElementNS(ns, 'text');
	mark.setAttribute('x', Math.round(mx));
	mark.setAttribute('y', Math.round(my));
	mark.appendChild(document.createTextNode(p4));
	map.appendChild(mark);
}