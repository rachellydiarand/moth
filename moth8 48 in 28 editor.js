// rand's html editor js

var elementArray = new Array();
var elementCount = 0;

var collisionDetectionArray = new Array();// lock step with elementArray

var draggingElementNum = -1;
var draggingElementIndex;// the array index, for collision detection
var isDragging = false;

var resizingLeft = false;
var resizingRight = false;
var resizingTop = false;
var resizingBottom = false;

var xProp;
var yProp;
var xDiff;
var yDiff;
var lastMouseX = 0;
var lastMouseY = 0;

function editorInit()
{
	$("#editorLeftSide").mousemove(function(e)
	{
		var xProp = e.pageX;// xProp = xProposal
		var yProp = e.pageY;
		
		//xProp = e.offsetX;
		//yProp = e.offsetY;
		
		//console.log("xn = " + xProp);
		
		xDiff = xProp - lastMouseX;
		yDiff = yProp - lastMouseY;
		
		lastMouseX = xProp;
		lastMouseY = yProp;
		
		doMouseMove();
	});
	
	$("#editorLeftSide").on("touchmove", function(e)
	{
		usingTouch = true;
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
  		var elm = $(this).offset();
		
		var xProp = touch.pageX;// xProp = xProposal
		var yProp = touch.pageY;
		
		e.preventDefault();
		
		//xProp = touch.offsetX;
		//yProp = touch.offsetY;
		
		//alert(xProp);
		
		xDiff = xProp - lastMouseX;
		yDiff = yProp - lastMouseY;
		
		lastMouseX = xProp;
		lastMouseY = yProp;
		
		doMouseMove();
	});
	
	document.addEventListener("mouseup", doStageMouseUp);
	document.addEventListener("touchend", doStageMouseUp);
}

function coordInt(css)
{
	return Number(css.replace("px", ""));
}

var elementImageQ = "";

function addElementImage()
{
	//alert("addImage()");
	if(elementImageQ == "") return;
	//alert('adding image....');
	var str = '<img src="/moth/' + elementImageQ + '" style="max-height: 100%; max-width: 100%" />';
	$("#element-" + elementCount + "-content").append(str);
	return;
	$("#element-" + elementCount + "-content").css('background-image', elementImageQ);
	$("#element-" + elementCount + "-content").css('background-size', "contain");
	$("#element-" + elementCount + "-content").css('height', $('#elementOverlay-' + elementCount).css('height'));
}


function addElement()
{
	//alert("addElement");
	var x = parseInt($("#newElementX").val());
	var y = parseInt($("#newElementY").val());
	var w = parseInt($("#newElementWidth").val());
	var h = parseInt($("#newElementHeight").val());
	var letter =  $("#newElementLetter").val().toUpperCase();
	elementImageQ = '/images/moth48/MOTH48' + letter + '.png';
	
	elementCount++;
	
	var str = '<div id="element-' + elementCount + '" elementNum="' + elementCount + '" class="leftSideElement noselect" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;" onmousedown="javascript: domousedown(this);" onmouseup="javascript: domouseup(this);" ontouchstart="javascript: dotouchstart(this, event);" ontouchend="javascript: domouseup(this);">';
	
	str += '<div id="element-' + elementCount + '-content"></div>';
	
	str += '<div id="elementOverlay-' + elementCount + '" class="elementOverlay"></div>';
	
	str += '</div>';
	
	var obj = new Object();
	obj.id = elementCount;
	obj.type = "text";
	obj.constrainProportions = false;
	obj.resizeImage = true;
	obj.image = elementImageQ;
	
	var cdObj = collisionDetectionObject("element-" + elementCount);	
	collisionDetectionArray.push(cdObj);
	obj.cdObj = cdObj;
	
	elementArray.push([elementCount, obj]);
	
	$("#editorLeftSide").append(str);
	
	addElementImage();
	return;
	setTimeout(addElementImage, 500);
}

