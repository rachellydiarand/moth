var rd = 180/Math.PI;
var dg = Math.PI/180;
var padding=0;

function collisionDetectionObject(pId)
{
	var obj = new Object();
	obj.id = pId;
	obj.name = pId;
	obj.mX = -9999;
	obj.mY = -9999;
	
	obj.getBounds = function()
	{
		var obj2 = document.getElementById(this.id).getBoundingClientRect();
		// microsoft edge does not report x/y
		if(typeof obj2.x === 'undefined') obj2.x = obj2.left;
		if(typeof obj2.y == 'undefined') obj2.y = obj2.top;
		//alert(obj2.x);
		return obj2;
	}
	
	obj.width = function()
	{
		return this.getBounds().width;
	}
	
	obj.height = function()
	{
		return this.getBounds().height;
	}
	
	obj.x = function()
	{
		if(true || this.mX == -9999)
		{
			var n = Number(document.getElementById(this.id).style.left.replace("px", ""));
			this.mX = n;
			return n;
		}
		else
		{
			return this.mX;
		}
	}
	
	obj.setX = function(n)
	{
		this.mX = n;
		document.getElementById(this.id).style.left = n + "px";
	}
	
	obj.y = function()
	{
		if(true || this.mY == -9999)
		{
			var n = Number(document.getElementById(this.id).style.top.replace("px", ""));
			this.mY = n;
			return n;
		}
		else
		{
			return this.mY;
		}
	}
	
	obj.setY = function(n)
	{
		this.mY = n;
		document.getElementById(this.id).style.top = n + "px";
	}
	
	return obj;
}

function detectCollision(dragging,x1,y1,objects,pReboundType)
{
	var reboundType = (typeof pReboundType === 'undefined' ? 'rebound' : pReboundType);
	y1 *= -1;//standard position
	var degrees = Math.atan2(y1,x1)*rd;
	var speed = Math.sqrt((y1 * y1) + (x1 * x1));
	var returnArray = detectCollisionDegrees(dragging,degrees,speed,objects,reboundType);
	return(returnArray);
}

function detectCollisionDegrees(dragging,degrees,speed,objects,pReboundType)
{	
	var reboundType = (typeof pReboundType === 'undefined' ? 'rebound' : pReboundType);
	if(degrees>360){
		do{
			degrees-=360;
		}while(degrees>360);
	}
	if(degrees<0){
		do{
			degrees+=360;
		}while(degrees<0);
	}
	
	
	var x1;
	var y1;
	
	var oldX=dragging.x();
	var oldY=dragging.y();
	var absX=Math.abs(Math.cos(degrees*dg)*speed);
	var absY=Math.abs(Math.sin(degrees*dg)*speed);
	
	var collision=getCollision(dragging,degrees,speed,objects);
	//trace("first collision");
	if(collision[0]==true){
		
		dragging.setX(dragging.x()+collision[1][1]);
		dragging.setY(dragging.y()+collision[1][2]);
		
		/*
		var hitting=isHitTest(dragging,collision[1][0],objects);
		if(hitting){
			//trace("hitting");
			if(side==1||side==3){
				dragging.y-=collision[1][2];
			}
			else{
				dragging.x-=collision[1][1];
			}
		}
		*/
		if(reboundType=="slide"){
			
			var side=collision[1][5];
			
			
			//set new speed
			speed-=collision[1][3];
			
			x1=Math.abs(Math.cos(degrees*dg)*collision[1][3]);
			y1=Math.abs(Math.sin(degrees*dg)*collision[1][3]);
			
			if(side==1||side==3){
				speed=absY-y1;
			}
			else{
				speed=absX-x1;
			}
			
			var quad=findQuad(degrees);
			var slide=0;
			switch(side){
				case 1:
					if(quad==1){
						slide=2;
					}
					else{
						slide=4;
					}
					break;
				case 2:
					if(quad==1){
						slide=1;
					}
					else{
						slide=3;
					}
					break;
				case 3:
					if(quad==2){
						slide=2;
					}
					else{
						slide=4;
					}
					break;
				case 4:
					if(quad==3){
						slide=3;
					}
					else{
						slide=1;
					}
					break;
				default:
					trace("broken slide");
			}
			
			switch(slide){
				case 1:
					degrees=0;
					break;
				case 2:
					degrees=90;
					break;
				case 3:
					degrees=180;
					break;
				case 4:
					degrees=270;
					break;
			}
			var collision2=getCollision(dragging,degrees,speed,objects,true);
			if(collision2[0]==true){
				//trace("2nd collision");
				
				if(slide==1||slide==3){
					//dragging.x+=collision2[1][1];
					dragging.setX(dragging.x() + collision2[1][1]);
				}
				else{
					//dragging.y+=collision2[1][2];
					dragging.setY(dragging.y() + collision2[1][2]);
				}
				
			}
			else{
				
				//no 2nd hit
				x1=Math.cos(degrees*dg)*speed;
				y1=(Math.sin(degrees*dg)*speed)*-1;
				
				dragging.setX(dragging.x()+x1);
				dragging.setY(dragging.y()+y1);
				
				
				var bM=dragging.getBounds();//boundsMoving
				var bS=collision[1][0].getBounds();//boundsStatic
				var g=0;
				var hit=false;
				x1=0;
				y1=0;
				switch(slide){
					case 1:
						if(bM.x>bS.x+bS.width){
							g=bM.x-(bS.x+bS.width);
							x1=-1*g;	
							hit=true;
						}
						break;
					case 2:
						if(bM.y+bM.height<bS.y){
							g=bS.y-(bM.y+bM.height);
							y1=g;
							hit=true;
						}
						break;
					case 3:
						if(bM.x+bM.width<bS.x){
							g=bS.x-(bM.x+bM.width);
							x1=g;
							hit=true;
						}
						break;
					case 4:
						if(bM.y>bS.y+bS.height){
							g=bM.y-(bS.y+bS.height);
							y1=-1*g;
							hit=true;
						}
						break;
				}
				/*
				if(hit){
					trace("hit");
					var d=0;
					switch(side){
						case 1:
							d=0;
							break;
						case 2:
							d=90;
							break;
						case 3:
							d=180;
							break;
						case 4:
							d=270;
							break;
					}
					var collision3=getCollision(dragging,d,.01,objects);
					if(collision3[0]){
						
						dragging.x+=collision3[1][1];
						dragging.y+=collision3[1][2];
						
					}
				}
							*/
				//collision2[1][3]-=g;
				
				
				dragging.setX(dragging.x()+x1);
				dragging.setY(dragging.y()+y1);
				
			}
		}
	}
	else{
		//didn't hit anything
		//console.log("didn't hit anything");
		x1=Math.cos(degrees*dg)*speed;
		y1=(Math.sin(degrees*dg)*speed)*-1;
		
		//alert("x1 = " + dragging.x());
		
		dragging.setX(dragging.x()+x1);
		dragging.setY(dragging.y()+y1);
		
	}
	if(collision[0]==true&&reboundType=="slide"){
		return(collision.concat(collision2));
	}
	else{
		return(collision);
	}
}

