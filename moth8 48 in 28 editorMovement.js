// rand's html editor js

var selectedType = "text";

function getDraggingElementSettingsObject()
{
	if(draggingElementNum != -1)
	{
		for(var a = 0; a < elementArray.length; a++)
		{
			if(elementArray[a][0] == draggingElementNum)
			{
				return elementArray[a][1];
			}
		}
	}
	return null;
}

function doTextButtonClick()
{
	$(".imageTextButton").removeClass("imageTextButtonSelected");
	$("#textButton").addClass("imageTextButtonSelected");
	
	$("#tinymceHolder").show();
	$("#imageSettingsHolder").hide();
	
	var obj = getDraggingElementSettingsObject();
	if(obj != null)
	{
		obj.type = "text";
	}
}

function doImageButtonClick()
{
	$(".imageTextButton").removeClass("imageTextButtonSelected");
	$("#imageButton").addClass("imageTextButtonSelected");
	
	$("#tinymceHolder").hide();
	$("#imageSettingsHolder").show();
	
	var obj = getDraggingElementSettingsObject();
	if(obj != null)
	{
		obj.type = "image";
	}
}

function refreshContents()
{
	var obj = getDraggingElementSettingsObject();
	if(obj != null)
	{
		if(obj.type == "image")
		{
			if(obj.resizeImage)
			{
				var obj2 = collisionDetectionArray[draggingElementIndex];
				
				$("#innerImage-" + draggingElementNum).attr("width", obj2.width());
				
				if(!obj.constrainProportions)
				{
					$("#innerImage-" + draggingElementNum).attr("height", obj2.height());
				}
			}
		}
	}
}

function uploadImage()
{
	var formData = new FormData();
	formData.append('fileData', $('#file')[0].files[0]);
	
	$.ajax(
	{
		type: 'POST',
		url: imageUploadURL,
		data: formData,
		processData: false,
		contentType: false,
		enctype: 'multipart/form-data',
		xhr: function()
		{
			var xhr = $.ajaxSettings.xhr();
			/*
			xhr.onprogress = function e()
			{
				// For downloads
				if (e.lengthComputable) {
					console.log(e.loaded / e.total);
					mp3progress = e.loaded / e.total;
					updateMP3ProgressBar();
				}
			};
        	xhr.upload.onprogress = function (e)
			{
				// For uploads
				if (e.lengthComputable) {
					console.log(e.loaded / e.total);
					mp3progress = e.loaded / e.total;
					updateMP3ProgressBar();
				}
        	};
			*/
        	return xhr;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown)
		{
			//nextScreen('screen10uploadError');
		}
	}).done(function(str)
	{
		$("#element-" + draggingElementNum + "-content").html('<img id="innerImage-' + draggingElementNum + '" src="' + imageUploadDirectory + str + '" height="' + coordInt($("#element-" + draggingElementNum).css("height")) + '" />');
	});
}

function spanNum(startPos, endPos, array)
{
	var count = 0;
	var hit = false;
	var lastPos = -9999;
	for(var a = 0; a < array.length; a++)
	{
		if(array[a] == startPos) hit = true;
		
		if(array[a] == endPos)
		{
			return count;
		}
		if(hit)
		{
			if(array[a] != lastPos)
			{
				count++;
			}
		}
		
		lastPos = array[a];
	}
	
	return count;
}

function hasElement(x, y, elements)
{
	var obj;
	
	for(var a = 0; a < elements.length; a++)
	{
		obj = elementArray[a][1].cdObj;
		if(obj.x() == x && obj.y() == y) return elementArray[a];
	}
	
	return false;
}	

function inElement(x, y, w, h, elementArray)
{
	var obj;
	
	for(var a = 0; a < elementArray.length; a++)
	{
		obj = elementArray[a][1].cdObj;
		if(x >= obj.x() && x + w <= obj.x() + obj.width() && y >= obj.y() && y + h <= obj.y() + obj.height())
		{
			return true;
		}
	}
	
	return false;
}