function updateElement()
{
	if(draggingElementNum != -1)
	{		
		var x = parseInt($("#newElementX").val());
		var y = parseInt($("#newElementY").val());
		var w = parseInt($("#newElementWidth").val());
		var h = parseInt($("#newElementHeight").val());
		
		$("#element-" + draggingElementNum).css("left", x + "px");
		$("#element-" + draggingElementNum).css("top", y + "px");
		$("#element-" + draggingElementNum).css("width", w + "px");
		$("#element-" + draggingElementNum).css("height", h + "px");
		
		refreshResizingHandles();
	}
}

function domousedown(elem)
{
	$(".elementOverlay").removeClass("elementOverlaySelected");
	
	for(var a = 0; a < elementArray.length; a++)
	{
		if($(elem).attr("elementNum") == elementArray[a][0])
		{
			draggingElementNum = elementArray[a][0];
			draggingElementIndex = a;
			$("#elementOverlay-" + draggingElementNum).addClass("elementOverlaySelected");
			isDragging = true;
			$(".resizingHandle").show();
			refreshResizingHandles();
			
			//$("#tinymceHolder").hide();
			
			/*
			if(elementArray[a][1].type == "text")
			{
				tinymce.get('tinymceText').setContent($("#element-" + draggingElementNum + "-content").html());
				$("#tinymceHolder").show();
			}
			*/
		}
		else
		{
			
		}
	}
	
	
}

function dotouchstart(elem, e)
{
	var xProp = e.pageX;// xProp = xProposal
	var yProp = e.pageY;
	
	//xProp = e.offsetX;
	//yProp = e.offsetY;
	
	//console.log("xn = " + xProp);
	
	xDiff = xProp - lastMouseX;
	yDiff = yProp - lastMouseY;
	
	lastMouseX = xProp;
	lastMouseY = yProp;
	
	domousedown(elem);
}

function domouseup(elem)
{
	isDragging = false;
}

function doStageMouseUp()
{
	isDragging = false;
	resizingLeft = false;
	resizingRight = false;
	resizingTop = false;
	resizingBottom = false;
}