function isHitTest(dragging,hitting,objects){
	return false;
    /*
	var obj;
	for(var a=0;a<objects.length;a++){
		obj=objects[a];
		if(obj!=dragging&&obj!=hitting){
			if(obj.hitTestObject(dragging)){
				return(true);
			}
		}
	}
	return(false);
    */
}
function findQuad(tD){
	var quad=0;
	if(tD<0){
		tD+=360;
	}
	if(tD<90){
		quad=1;
	}
	else if(tD<180){
		quad=2;
	}
	else if(tD<270){
		quad=3;
	}
	else{
		quad=4;
	}
	return(quad);
}

function getCollision(dragging,degrees,speed,objects,pSliding){
	
	var sliding = (typeof pSliding === 'undefined' ? false : sliding);
	var bounds=dragging.getBounds();
	
	var xN;
	var yN;
	var wN;
	var hN;			
	
	var tD=degrees;
	var tV;
	
	var hitArray=new Array();
	var tempArray;
	var a;
	var b;
	var c;
	var g;
	var quad;
	var side;
	var xB;
	var yB;
	var wB;
	var hB;
	var hit;
	var low;
	var high;
	var tD2;
	var x1;
	var y1;
	var rebound;
	var q;
	var bounds2;
	var temper=.3;
	var x2;
	var y2;


	for (var p=0;p<objects.length; p++)
	{
		if (objects[p] != dragging)
		{
			
			tV=speed;
			
			xN=bounds.x+(bounds.width/2);
			yN=bounds.y+(bounds.height/2);
			wN=bounds.width/2;
			hN=bounds.height/2;
			
			x2=Math.cos((tD-180)*dg)*temper;
			y2=(Math.sin((tD-180)*dg)*temper)*-1;
			
			xN+=x2;
			yN+=y2;
			
			tV+=temper;
			
			bounds2=objects[p].getBounds();
			
			xB = bounds2.x+(bounds2.width/2);
			yB = bounds2.y+(bounds2.height/2);
			wB = (bounds2.width/2)+(2*padding);
			hB = (bounds2.height/2)+(2*padding);
			
			if(sliding){
				if(tD==0){
					//side=1;
				}
				if(tD==90){
					//side=2;
				}
				if(tD==180||tD==-180){
					//side=3;
				}
				if(tD==270||tD==-90){
					//side=4;
				}
			}
			
			hit=true;
			if((bounds2.x+bounds2.width+tV)<bounds.x)hit=false;
			if((bounds2.y+bounds2.height+tV)<bounds.y)hit=false;
			if((bounds.x+bounds.width+tV)<bounds2.x)hit=false;
			if((bounds.y+bounds.height+tV)<bounds2.y)hit=false;
			
			
			
			if (hit)
			{
				quad = 0;
				side = 0;
				
									
				
				if (yB + hB < yN - hN && xN + wN < xB - wB)
				{
					quad = 1;
				} // end if
				if (yB + hB < yN - hN && xB + wB < xN - wN)
				{
					quad = 2;

				} // end if
				if (yN + hN < yB - hB && xB + wB < xN - wN)
				{
					quad = 3;
				} // end if
				if (yN + hN < yB - hB && xN + wN < xB - wB)
				{
					quad = 4;
				} // end if
				
				
				//trace(quad);
				
				if (quad == 0)
				{
					if (xN + wN <= xB - wB)
					{
						side = 1;
					} // end if
					if (yB + hB <= yN - hN)
					{
						side = 2;
					} // end if
					if (xB + wB < xN - wN)
					{
						side = 3;
					} // end if
					if (yN + hN <= yB - hB)
					{
						side = 4;
					} // end if
				} // end if
				if (quad == 1)
				{
					//xN-=.0001;
					//yN+=.0001;
					//trace ("quad 1");
					a=(yN-hN)-(yB+hB);
					b=(xB-wB)-(xN+wN);
					tD2=Math.atan2(a,b)*rd;
					if(tD==tD2){
						
						tD-=1;
						if(tD<=0){
							tD+=2;
						}
					}
					if(tD<tD2){
						side=2;
					}
					else{
						side=1;
					}
				} // end if
				if (quad == 2)
				{
					//xN+=.0001;
					//yN+=.0001;
					//trace ("quad 2");
					a=(yN-hN)-(yB+hB);
					b=(xB+wB)-(xN-wN);
					tD2=Math.atan2(a,b)*rd;
					if(tD==tD2){
						
						tD-=1;
						if(tD<=90){
							tD+=2;
						}
					}
					if(tD<tD2){
						side=3;
					}
					else{
						side=2;
					}
					
				} // end if
				if (quad == 3)
				{
					//xN+=.0001;
					//yN-=.0001;
					
					a=(yB-hB)-(yN+hN);
					b=(xB+wB)-(xN-wN);
					tD2=Math.atan2(a*-1,b)*rd;
					if(tD2<=0){
						tD2+=360;							}
					
					if(tD==tD2){
						
						tD-=1;
						if(tD<=180){
							tD+=2;
						}
					}
					if(tD2<tD){
						side=3;
					}
					else{
						side=4;
					}
					
					
				} // end if
				if (quad == 4)
				{
					//xN-=.0001;
					//yN-=.0001;
					//trace ("quad 4");
					a=(yN+hN)-(yB-hB);
					b=(xB-wB)-(xN+wN);
					tD2=(Math.atan2(a,b)*rd)+360;
					if(tD==tD2){
						tD-=1;
						if(tD<=270){
							tD+=2;
						}
					}
					if(tD<tD2){
						side=1;
					}
					else{
						side=4;
					}
				} // end if
				
				
				if(objects[p].name=="object4"){
					//trace("side",side,tD,quad);
				}
				
				
				
				if (side == 1)
				{
					
					//trace ("side 1");
					a = yN - hN - (yB + hB);
					b = (xN + wN - (xB - wB)) * -1;
					low = Math.atan2(a, b) * rd;
					a = yN + hN - (yB - hB);
					high = Math.atan2(a, b) * rd;
					tD2 = tD;
					if (tD2 > 180)
					{
						tD2 = tD2 - 360;
					} // end if
					if (low < tD2 && tD2 < high)
					{
						g = 1 / Math.cos(tD * dg) * b;
						if (tV >= g)
						{
							g = 1 / Math.cos(tD*dg)*(b+x2);
																
							x1=Math.cos(tD * dg) * (g);
							y1=Math.sin(tD * dg) * (g);
							if (tD2 < 0)
							{
								rebound= tD - (180 - 2 * (tD2 * -1));
							}
							else
							{
								rebound= tD + (180 - 2 * tD);
							} // end if
							tempArray=new Array(objects[p],x1,y1,g,rebound,side);
							hitArray.push(tempArray);
						} // end if
					} // end if
				} // end else if
				
				if (side == 2)
				{
					
					//trace ("side 2");
					a = yN - hN - (yB + hB);
					b = (xN - wN - (xB + wB)) * -1;
					low = Math.atan2(a, b) * rd;
					b = (xN + wN - (xB - wB)) * -1;
					high = Math.atan2(a, b) * rd;
					
					if (low < tD && tD < high)
					{
						
						g = 1 / Math.sin(tD * dg) * a;
						if (tV >= g)
						{
							g = 1 / Math.sin(tD*dg)*(a-y2);
							x1= Math.cos(tD * dg) * (g);
							y1= (Math.sin(tD * dg) * (g))*-1;
							if (tD < 90)
							{
								rebound= tD - 2 * tD;
							}
							else
							{
								rebound= tD + (180 - 2 * (tD - 90));
							} // end if
							tempArray=new Array(objects[p],x1,y1,g,rebound,side);
							hitArray.push(tempArray);
						} // end if
					} // end if
				} // end else if
				if (side == 3)
				{
					
					//trace ("side 3");
					a = yN + hN - (yB - hB);
					b = (xN - wN - (xB + wB)) * -1;
					low = Math.atan2(a, b) * rd;
					if (low < 0)
					{
						low = low + 360;
					} // end if
					a = yN - hN - (yB + hB);
					high = Math.atan2(a, b) * rd;
					if (high < 0)
					{
						high = high + 360;
					} // end if
					
					
					if (low <= tD && tD < high)
					{
						
						g = 1 / Math.cos(tD * dg) * b;
						if (tV >= g)
						{
							g= 1 / Math.cos(tD*dg) * (b+x2);
							x1= Math.cos(tD * dg) * (g);
							y1= Math.sin(tD * dg) * (g);
							
							if (tD < 180)
							{
								rebound= tD - (180 - 2 * (180 - tD));
							}
							else
							{
								rebound= tD + (180 - 2 * (tD - 180));
							} // end if
							
							if(quad==3){
								y1-=1;
							}
							
							tempArray=new Array(objects[p],x1,y1,g,rebound,side);
							hitArray.push(tempArray);
						} // end if
					} // end if
				} // end else if
				if (side == 4)
				{
					
					//trace ("side 4");
					a = yN + hN - (yB - hB);
					b = (xN + wN - (xB - wB)) * -1;
					low = Math.atan2(a, b) * rd;
					b = (xN - wN - (xB + wB)) * -1;
					high = Math.atan2(a, b) * rd;
					
					if (low <= 0)
					{
						low = low + 360;
					} // end if
					if (high <= 0)
					{
						high = high + 360;
					} // end if
					
					
					
					
					if (low < tD && tD < high)
					{
						
						g = 1 / Math.sin(tD * dg) * a;
						if (tV >= g)
						{
							g=1/Math.sin(tD*dg)* (a-y2);
							x1= Math.cos(tD * dg) * (g);
							y1= (Math.sin(tD * dg) * (g))*-1;
							
							if (tD < 270)
							{
								rebound= tD - (180 - 2 * (270 - tD));
								
							} // end if
							else{
								rebound= tD + (180 - 2 * (tD - 270));
							}
							
							tempArray=new Array(objects[p],x1,y1,g,rebound,side);
							hitArray.push(tempArray);
						} // end if
					} // end if
				} // end if
			} // end if
		} // end if
	} // end of for
	var winner;
	var winNum;
	var n;
	if (hitArray.length > 0)
	{
		winner = 100000;
		for (p = 0; p < hitArray.length; p++)
		{
			if(hitArray[p][3]<winner)
			{
				winner = hitArray[p][3]
				winNum = p;
			} // end if
		} // end of for
		n=new Array(true,hitArray[winNum]);
		return(n);
	} // end if
	else{
		n=new Array(false,false);
		return(n);
	}
}
function detectCollisionCircle(dragging, degrees, speed, objects, rectObjects)
{
	//var rectObject = (
	
	
	if(degrees<0){
		do{
			degrees+=360;
		}while(degrees<0);
	}
	if(degrees>360){
		do{
			degrees-=360;
		}while(degrees>360);
	}
	
	var oldX=dragging.x;
	var oldY=dragging.y;
	var collision=getCollisionCircle(dragging,degrees,speed,objects);
	//var collision2=getCollision(dragging,degrees,speed,rectObjects);
	var collision2 = new Array(false);
	
	var hitWall=false;
	var hitCircle=false;
	if(collision2[0]==true){
		if(collision[0]==true){
			if(collision2[1][3]<=collision[1][3]){
				//hit wall
				hitWall=true;
			}
			else{
				hitCircle=true;
			}
		}
		else{
			//hit wall
			hitWall=true;
		}
	}
	else{
		if(collision[0]==true){
			hitCircle=true;
		}
	}
	
	if(hitWall){
						
		dragging.x+=collision2[1][1];
		dragging.y-=collision2[1][2];
		
		dragging.degrees=collision2[1][4];
		return(collision2);
	}
	else if(hitCircle){
		
		dragging.x+=collision[1][1];
		dragging.y-=collision[1][2];
		
		//dragging.degrees=collision[1][4];
		var circle=collision[1][0];//trace("degrees",degrees);
		if(circle.speed!=undefined){
			var x1=dragging.x;//&&circle.speed>0
			var y1=dragging.y;
			var dx=circle.x-x1;
			var dy=circle.y-y1;
			var dist=Math.sqrt((dx*dx)+(dy*dy));
			var normalX=dx/dist;
			var normalY=dy/dist;
			var xvel1=Math.cos(degrees*dg)*speed;
			var yvel1=(Math.sin(degrees*dg)*speed)*-1;
			var xvel2=Math.cos(circle.degrees*dg)*circle.speed;
			var yvel2=(Math.sin(circle.degrees*dg)*circle.speed)*-1;
			var dVector=((xvel1-xvel2)*normalX)+((yvel1-yvel2)*normalY);
			var dvx=dVector*normalX;
			var dvy=dVector*normalY;
			
			xvel1-=dvx;
			yvel1-=dvy;
			xvel2+=dvx;
			yvel2+=dvy;
			
			yvel1*=-1;
			yvel2*=-1;
			
			var d=Math.atan2(yvel1,xvel1)*rd;
			dragging.degrees=d;
			var s=Math.sqrt((yvel1*yvel1)+(xvel1*xvel1));
			dragging.speed=s;
			var d2=Math.atan2(yvel2,xvel2)*rd;
			circle.degrees=d2;
			s=Math.sqrt((yvel2*yvel2)+(xvel2*xvel2));
			circle.speed=s;
			//trace(d,d2);
		}
		else{
			dragging.degrees=collision[1][4];
		}
		return(collision);
	}
	else{
		
		dragging.x+=Math.cos(degrees*dg)*speed;
		dragging.y-=Math.sin(degrees*dg)*speed;
		
		return(new Array(false,false));
	}
	
	return new Array();
}
		