function makeTableLayout()
{
	var colArray = new Array();
	var rowArray = new Array();
	var obj;
	
	colArray.push(0);// starting from the beginning
	rowArray.push(0);
	for(var a = 0; a < elementArray.length; a++)
	{
		obj = elementArray[a][1].cdObj;
		colArray.push(obj.x());
		colArray.push(obj.x() + obj.width());
		
		rowArray.push(obj.y());
		rowArray.push(obj.y() + obj.height());
	}
	
	colArray.sort(function(a, b){return a - b});
	rowArray.sort(function(a, b){return a - b});
	
	//alert(colArray.join(","));
	//alert(rowArray.join(","));
	
	var canvas = document.getElementById("tablePreviewCanvas");
	var ctx = canvas.getContext('2d');
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.strokeStyle = "blue";
	for(a = 0; a < colArray.length; a++)
	{
		ctx.beginPath();
		ctx.setLineDash([5, 15]);
		ctx.moveTo(colArray[a], 0);
		ctx.lineTo(colArray[a], canvas.height);
		ctx.stroke();
	}
	
	ctx.strokeStyle = "green";
	for(a = 0; a < rowArray.length; a++)
	{
		ctx.beginPath();
		ctx.setLineDash([5, 15]);
		ctx.moveTo(0, rowArray[a]);
		ctx.lineTo(canvas.width, rowArray[a]);
		ctx.stroke();
	}
	
	var colSpan;
	var rowSpan;
	var w;
	var h;
	var tableStr = '<table border="0" cellspacing="0" cellpadding="0">';
	var col;
	var row;
	var addedRow = false;// rows with no height will be passed over
	
	tableStr += '<tr>';//header row
	
	for(col = 0; col < colArray.length; col++)
	{
		h = 1;
		if(col == colArray.length - 1)
		{
			w = 700 - colArray[col];
		}
		else
		{
			w = colArray[col + 1] - colArray[col];
		}	
		
		tableStr += '<td width="' + w + '" height="' + h + '"></td>';
	}
	
	tableStr += '</tr>';
	
	for(row = 0; row < rowArray.length; row++)
	{
		addedRow = false;
		isColSpanning = false;
		for(col = 0; col < colArray.length; col++)
		{
			if(row == rowArray.length - 1)
			{
				h = 905 - rowArray[row];
			}
			else
			{
				h = rowArray[row + 1] - rowArray[row];
			}
			
			if(col == colArray.length - 1)
			{
				w = 700 - colArray[col];
			}
			else
			{
				w = colArray[col + 1] - colArray[col];
			}
			
			if(w == 0 || h == 0) continue;
			if(!addedRow)
			{
				addedRow = true;
				tableStr += '<tr>';
			}
			
			
			var objMaster = hasElement(colArray[col], rowArray[row], elementArray);
			if(objMaster === false)
			{
				//alert('no obj');
				if(!inElement(colArray[col], rowArray[row], w, h, elementArray))
				{ 
					tableStr += '<td width="' + w + '" height="' + h + '"></td>';
				}
				else
				{
					//alert('hit');
				}
			}
			else
			{
				obj = objMaster[1].cdObj;
				colSpan = spanNum(obj.x(), obj.x() + obj.width(), colArray);
				rowSpan = spanNum(obj.y(), obj.y() + obj.height(), rowArray);
				//alert(colSpan + ", " + rowSpan);
				tableStr += '<td width="' + w + '" height="' + h + '" colspan="' + colSpan + '" rowspan="' + rowSpan + '">' + $("#element-" + objMaster[0] + '-content').html() + '</td>';
			}
		}
		
		if(addedRow)
		{
			tableStr += '</tr>';
		}
	}
		
	tableStr += '</table>';
	//alert(tableStr);
	
	var elmArr = new Array();
	for(var a = 0; a < elementArray.length; a++)
	{
		var obj = new Object();
		var id = elementArray[a][1].cdObj.id;
		//alert(JSON.stringify($("#" + id)));
		obj.x = $("#" + id).css("left");
		obj.y = $("#" + id).css("top");
		obj.w = $("#" + id).css("width");
		obj.h = $("#" + id).css("height");
		obj.image = elementArray[a][1].image;
		elmArr.push(obj);
	}
	
	alert(JSON.stringify(elmArr));
	
	$("#tablePreviewCanvas").show();
	
	return;
	
	// we just need to email the table str now
	$.post(submitEmailURL, { tableStr: tableStr, sendToEmail: $("#sendToEmail").val() }, function(pStr)
	{
		
	});
	
	
}