function doMouseMove()
{
	//console.log("xDiff = " + xDiff);
	
	if(resizingLeft)
	{
		if(xDiff > 0)
		{
			$("#element-" + draggingElementNum).width($("#element-" + draggingElementNum).width() + (-1 * xDiff));
			$("#element-" + draggingElementNum).css("left", (coordInt($("#element-" + draggingElementNum).css("left")) + xDiff) + "px");
		}
		else
		{
			var startX = coordInt($("#element-" + draggingElementNum).css("left"));
			var collision = detectCollision(collisionDetectionArray[draggingElementIndex],xDiff,0,collisionDetectionArray,"slide");
			var endX = coordInt($("#element-" + draggingElementNum).css("left"));
			var diff = startX - endX;
			
			$("#element-" + draggingElementNum).css("left", startX + "px");
			
			$("#element-" + draggingElementNum).width($("#element-" + draggingElementNum).width() + diff);
			$("#element-" + draggingElementNum).css("left", (coordInt($("#element-" + draggingElementNum).css("left")) - diff) + "px");
		}
			
		refreshResizingHandles();
		refreshContents();
	}
	else if(resizingRight)
	{
		if(xDiff > 0)
		{
			var startX = coordInt($("#element-" + draggingElementNum).css("left"));
			var collision = detectCollision(collisionDetectionArray[draggingElementIndex],xDiff,0,collisionDetectionArray,"slide");
			var endX = coordInt($("#element-" + draggingElementNum).css("left"));
			var diff = startX - endX;
			
			$("#element-" + draggingElementNum).css("left", startX + "px");
			$("#element-" + draggingElementNum).width($("#element-" + draggingElementNum).width() - diff);
		}
		else
		{
			$("#element-" + draggingElementNum).width($("#element-" + draggingElementNum).width() + xDiff);
		}
		refreshResizingHandles();
		refreshContents();
	}
	else if(resizingTop)
	{
		if(yDiff > 0)
		{
			$("#element-" + draggingElementNum).height($("#element-" + draggingElementNum).height() + (-1 * yDiff));
			$("#element-" + draggingElementNum).css("top", (coordInt($("#element-" + draggingElementNum).css("top")) + yDiff) + "px");
		}
		else
		{
			var startY = coordInt($("#element-" + draggingElementNum).css("top"));
			var collision = detectCollision(collisionDetectionArray[draggingElementIndex],0,yDiff,collisionDetectionArray,"slide");
			var endY = coordInt($("#element-" + draggingElementNum).css("top"));
			var diff = startY - endY;
			
			$("#element-" + draggingElementNum).css("top", startY + "px");
			
			$("#element-" + draggingElementNum).height($("#element-" + draggingElementNum).height() + diff);
			$("#element-" + draggingElementNum).css("top", (coordInt($("#element-" + draggingElementNum).css("top")) - diff) + "px");
		}
		
		
		refreshResizingHandles();
		refreshContents();
	}
	else if(resizingBottom)
	{
		if(yDiff > 0)
		{
			var startY = coordInt($("#element-" + draggingElementNum).css("top"));
			var collision = detectCollision(collisionDetectionArray[draggingElementIndex],0,yDiff,collisionDetectionArray,"slide");
			var endY = coordInt($("#element-" + draggingElementNum).css("top"));
			var diff = startY - endY;
			
			$("#element-" + draggingElementNum).css("top", startY + "px");
			$("#element-" + draggingElementNum).height($("#element-" + draggingElementNum).height() - diff);
		}
		else
		{
			$("#element-" + draggingElementNum).height($("#element-" + draggingElementNum).height() + yDiff);
		}
		refreshResizingHandles();
		refreshContents();
	}
	else if(isDragging)
	{
		//var x = coordInt($("#element-" + draggingElementNum).css("left"));
		//var y = coordInt($("#element-" + draggingElementNum).css("top"));
		//$("#element-" + draggingElementNum).css("left", (x + xDiff) + "px");
		//$("#element-" + draggingElementNum).css("top", (y + yDiff) + "px");
		detectCollision(collisionDetectionArray[draggingElementIndex],xDiff,yDiff,collisionDetectionArray,"slide");
		refreshResizingHandles();
	}
	
	
}

function refreshResizingHandles()
{
	if(draggingElementNum != -1)
	{
		var obj = collisionDetectionArray[draggingElementIndex];
		var handleW = $("#leftResizingHandle").width();
		var handleH = $("#leftResizingHandle").height();
		
		$("#leftResizingHandle").css("left", (obj.x()) + "px");
		$("#leftResizingHandle").css("top", (obj.y() + ((obj.height() - (handleH / 2)) / 2)) + "px");
		
		$("#rightResizingHandle").css("left", (obj.x() + obj.width() - handleW - 2) + "px");
		$("#rightResizingHandle").css("top", (obj.y() + ((obj.height() - (handleH / 2)) / 2)) + "px");
		
		$("#topResizingHandle").css("left", (obj.x() + (obj.width() / 2) - (handleW / 2) - 2) + "px");
		$("#topResizingHandle").css("top", (obj.y()) + "px");
		
		$("#bottomResizingHandle").css("left", (obj.x() + (obj.width() / 2) - (handleW / 2) - 2) + "px");
		$("#bottomResizingHandle").css("top", (obj.y() + obj.height() - handleH - 2) + "px");
		
		$("#newElementX").val(obj.x());
		$("#newElementY").val(obj.y());
		$("#newElementWidth").val(obj.width());
		$("#newElementHeight").val(obj.height());
		
	}
}

function doLeftResizingHandleClick()
{
	resizingLeft = true;
}

function doRightResizingHandleClick()
{
	resizingRight = true;
}

function doTopResizingHandleClick()
{
	resizingTop = true;
}

function doBottomResizingHandleClick()
{
	resizingBottom = true;
}

function doEditorOnChange()
{
	//alert(tinymce.activeEditor.getContent());
	
	if(draggingElementNum != -1)
	{
		$("#element-" + draggingElementNum + "-content").html(tinymce.get("tinymceText").getContent());
	}
}