function getCollisionCircle(dragging, degrees, speed, objects)
{
	return new Array();
	/*
	var xN;
	var yN;
	var rN;
	var xC;
	var yC;
	var rC;
	
	var a;
	var b;
	var c;
	var d;
	var f;
	var E;
	var a1;
	var b1;
	var C1;
	var D1;
	var D;
	var low;
	var high;
	var tD;
	var tD2;
	var D2;
	var E1;
	var e;
	var F1;
	var G1;
	var g;
	var tV;
	
	var x1;
	var y1;
	var rebound;
	
	var obj;
	var bounds;
	var bounds2;
	
	var hitArray=new Array();
	var array;
	
	var temper=.3;
	
	bounds=dragging.getBounds(dragging.parent);
	if(dragging.getChildByName("inside")!=null){
		bounds=dragging.getChildByName("inside").getBounds(dragging.parent);
	}
	
	xN=bounds.x+(bounds.width/2);
	yN=bounds.y+(bounds.height/2);
	rN=bounds.width/2;
	
	speed+=temper;
	
	xN+=(Math.cos((180-degrees)*dg)*temper);
	yN+=(Math.sin((180-degrees)*dg)*temper)*-1;
	
	
	for(var q=0;q<objects.length;q++){
		obj=objects[q];
		if(obj!=dragging){
			bounds2=obj.getBounds(dragging.parent);
			if(obj.getChildByName("inside")!=null){
				bounds2=obj.getChildByName("inside").getBounds(dragging.parent);
			}
			xC=bounds2.x+(bounds2.width/2);
			yC=bounds2.y+(bounds2.height/2);
			rC=bounds2.width/2;
			
			a=yN-yC;
			b=xC-xN;
			a1=Math.abs(a);
			b1=Math.abs(b);
			c=Math.sqrt(Math.pow(a1,2)+Math.pow(b1,2));
			C1=Math.atan2(a,b)*rd;
			if(C1<0){
				C1+=360;
			}
			D=degrees-C1;
			
			D1=Math.abs(D);
			
			if(D1>180){
				D1-=360;
			}
			D1=Math.abs(D1);
			
			if(D1<90){
				d=Math.sin(D1*dg)*c;
				if(d<rN+rC){
					//in range
					
					e=Math.sqrt(Math.pow(c,2)-Math.pow(d,2));
					
					f=Math.sqrt(Math.pow(rN+rC,2)-Math.pow(d,2));
					
					g=e-f;
					
					
					if(speed>g){
						//hit
						//trace("hit");
						g+=temper;
						x1=Math.cos(degrees*dg)*(g);
						y1=Math.sin(degrees*dg)*(g);
						F1=Math.asin(d/(rN+rC))*rd;
						E=180-F1;
						if(D<0){
							rebound=degrees-180+(2*F1);
						}
						else{
							rebound=degrees+180-(2*F1);
						}
						if(rebound>360){
							do{
							   rebound-=360;
							}while(rebound>360);
						}
						if(rebound<0){
							do{
								rebound+=360;
							}while(rebound<0);
						}
							 
						array=new Array(obj,x1,y1,g-temper,rebound);
						
						//trace(degrees,rebound);
						hitArray.push(array);
					}
				}
				
			}
		}
	}
	if(hitArray.length>0){
		
		var winner=999999;
		var winNum=-1;
		for(q=0;q<hitArray.length;q++){
			if(hitArray[q][3]<winner){
				winNum=q;
				winner=hitArray[q][3];
			}
		}
		
		return(new Array(true,hitArray[winNum]));
	}
	else{
		return(new Array(false,false));
	}
	*/
}
function detectCollisionLinear(draggingExtended, degrees, speed, objects, reboundType)
{
	while (degrees > 180)
	{
		degrees -= 360;
	}
	while (degrees < -180)
	{
		degrees += 360;
	}
	var collision1 = doDetectCollisionLinear(draggingExtended,degrees,speed,objects);
	if(reboundType == "slide" && collision1[0]){
		var slideAngle;// trace("diff1", collision1[1][2]);
		var angle = collision1[1][3];
		while (angle > 180)
		{
			angle -= 360;
		}
		while (angle < -180)
		{
			angle += 360;
		}
		var diff1 = Math.abs(degrees - angle);
		var d2 = collision1[1][3] + 180;
		while (d2 > 180)
		{
			d2 -= 360;
		}
		while (d2 < -180)
		{
			d2 += 360;
		}
		var diff2 = Math.abs(degrees - d2);
		var tempDiff;
		while (diff1 > 180)
		{
			diff1 -= 360;
		}
		while (diff1 < -180)
		{
			diff1 += 360;
		}
		
		while (diff2 > 180)
		{
			diff2 -= 360;
		}
		while (diff2 < -180)
		{
			diff2 += 360;
		}
		
		var newSpeed = speed - collision1[1][2];
			
		if(Math.abs(diff1) < Math.abs(diff2)){
			slideAngle = angle;
			newSpeed = Math.cos(Math.abs(diff1) * dg) * (speed - collision1[1][2]);
		}
		else{
			slideAngle = d2;
			newSpeed = Math.cos(Math.abs(diff2) * dg) * (speed - collision1[1][2]);
		}
		
		
		var collision2 = doDetectCollisionLinear(draggingExtended,slideAngle,newSpeed,objects,collision1[5],collision1[6]);
		return(collision1.concat(collision2));
		//return([false,false]);
	}
	else{
		return(collision1);
	}
	
}

