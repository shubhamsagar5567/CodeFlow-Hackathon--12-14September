//1->hide
//2->display
var flag = 0;
var srcneeded;
//listens for image upload
window.addEventListener('DOMContentLoaded', function () {
	document.querySelector('input[id="upload"]').addEventListener('input', function () {
		if (this.files && this.files[0]) {
			var img = document.querySelector('img');  // $('img')[0]
			srcneeded = URL.createObjectURL(this.files[0]); // set src to blob url
			img.onload = this.src;
			addImage();
		}
	});
});
var srcneededwatermark;
var image_1;
//listens for watermark  upload
window.addEventListener('load', function () {
	document.querySelector('input[id="upload2"]').addEventListener('change', function () {
		if (this.files && this.files[0]) {
			var img = document.querySelector('img');  // $('img')[0]
			image_1 = this.files[0];
			srcneededwatermark = URL.createObjectURL(this.files[0]); // set src to blob url
			img.onload = this.src;
			addWatermark();
		}
	});
});
//jquery to
$(function () {
	$("#upload_link").on('click', function (e) {
		if (flag == 0) {
			alert("Add watermark first!!");
			return;
		}
		e.preventDefault();
		$("#upload:hidden").trigger('click');
	});
});

$(function () {
	$("#upload_link2").on('click', function (e) {
		e.preventDefault();
		$("#upload2:hidden").trigger('click');
	});
});

var title = "Title";
title = prompt("Enter Team Name for Mindmap");
if (title == "") {
	title = "Title";
}
var allIdsforUndo = [];
var allIdsforRedo = [];
var modeforUndo = [];
var modeforRedo = [];
var trforUndo = [];
var to_be_del = null;
var to_be_del2 = null;
var col_pick = "#d2f6c5";
var text_col = "#333333";
var width = window.innerWidth;
var height = window.innerHeight;
var align = "center";
function change_title() {
	title = prompt("Enter Title for Mindmap");
}

var stage = new Konva.Stage({
	container: 'container',
	width: width,
	height: height,
});
stage.getContainer().style.border = '1px solid black';
var layer = new Konva.Layer();
//color picker
const picker = document.querySelector('#color_sel');
picker.addEventListener('input', (event) => {
	col_pick = picker.value;
});
const text_picker = document.querySelector('#text_color_sel');
text_picker.addEventListener('input', (event) => {

	text_col = text_picker.value;
});

//zoom in-out
var scaleBy = 0.95;
stage.on('wheel', (e) => {
	e.evt.preventDefault();
	var oldScale = stage.scaleX();
	var pointer = stage.getPointerPosition();
	var mousePointTo = {
		x: (pointer.x - stage.x()) / oldScale,
		y: (pointer.y - stage.y()) / oldScale,
	};
	var newScale =
		e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

	stage.scale({ x: newScale, y: newScale });
	var newPos = {
		x: pointer.x - mousePointTo.x * newScale,
		y: pointer.y - mousePointTo.y * newScale,
	};
	stage.position(newPos);
	stage.batchDraw();
});
//sel_mul//
var trans = null;
var selectionRectangle = new Konva.Rect({
	fill: 'rgba(0,0,255,0.5)',
	visible: false
});
layer.add(selectionRectangle);

var x1, y1, x2, y2;
stage.on('mousedown touchstart', (e) => {
	// do nothing if we mousedown on eny shape
	if (e.target !== stage) {
		return;
	}
	if (selectionRectangle.visible()) {
		return;
	}
	if (trans != null) {
		trans.nodes([]);
	}
	trans = new Konva.Transformer();
	layer.add(trans);
	x1 = stage.getPointerPosition().x;
	y1 = stage.getPointerPosition().y;
	x2 = stage.getPointerPosition().x;
	y2 = stage.getPointerPosition().y;
	selectionRectangle.visible(true);
	selectionRectangle.width(0);
	selectionRectangle.height(0);
	layer.draw();
});

stage.on('mousemove touchmove', () => {
	// do nothing if we didn't start selection
	if (!selectionRectangle.visible()) {
		return;
	}
	x2 = stage.getPointerPosition().x;
	y2 = stage.getPointerPosition().y;

	selectionRectangle.setAttrs({
		x: Math.min(x1, x2),
		y: Math.min(y1, y2),
		width: Math.abs(x2 - x1),
		height: Math.abs(y2 - y1),
	});
	layer.batchDraw();
});