// function doDetectCollisionLinear(dragging,degrees,speed,objects,ignoreA = null,ignoreB = null){
function doDetectCollisionLinear(dragging,degrees,speed,objects,ignoreA,ignoreB){
	if(speed == 0){
		return([false,false]);
	}
	while(degrees > 180){
		degrees -= 360;
	}
	while(degrees < -180){
		degrees += 360;
	}
	
	var backup = 0;
	var winner = speed;
	var winArray = new Array();
	var objExtended;
	var scopedPoints;
	var scopedLines;
	var isHit;
	var g;
	var x1;
	var y1;
	var A;
	var B;
	var C;
	var D;
	var slD1;
	var slD2
	var hit;
	var lineAngle;
	
	
	scopedPoints = dragging.scopedPoints();
	
	
	
	// get the bounds of this whole thing so we can get the least amount of objects to compare to
	var minX = scopedPoints[0].x;
	var maxX = scopedPoints[0].x;
	var minY = scopedPoints[0].y;
	var maxY = scopedPoints[0].y;
	
	var xBackup = Math.cos((degrees - 180) * dg) * backup;
	var yBackup = (Math.sin((degrees - 180) * dg) * backup) * -1;
	
	var xDiff = Math.cos(degrees * dg) * speed;
	var yDiff = Math.sin(degrees * dg) * speed * -1;
	
	for (var a = 1; a < scopedPoints.length; a++)
	{
		minX = Math.min(minX, scopedPoints[a].x + xBackup);
		minX = Math.min(minX, scopedPoints[a].x + xDiff + xBackup);
		maxX = Math.max(maxX, scopedPoints[a].x + xBackup);
		maxX = Math.max(maxX, scopedPoints[a].x + xDiff + xBackup);
		minY = Math.min(minY, scopedPoints[a].y + yBackup);
		minY = Math.min(minY, scopedPoints[a].y + yDiff + yBackup);
		maxY = Math.max(maxY, scopedPoints[a].y + yBackup);
		maxY = Math.max(maxY, scopedPoints[a].y + yDiff + yBackup);
		
	}
	
	var minPoint = new Object();
	minPoint.x = minX;
	minPoint.y = minY;
	var maxPoint = new Object();
	maxPoint.x = maxX
	maxPoint.y = maxY;
	
	
	
	
	for(var b = 0;b < objects.length;b++){
		obj = objects[b];
		if(obj != dragging){											
				
			scopedLines = obj.scopedLines(minPoint, maxPoint);
			
			for(var c = 0;c < scopedLines.length;c++){
					
				C = scopedLines[c][0];
				D = scopedLines[c][1];
				//if (ignoreA == C && ignoreB == D) continue;// this is the second collision and this is the line that we are comparing to
				for (a = 0; a < scopedPoints.length; a++) {
					A = scopedPoints[a];
					A.x += xBackup;
					A.y += yBackup;
					B = new Object
					B.x = A.x + xDiff;
					B.y = A.y + yDiff;
				
					
					//if (!inRange(A, B, C, D)) continue;
					
					lineAngle = (Math.atan2((scopedLines[c][1].y - scopedLines[c][0].y) * -1, scopedLines[c][1].x - scopedLines[c][0].x) * rd) - 180;
					slD1 = lineAngle;
					slD2 = lineAngle;		
					
					isHit = isIntercepting(A,B,C,D);
					if(isHit != false && isHit != "Infinity"){
															
						g = findC(A.y - isHit.y,A.x - isHit.x);
						if(g < winner && g >= 0){
							winner = g;
							winArray = new Array(true,g,isHit,slD1,slD2,1,C,D,obj);
						}
					}							
				}						
			}						
		}				
	}
	var degrees2;
	scopedLines = dragging.scopedLines();
	
	minX = scopedLines[0][0].x;
	maxX = scopedLines[0][0].x;
	minY = scopedLines[0][0].y;
	maxY = scopedLines[0][0].y;
	
	xBackup = Math.cos((degrees - 180) * dg) * backup;
	yBackup = (Math.sin((degrees - 180) * dg) * backup) * -1;
	
	xDiff = Math.cos(degrees * dg) * speed;
	yDiff = Math.sin(degrees * dg) * speed * -1;
	
	var pointA;
	var pointB;
	
	for (a = 1; a < scopedLines.length; a++)
	{
		pointA = scopedLines[a][0];
		pointB = scopedLines[a][1];
		minX = Math.min(minX, pointA.x, pointA.x + xBackup + xDiff);
		minX = Math.min(minX, pointB.x, pointB.x + xBackup + xDiff);
		maxX = Math.max(maxX, pointA.x, pointA.x + xBackup + xDiff);
		maxX = Math.max(maxX, pointB.x, pointB.x + xBackup + xDiff);
		minY = Math.min(minY, pointA.y, pointA.y + yBackup + yDiff);
		minY = Math.min(minY, pointB.y, pointB.y + yBackup + yDiff);
		maxY = Math.max(maxY, pointA.y, pointA.y + yBackup + yDiff);
		maxY = Math.max(maxY, pointB.y, pointB.y + yBackup + yDiff);
		
	}
	
	minPoint = new Object();
	minPoint.x = minX;
	minPoint.y = minY;
	maxPoint = new Object();
	maxPoint.x = maxX;
	maxPoint.y = maxY;
	
	//trace("minX", minPoint.x, "minY", minPoint.y);
	//trace("maxX", maxPoint.x, "maxY", maxPoint.y);
	//trace("                              *********************************");
	
	for (b = 0; b < objects.length; b++)
	{
		obj = objects[b];
		if (obj != dragging)
		{
			
			scopedPoints = obj.scopedPoints(minPoint, maxPoint);
			
			/*
			trace("************************");
			for (var i = 0; i < scopedPoints.length; i++)
			{
				trace("x", scopedPoints[i].x, "y", scopedPoints[i].y);
			}
			trace("************************");
			*/
			
			for(a = 0;a < scopedLines.length;a++){
				C = scopedLines[a][0];
				D = scopedLines[a][1];
				
				lineAngle = (Math.atan2((scopedLines[a][1].y - scopedLines[a][0].y) * -1, scopedLines[a][1].x - scopedLines[a][0].x) * rd) - 180;
				slD1 = lineAngle;
				slD2 = lineAngle;
				
				count++;
				
				for (c = 0; c < scopedPoints.length; c++) {
					
					A = scopedPoints[c];
					//if (A == ignoreA || A == ignoreB) continue;//this is the second collision point
					B = new Object();
					B.x = A.x + Math.cos((degrees - 180) * dg) * speed;
					B.y = A.y + (Math.sin((degrees - 180) * dg) * speed * -1);
					//trace("Cx", C.x, "Cy", C.y, "Dx", D.x, "Dy", D.y);
					//trace("Ax", A.x, "Ay", A.y, "Bx", B.x, "By", B.y);
					//trace("");
					//if (!inRange(A, B, C, D)) continue;
					
					
					//trace("c=",C," d=",D);
					isHit = isIntercepting(A,B,C,D);
					//trace(isHit);
					if(isHit != false && isHit != "Infinity"){
						g = findC(A.y - isHit.y,A.x - isHit.x);
						
						if(g < winner && g >= 0){
							winner = g;
							winArray = new Array(true,g,isHit,slD1,slD2,2,A,null,obj);
						}
					}
				}
			}
		}
	}
					
	if(winner < speed){
		if(winArray[2] == "Infinity"){
			//do nothing, slide?
			return([false,false]);
		}
		if(winner < .5 || ignoreA != null){
			return(new Array(true,[winArray[2].x,winArray[2].y,winArray[1],winArray[4],winArray[1],winArray[5],winArray[6],winArray[8]]));
		}
			
		
		//count++;
		//trace("hit count =",count);
		//trace("winner =", winArray[1]);
		//trace("y = ", winArray[2].y , " x =" , winArray[2].x);
		//trace("detection winner =",winArray[3]);
		dragging.x += Math.cos(degrees * dg) * (winArray[1]  - .3);
		dragging.y += Math.sin(degrees * dg) * (winArray[1] - .3) * -1;
		
		return(new Array(true,[winArray[2].x,winArray[2].y,winArray[1],winArray[4],winArray[1],winArray[5],winArray[6],winArray[8]]));
	}
	else{
		
		dragging.x += Math.cos(degrees * dg) * speed;
		dragging.y += Math.sin(degrees * dg) * speed * -1;
		
		return([false,false]);
	}
	
}


var count = 0;
function getM(obj1, obj2)
{			
	return(((obj1.y) - (obj2.y))/(obj1.x - obj2.x));
}
function getB(obj1, obj2)
{
	return((obj1.y) - (getM(obj1,obj2) * obj1.x));
}
function isIntercepting(A, B, C, D)
{
	var	x1 = (getB(C,D) - getB(A,B)) / (getM(A,B) - getM(C,D));
	var y1;
	var y2;
	
	if (isNaN(x1))
	{
		if (A.x == B.x)
		{									
			x1 = A.x;
			y1 = (getM(C,D) * x1) + getB(C,D);					
		}
		else
		{
			x1 = C.x;
			y1 = (getM(A,B) * x1) + getB(A,B);
		}
	}
	else
	{
		y1 = (getM(A,B) * x1) + getB(A,B);
	}
	
	var xInBounds = false;
	var zeroRiseSensitivity = .5;
	if(A.x < B.x){
		if(x1 >= A.x && x1 <= B.x){
			xInBounds = true;
		}
	}
	else{
		if(x1 >= B.x && x1 <= A.x){
			xInBounds = true;
		}
	}
	if(A.x == B.x){
		if (x1 > A.x - zeroRiseSensitivity && x1 < A.x + zeroRiseSensitivity)
		{
			//xInBounds = true;
		}
	}			
		
	
	var yInBounds = false;
	if(A.y < B.y){
		if(y1 >= A.y && y1 <= B.y){
			yInBounds = true;
		}
	}
	else{
		if(y1 >= B.y && y1 <= A.y){
			yInBounds = true;
		}
	}
	if(A.y == B.y){
		if(y1 > A.y - zeroRiseSensitivity && y1 < A.y + zeroRiseSensitivity){
			//yInBounds = true;
		}
	}		
	
	var xInBounds2 = false;
	if(C.x < D.x){
		if(x1 >= C.x && x1 <= D.x){
			xInBounds2 = true;
		}
	}
	else{
		if(x1 >= D.x && x1 <= C.x){
			xInBounds2 = true;
		}
	}
	if(C.x > D.x - zeroRiseSensitivity && C.x < D.x + zeroRiseSensitivity){
		if(x1 > C.x - zeroRiseSensitivity && x1 < C.x + zeroRiseSensitivity){
			xInBounds2 = true;
		}
	}	
	
	var yInBounds2 = false;
	if(C.y < D.y){
		if(y1 >= C.y && y1 <= D.y){
			yInBounds2 = true;
		}
	}
	else{
		if(y1 >= D.y && y1 <= C.y){
			yInBounds2 = true;
		}
	}
	if(C.y > D.y - zeroRiseSensitivity && C.y < D.y + zeroRiseSensitivity){
		//count++
		//trace("c = d",count);
		if(y1 > C.y - zeroRiseSensitivity && y1 < C.y + zeroRiseSensitivity){
			yInBounds2 = true;
		}
	}	
	
		
	
	if(x1 == Infinity || x1 == -Infinity || y1 == Infinity || y1 == -Infinity || isNaN(x1) || isNaN(y1)){
		return false;
		//return("Infinity");
			
	}
	
	if(xInBounds && yInBounds && xInBounds2 && yInBounds2){
		count++;
		//trace("inbounds ",count);
		var obj = new Object();
		obj.x = x1;
		obj.y = y1;
		return(obj);
	}
	return(false);
}

function findC(y1,x1){
	return(Math.sqrt(y1 * y1 + x1 * x1));
}

function inRange(A, B, C, D)
{
	if (Math.min(C.x, D.x) > Math.max(A.x, B.x) || Math.max(C.x, D.x) < Math.min(A.x, B.x) || Math.min(C.y, D.y) > Math.max(A.y, B.y) || Math.max(C.y, D.y) < Math.min(A.y, B.y)) return false;
	return true;
}