stage.on('mouseup touchend', () => {
	// no nothing if we didn't start selection
	if (!selectionRectangle.visible()) {
		return;
	}
	// update visibility in timeout, so we can check it in click event
	setTimeout(() => {
		selectionRectangle.visible(false);
		layer.batchDraw();
	});

	var shapes = stage.find('Group').toArray();
	var arrows = stage.find('Line').toArray();
	var box = selectionRectangle.getClientRect();
	var selected = shapes.filter((shape) =>
		Konva.Util.haveIntersection(box, shape.getClientRect())
	);
	trans.nodes(selected);
	layer.batchDraw();
});

// clicks should select/deselect shapes
stage.on('click tap', function (e) {
	// if we are selecting with rect, do nothing
	if (selectionRectangle.visible()) {
		return;
	}
	// if click on empty area - remove all selections
	if (e.target === stage) {
		trans.nodes([]);
		layer.draw();
		return;
	}
	// do nothing if clicked NOT on our rectangles
	if (!e.target.hasName('rect')) {
		return;
	}
	// do we pressed shift or ctrl?
	layer.draw();
});
//sel_mul
function insert_root(mode) {
	if (flag == 0) {
		alert("Add watermark first!!");
		return;
	}
	var rectX = stage.width() / 2 - 50;
	var rectY = stage.height() / 2 - 25;
	var group1 = new Konva.Group
		({
			x: rectX,
			y: rectY,
			draggable: true,
		});
	var tr;
	group1.on('click', function () {
		to_be_del = group1;
		if (typeof tr === 'undefined' || tr.nodes().length == 0) {
			var MAX_WIDTH = 300;
			var MIN_WIDTH = 0;
			var MIN_HEIGHT = 0;
			tr = new Konva.Transformer({
				boundBoxFunc: function (oldBoundBox, newBoundBox) {
					// "boundBox" is an object with
					// x, y, width, height and rotation properties
					// transformer tool will try to fit nodes into that box
					// the logic is simple, if new width is too big
					// we will return previous state
					if (Math.abs(newBoundBox.width) > MAX_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.width <= MIN_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.height <= MIN_HEIGHT) {
						return oldBoundBox;
					}
					return newBoundBox;
				},
			});
			to_be_del2 = tr;
			trforUndo.push(tr);
			layer.add(tr);
			tr.nodes([group1]);
			layer.draw();
		}
		else {
			tr.nodes([]);
			layer.draw();
		}
	});
	if (mode == 1) {
		var box = new Konva.Rect({
			x: 0,
			y: 0,
			width: 100,
			height: 50,
			fill: col_pick,
			shadowBlur: 3,
			cornerRadius: 7
		});
	}
	else if (mode == 2) {
		var box = new Konva.Rect({
			x: 53,
			y: -45,
			width: 100,
			height: 100,
			rotation: 45,
			fill: col_pick,
			shadowBlur: 3,
			cornerRadius: 7
		});
	}
	// add cursor styling
	box.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	box.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	if (mode == 1) {
		var textNode = new Konva.Text({
			text: 'Enter text',
			x: 0,
			y: 0,
			// fontSize: 20,
			width: 100,
			height: 50,
			fill: text_col
		});
	}
	else {
		var textNode = new Konva.Text({
			text: 'Enter text',
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			fill: text_col
		});
	}
	textNode.align(`${align}`);
	//   box.fillPatternScale({x: 1,y:1});
	textNode.on('dblclick', () => {
		// create textarea over canvas with absolute position
		// first we need to find position for textarea
		//  to find it, at first lets find position of text node relative to the stage:
		var textPosition = textNode.getAbsolutePosition();

		// then lets find position of stage container on the page:
		var stageBox = stage.container().getBoundingClientRect();

		// so position of textarea will be the sum of positions above:
		var areaPosition = {
			x: stageBox.left + textPosition.x,
			y: stageBox.top + textPosition.y,
		};

		// create textarea and style it
		var textarea = document.createElement('textarea');
		document.body.appendChild(textarea);

		textarea.value = textNode.text();
		textarea.style.position = 'absolute';
		textarea.style.top = areaPosition.y + 'px';
		textarea.style.left = areaPosition.x + 'px';
		textarea.style.width = textNode.width();

		textarea.focus();

		textarea.addEventListener('keydown', function (e) {
			// hide on enter
			if (e.keyCode === 13) {
				textNode.text(textarea.value);
				layer.draw();
				document.body.removeChild(textarea);
			}
		});
	})
	group1.add(box);
	group1.add(textNode);
	layer.add(group1);
	stage.add(layer);
	allIdsforUndo.push(group1);
	modeforUndo.push(1);
}
function insert_circle() {
	if (flag == 0) {
		alert("Add watermark first!!");
		return;
	}
	var rectX = stage.width() / 2 - 50;
	var rectY = stage.height() / 2 - 25;
	var group1 = new Konva.Group
		({
			x: rectX,
			y: rectY,
			draggable: true,
		});

	var tr;
	group1.on('click', function () {
		to_be_del = group1;
		if (typeof tr === 'undefined' || tr.nodes().length == 0) {
			var MAX_WIDTH = 300;
			var MIN_WIDTH = 0;
			var MIN_HEIGHT = 0;
			tr = new Konva.Transformer({
				boundBoxFunc: function (oldBoundBox, newBoundBox) {
					// "boundBox" is an object with
					// x, y, width, height and rotation properties
					// transformer tool will try to fit nodes into that box
					// the logic is simple, if new width is too big
					// we will return previous state
					if (Math.abs(newBoundBox.width) > MAX_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.width <= MIN_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.height <= MIN_HEIGHT) {
						return oldBoundBox;
					}
					return newBoundBox;
				},
			});
			to_be_del2 = tr;
			trforUndo.push(tr);
			layer.add(tr);
			tr.nodes([group1]);
			layer.draw();
		}
		else {
			tr.nodes([]);
			layer.draw();
		}
	});
	var circle = new Konva.Circle({
		text: 'Hello',
		x: 45,
		y: 12,
		radius: 60,
		fill: col_pick,
		shadowBlur: 3,
	});
	// add cursor styling
	circle.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	circle.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	var textNode = new Konva.Text({
		text: 'Enter text',
		x: -2,
		y: -18,
		height: 80,
		width: 90,
		fill: text_col
	});
	textNode.align(`${align}`);
	textNode.on('dblclick', () => {
		// create textarea over canvas with absolute position
		// first we need to find position for textarea
		// to find it ,at first lets find position of text node relative to the stage:
		var textPosition = textNode.getAbsolutePosition();

		// then lets find position of stage container on the page:
		var stageBox = stage.container().getBoundingClientRect();

		// so position of textarea will be the sum of positions above:
		var areaPosition = {
			x: stageBox.left + textPosition.x,
			y: stageBox.top + textPosition.y,
		};

		// create textarea and style it
		var textarea = document.createElement('textarea');
		document.body.appendChild(textarea);

		textarea.value = textNode.text();
		textarea.style.position = 'absolute';
		textarea.style.top = areaPosition.y + 'px';
		textarea.style.left = areaPosition.x + 'px';
		textarea.style.width = textNode.width();

		textarea.focus();

		textarea.addEventListener('keydown', function (e) {
			// hide on enter
			if (e.keyCode === 13) {
				textNode.text(textarea.value);
				layer.draw();
				document.body.removeChild(textarea);
			}
		});
	})
	group1.add(circle);
	group1.add(textNode);
	layer.add(group1);
	stage.add(layer);
	allIdsforUndo.push(group1);
	modeforUndo.push(1);
}
function insert_arrow() {
	if (flag == 0) {
		alert("Add watermark first!!");
		return;
	}
	divElement = document.querySelector("#nav");
	elemHeight = divElement.offsetHeight;
	var x1, y1, x2, y2;
	var off_x = 0;
	var off_y = elemHeight;
	stage.addEventListener('click', function (e) {
		if (typeof x1 === 'undefined') {
			var ptr = stage.getPointerPosition();
			x1 = e.clientX;
			y1 = e.clientY - off_y;
		}
		else if (typeof x2 === 'undefined') {
			var ptr = stage.getPointerPosition();
			x2 = ptr.x;
			y2 = ptr.y;
			var arrow = new Konva.Line({
				points: [x1, y1, x2, y2],
				stroke: 'black',
				strokeWidth: 3,
				lineCap: 'butt',
				lineJoin: 'round',
				draggable: true
			});
			var group1 = new Konva.Group
				({
					draggable: true,
				});
			group1.add(arrow);
			layer.add(group1);
			stage.add(layer);
			allIdsforUndo.push(arrow);
			modeforUndo.push(1);
			arrow.on('click', function () {
				to_be_del = arrow;
			});
			remove()
		}
	});

	function remove() {
		stage.removeEventListener('click', function (e) { });
	}
}
function save() {
	if (srcneededwatermark != null) {
		var pdf = new jsPDF('l', 'pt', [stage.width(), stage.height()]);
		pdf.setTextColor('#000000');
		pdf.setFont("times", "bold");
		pdf.setFontSize(40);
		pdf.addImage(stage.toDataURL({ pixelRatio: 2 }), 0, 30, stage.width(), stage.height());
		pdf.text(title, width / 2, 30, 'center');
		savetitle = title + ".pdf";
		pdf.save(savetitle);
	}
	else {
		alert("Please add a watermark logo/image.")
	}
}
function change_align(mode) {
	if (mode == 0) {
		align = "left";
		document.getElementById("l").style.color = "#e2cc92";
		document.getElementById("l").style.backgroundColor = "#00486c";
		document.getElementById("c").style.color = "#00486c";
		document.getElementById("c").style.backgroundColor = "#e2cc92";
		document.getElementById("r").style.color = "#00486c";
		document.getElementById("r").style.backgroundColor = "#e2cc92";
	}
	if (mode == 1) {
		align = "center";
		document.getElementById("l").style.color = "#00486c";
		document.getElementById("l").style.backgroundColor = "#e2cc92";
		document.getElementById("c").style.color = "#e2cc92";
		document.getElementById("c").style.backgroundColor = "#00486c";
		document.getElementById("r").style.color = "#00486c";
		document.getElementById("r").style.backgroundColor = "#e2cc92";
	}
	if (mode == 2) {
		align = "right";
		document.getElementById("l").style.color = "#00486c";
		document.getElementById("l").style.backgroundColor = "#e2cc92";
		document.getElementById("c").style.color = "#00486c";
		document.getElementById("c").style.backgroundColor = "#e2cc92";
		document.getElementById("r").style.color = "#e2cc92";
		document.getElementById("r").style.backgroundColor = "#00486c";
	}
}
function undoFunc() {
	if (allIdsforUndo.length == 0) {
		alert('No Undo Available !');
	}

	else {
		var p = allIdsforUndo.pop();
		var q = modeforUndo.pop();
		var r;
		allIdsforRedo.push(p);
		if (q == 1) {
			while (trforUndo.length != 0) {
				r = trforUndo.pop();
				if (r != 'undefined' && r != null) {
					r.nodes([]);
				}
			}
			modeforRedo.push(2);
			p.hide();
		}
		else {
			modeforRedo.push(1);
			p.show();
		}
		layer.draw();
	}

}
function redoFunc() {
	if (allIdsforRedo.length == 0) {
		alert('No Redo Available !');
	}

	else {
		var p = allIdsforRedo.pop();
		var q = modeforRedo.pop();
		allIdsforUndo.push(p);
		if (q == 1) {
			p.hide();
			modeforUndo.push(2);
		}
		else {
			p.show();
			modeforUndo.push(1);
		}
		layer.draw();

	}
}
function del() {
	if (to_be_del != null) {
		allIdsforUndo.push(to_be_del);
		modeforUndo.push(2);
		if (to_be_del2 != null) {
			tr = to_be_del2;
			tr.nodes([]);
			layer.draw();
		}
		to_be_del.hide();
		layer.draw();
		to_be_del = null;
		to_be_del2 = null;
	}
	else {
		alert("Click an object to delete it!");
	}
}
function addtext() {
	if (flag == 0) {
		alert("Add watermark first!!");
		return;
	}
	var rectX = stage.width() / 2 - 50;
	var rectY = stage.height() / 2 - 25;
	var group1 = new Konva.Group
		({
			x: rectX,
			y: rectY,
			draggable: true,
		});
	var tr;
	group1.on('click', function () {
		to_be_del = group1;
		if (typeof tr === 'undefined' || tr.nodes().length == 0) {
			var MAX_WIDTH = 300;
			var MIN_WIDTH = 0;
			var MIN_HEIGHT = 0;
			tr = new Konva.Transformer({
				boundBoxFunc: function (oldBoundBox, newBoundBox) {
					// "boundBox" is an object with
					// x, y, width, height and rotation properties
					// transformer tool will try to fit nodes into that box
					// the logic is simple, if new width is too big
					// we will return previous state
					if (Math.abs(newBoundBox.width) > MAX_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.width <= MIN_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.height <= MIN_HEIGHT) {
						return oldBoundBox;
					}
					return newBoundBox;
				},
			});
			to_be_del2 = tr;
			layer.add(tr);
			tr.nodes([group1]);
			layer.draw();
		}
		else {
			tr.nodes([]);
			layer.draw();
		}
	});
	var textNode = new Konva.Text({
		text: 'Enter text',
		x: -2,
		y: -18,
		height: 80,
		width: 90,
		fill: text_col
	});
	textNode.align(`${align}`);
	textNode.on('dblclick', () => {
		// create textarea over canvas with absolute position
		// first we need to find position for textarea
		// to find it, at first lets find position of text node relative to the stage:
		var textPosition = textNode.getAbsolutePosition();
		// then lets find position of stage container on the page:
		var stageBox = stage.container().getBoundingClientRect();
		// so position of textarea will be the sum of positions above:
		var areaPosition = {
			x: stageBox.left + textPosition.x,
			y: stageBox.top + textPosition.y,
		};
		// create textarea and style it
		var textarea = document.createElement('textarea');
		document.body.appendChild(textarea);
		textarea.value = textNode.text();
		textarea.style.position = 'absolute';
		textarea.style.top = areaPosition.y + 'px';
		textarea.style.left = areaPosition.x + 'px';
		textarea.style.width = textNode.width();
		textarea.focus();
		textarea.addEventListener('keydown', function (e) {
			// hide the text area on enter
			if (e.keyCode === 13) {
				textNode.text(textarea.value);
				layer.draw();
				document.body.removeChild(textarea);
			}
		});
	})
	group1.add(textNode);
	layer.add(group1);
	stage.add(layer);
	allIdsforUndo.push(group1);
	modeforUndo.push(1);
}
function addImage() {
	var rectX = stage.width() / 2 - 50;
	var rectY = stage.height() / 2 - 25;
	var group1 = new Konva.Group({ draggable: true});

	group1.on('click', function () {
		to_be_del = group1;
		if (typeof tr === 'undefined' || tr.nodes().length == 0) {
			var MAX_WIDTH = 500;
			var MIN_WIDTH = 0;
			var MIN_HEIGHT = 0;
			tr = new Konva.Transformer({
				boundBoxFunc: function (oldBoundBox, newBoundBox) {
					// "boundBox" is an object with
					// x, y, width, height and rotation properties
					// transformer tool will try to fit nodes into that box
					// the logic is simple, if new width is too big
					// we will return previous state
					if (Math.abs(newBoundBox.width) > MAX_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.width <= MIN_WIDTH) {
						return oldBoundBox;
					}
					if (newBoundBox.height <= MIN_HEIGHT) {
						return oldBoundBox;
					}
					return newBoundBox;
				},
			});
			to_be_del2 = tr;
			trforUndo.push(tr);
			layer.add(tr);
			tr.nodes([group1]);
			layer.draw();
		}
		else {
			tr.nodes([]);
			layer.draw();
		}
	});
	var image = new Image();
	image.onload = function () {
		var img = new Konva.Image({ image: image });
		layer.add(img);
		stage.add(layer);
		stage.draw();
		group1.add(img);
	}
	image.src = srcneeded;
	layer.add(group1);
	stage.add(layer);
	allIdsforUndo.push(group1);
	modeforUndo.push(1);
	$("#upload").val("");
}
function addWatermark() {
	if (flag != 0) {
		alert("Watermark has been deployed! Refresh to change it")
		return;
	}
	flag = 1;
	var rectX = stage.width() / 2 - 50;
	var rectY = stage.height() / 2 - 25;
	var image = new Image();

	image.onload = function () {
		var img = new Konva.Image({
			image: image,
			x: rectX,
			y: rectY,
			width: Math.min(200, image.width),
			height: Math.min(200, image.width),
			opacity: 0.2
		});
		layer.add(img);
		stage.add(layer);
		stage.draw();
	}
	image.src = srcneededwatermark;
}