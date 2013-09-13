/**
 * @author Samsung
 */
 

 var bbDataItem = function(br, bb, ctime)
 {
    this.bitrate = br;             //unit : bps
    this.bandwidth = bb;    //unit : bps
    this.time = ctime;           //unit : second
 };
 
var Bitrate =
{
    dataSize : 0,
    barSize: 0,
    validDataSize : 0,
    startIndex :0,
    
    graph : null,
    bbdata : [ ],
    
    bShowBitrateGraph:0,
    bRunTimer:0,
    timer: null,
    dataSamplePeriod:0,
    iCurPlayTime:0,
    nPixelPerMbps:0,
	bInit:0, 
	
	timerInterval:2,
	timerCount:0,
    
    bitrateLevelArray: null,
    curBitrate :0,
    pluginPlayer:null
};


Bitrate.print = function(msg)
{
   alert(msg);
};

Bitrate.init = function()
{
	if( this.bInit == 0 )
	{
		this.bInit = 1;
		this.print("Bitrate.init ");
		
		this.barSize =24;
		this.dataSize = (this.barSize*2 + 6);
		
		this.validDataSize = 0;
		this.startIndex =0;
		this.bShowBitrateGraph = 0;
		this.bRunTimer  = 0;
		this.timer = null;
		this.iCurPlayTime = 0;
		this.dataSamplePeriod = 2;

        this.bitrateLevelArray = null;
        this.curBitrate = 0;
    
		this.graph  = document.getElementById("bitrateList");
		this.graph.style.visibility="hidden";

		for(var i=0;i<this.dataSize;i++)
		{
		    this.bbdata[i] = null;
		}
		this.resetGraphBar();    

		this.nPixelPerMbps = 50.0;  //default bitrate range = 0~4Mbps
		
        this.pluginPlayer = null; 
	}
};


Bitrate.deinit = function()
{
	if( this.bInit == 1 )
	{
		this.bInit = 0;
		this.print("Bitrate.deinit ");
	   
		this.graph  = document.getElementById("bitrateList");
		this.graph.style.visibility="hidden";

        this.stopMonitor();

		
		for(var i=0;i<this.dataSize;i++)
		{
			this.bbdata[i] = null;
		}
		this.resetGraphBar();
	}
};

Bitrate.setPlayer = function(playerplugin)
{
    this.pluginPlayer = playerplugin;
};

Bitrate.setGraphBitrateRange= function(bitraterange /*Mbps*/)
{
	this.print("Bitrate.setGraphBitrateRange : " + bitraterange);
    if( bitraterange < 0 )return;
    
	var graph  = document.getElementById("bitrategraph");
	
    // y axis height : 200 pixel
    if( bitraterange >= 0 && bitraterange< 4 )
    {
        this.nPixelPerMbps = 50; // 0~4 Mbps  , 1Mbps ==> 50px
        graph.style.background="url('./Images/bitrate/bitrateBG4.png')";
    }
    else  if(  bitraterange< 6 )
    {
        this.nPixelPerMbps = 35.0; // 0~5.7 Mbps  , 1Mbps ==> 35.0px
        graph.style.background="url('./Images/bitrate/bitrateBG6.png')";
    }    
    else  if( bitraterange< 12 )
    {
        this.nPixelPerMbps = 16.7; // 0~12 Mbps  , 1Mbps ==> 16.7px
        graph.style.background="url('./Images/bitrate/bitrateBG12.png')";
    }
    else
    {
        this.nPixelPerMbps = 5; // 0~40 Mbps  , 1Mbps ==> 5px
        graph.style.background="url('./Images/bitrate/bitrateBG40.png')";    
    }
    this.resetGraphBar();   	
};

Bitrate.BitRateTimerCount= function()
{
    if( this.bRunTimer == 1 )
    {     
        var curBandwidth 	= 1;
		var contentBitrate 	= this.pluginPlayer.GetCurrentBitrates();

		var HasSampleTime = ( this.timerCount*Bitrate.timerInterval );
		this.timerCount = this.timerCount + 1;
		
		if( curBandwidth <= 0|| contentBitrate <= 0 )
            return;
        
		this.addData( contentBitrate, curBandwidth,  HasSampleTime);
        this.iCurPlayTime = HasSampleTime;	
		
		//draw bitrate graph            
		if( this.bShowBitrateGraph == 1)
		{
			this.drawData();
		}        
    }
};

Bitrate.startMonitor = function()
{
    if( this.bRunTimer  == 0 )
    {
		this.print("Bitrate.startMonitor  ");	
        this.bRunTimer  = 1;
		this.timerInterval = 2;
		this.timerCount = 0;
        this.timer=setInterval("Bitrate.BitRateTimerCount()", this.timerInterval*1000);
        
        this.initBitrateLevel();
    }	
};

Bitrate.stopMonitor=function()
{
    if(this.timer != null )
    {
		this.print("Bitrate.stopMonitor  ");	
        clearInterval(this.timer);
        this.timer = null;
        this.bRunTimer  = 0;
        this.timerCount = 0;
        
        this.clearBitrateLevel();
    }
};

Bitrate.addData = function(bitrate, bandwidth, time)  //bps, bps, second
{
    var iUpdatePos = this.startIndex + this.validDataSize;

    iUpdatePos = iUpdatePos% this.dataSize;

    var newItem = new bbDataItem( bitrate, bandwidth, time);

    this.bbdata[iUpdatePos] = newItem;

    this.validDataSize = this.validDataSize +1;
    if( this.validDataSize > this.dataSize ) 
    {   
        this.validDataSize = this.dataSize;

        this.startIndex = this.startIndex +1;
        if( this.startIndex >= this.dataSize ) this.startIndex = 0;
    }
};

Bitrate.showGraph = function()
{
  if( this.bInit == 1 )
  {
        if( this.bShowBitrateGraph == 0 )
        {
            this.print("Bitrate.showGraph ");
            this.graph.style.visibility="visible";
            this.bShowBitrateGraph = 1;
        }
    }
};

Bitrate.hideGraph= function()
{
  if( this.bInit == 1 )
  {
        if( this.bShowBitrateGraph == 1 )
        {
            this.print("Bitrate.hideGraph ");
            this.graph.style.visibility="hidden";
            this.bShowBitrateGraph = 0;
        }
    }
};



Bitrate.getbarIndex = function(bbdataitem)
{
	var barIndex = 0;
    
    if( bbdataitem.time > this.iCurPlayTime )
    {
        return -1;
    }
    
	if( this.iCurPlayTime == bbdataitem.time )
		barIndex = this.barSize - 1;
	else
	{
		barIndex = this.barSize - Math.round( (this.iCurPlayTime-bbdataitem.time )/this.dataSamplePeriod );
	}
	
	return barIndex;
};

Bitrate.drawData = function()
{
    var iCur;
    var idata;
    
//	Bitrate.print("Bitrate.drawData  ");	
    
	this.resetGraphBar();
	//*
	var tempBBSorted = new Array();
	for(var i=0;i<this.dataSize;i++)
	{
		tempBBSorted[i] = -1;
	}
	
//	this.print("Bitrate.drawData : 1"); 
	//sort the Bitrate array and save the sorted index to tempBBsorted[]
	for(var i=0;i<this.dataSize;i++)
	{
		idata = this.bbdata[i];
		if( idata != null )
		{
			iCur = this.getbarIndex(idata);	
			if( iCur >= 0 )
			{
				tempBBSorted[iCur] = i;
			}	
		}
	}
//	this.print("Bitrate.drawData : 2"); 
	
	//sort the data
    for(var i=0;i<this.dataSize;i++)
    {
		iCur = tempBBSorted[i];
		if( iCur >= 0 )
		{
			idata = this.bbdata[iCur];
			if( idata != null )
			{ 
				this.drawBar( idata );
			}
		}
    }
//	this.print("Bitrate.drawData : 3"); 

};

Bitrate.resetGraphBar = function()
{
  //  this.print("Bitrate.resetGraphBar ");
    var i;
    for(i=0;i<this.barSize;i++)
    {
        var divBitrateBar = document.getElementById("bitrate"+i);
        if( divBitrateBar  != null )
        {
            divBitrateBar.style.visibility="hidden";
        }
        
        var divBandwidthBar = document.getElementById("bandwidth"+i);
        if( divBandwidthBar  != null )
        {
            divBandwidthBar.style.visibility="hidden";
        }
    }
};

Bitrate.drawBar = function( bbdataitem)
{
    var graph_x = 36;
    var graph_ybase = 193;
    var graph_maxHeight = 163;
    var graph_bar_width = 10;
    var graph_bar_interval = 33;
   
    var barIndex = 0;
    
    if( bbdataitem.time > this.iCurPlayTime )
    {
        return ;
    }
    
	if( this.iCurPlayTime == bbdataitem.time )
		barIndex = this.barSize - 1;
	else
	{
		barIndex = this.barSize - Math.round( (this.iCurPlayTime-bbdataitem.time )/this.dataSamplePeriod );
	}
     
     if( barIndex < 0  || barIndex >= this.barSize )
     {
        return;
     }
     
	 if( barIndex == (this.barSize -1) )
	 {
		//update bitrate level
		this.onBitrateChange(bbdataitem.bitrate);
	 }

  
     // draw bandwidth bar    
    var divBandwidthBar = document.getElementById("bandwidth"+barIndex);
    if( divBandwidthBar  == null )
    {
        alert("warning :  divBandwidthBar  = null ");
        return;
        }
  
    var barX = graph_x + graph_bar_interval*barIndex;
    divBandwidthBar.style.left =barX +"px";

    //  convert bandwidth to pixel     :  use   this.nPixelPerMbps 
    var barHeight = Math.round((bbdataitem.bandwidth * this.nPixelPerMbps  )/1000000 ); 
    if( barHeight > graph_maxHeight ) barHeight = graph_maxHeight;

    var barT =  graph_ybase - barHeight;
    divBandwidthBar.style.top = barT + "px"; 
    divBandwidthBar.style.width = graph_bar_width +"px";
    divBandwidthBar.style.height = barHeight +"px";   
    divBandwidthBar.style.visibility="visible";
    
    
   // draw bitrate bar   
    var divBitrateBar = document.getElementById("bitrate"+barIndex);
    if( divBitrateBar  == null )
     {
        alert("warning :  divBitrateBar  = null ");
        return;
     }
  
    barX = graph_x + graph_bar_interval*barIndex+graph_bar_width;  
    divBitrateBar.style.left =barX +"px";

    //  convert bitrate to pixel     :  use   this.nPixelPerMbps 
    barHeight = Math.round((bbdataitem.bitrate * this.nPixelPerMbps  )/1000000 ); 
    if( barHeight > graph_maxHeight ) barHeight = graph_maxHeight;
    
    barT =  graph_ybase - barHeight;  
    //graph_maxHeight
    divBitrateBar.style.top = barT + "px"; 
    divBitrateBar.style.width = graph_bar_width +"px";
    divBitrateBar.style.height = barHeight +"px";   
    divBitrateBar.style.visibility="visible";    
};

Bitrate.clearBitrateLevel = function()
{
	this.print("Bitrate.clearBitrateLevel");	

	this.bitrateLevelArray = null;
	this.curBitrate = 0;
};

Bitrate.initBitrateLevel = function()
{
	this.print("Bitrate.initBitrateLevel");	

    var bitrates = this.pluginPlayer.GetAvailableBitrates();

	if( bitrates.length <= 0 )
	{
		return;
	}
	this.print("Bitrate.initBitrateLevel : " + bitrates);    
	
    this.bitrateLevelArray = String(bitrates).split("|");
	
	var maxBitrateRange = this.bitrateLevelArray[ this.bitrateLevelArray.length-1 ];
	if( maxBitrateRange > 0 )
	{
		maxBitrateRange = Math.round((maxBitrateRange*1.4)/1000000. );
		this.setGraphBitrateRange(maxBitrateRange);
	}
	
    this.curBitrate = 0;
};

Bitrate.onBitrateChange = function(bitrate)
{
    if( this.bitrateLevelArray == null )
    {
		this.initBitrateLevel();
	}
    
    if( this.bitrateLevelArray.length == 0 )
    {
		this.bitrateLevelArray = null;
		return;
	}
    
    if( this.curBitrate == bitrate)
    return;
    
    for(var i=0;i<this.bitrateLevelArray.length; i++)
    {
        if(  bitrate == this.bitrateLevelArray[i]  )
        {
            this.curBitrate = bitrate;   
            this.drawCurBitrateLevel(i, this.bitrateLevelArray.length );
			this.print("Bitrate.onBitrateChange  curLevel : " + i + ",    bitrate : " + bitrate );
			return;
        }
    }
};


Bitrate.drawCurBitrateLevel = function (curLevel, LevelSize)
{
    var levelgraphDiv  = document.getElementById("bitrateLevel");
    var top = 316;
	var right = 892;
	
    var barwidth = 5;
    var barMaxheight = 24;
    var barXinterval =  7;
	
	//var barMaxwidth = LevelSize*(barwidth + barXinterval) - barXinterval;
	var left = right - (LevelSize*barXinterval - 2);
		
    var yPerLevel = Math.round( barMaxheight / LevelSize );
    
    var barheight;
    var barleft ;
    
//	Bitrate.print("Bitrate.drawCurBitrateLevel  curLevel : " + curLevel);
	
    //remove child element
    while(levelgraphDiv.firstChild) { 
        levelgraphDiv.removeChild(levelgraphDiv.firstChild); 
    }    
    
    //create child element
    for(var i=0;i<LevelSize;i++ )
    {
        barheight = yPerLevel*(1+i);
        barleft = left + i*barXinterval;
        bartop = top +   barMaxheight -     barheight;
        
        if( i <= curLevel )
        {  this.createDiv(levelgraphDiv, "bitratelevelbar"+i, barleft, bartop, barwidth, barheight,  "./Images/bitrate/blue192.png" ); }
        else
        {  this.createDiv(levelgraphDiv, "bitratelevelbar"+i, barleft, bartop, barwidth, barheight,  "./Images/bitrate/white64.png" ); }
    }
};


Bitrate.createDiv = function( parentDiv, idname, left, top, width, height, bgimg )
{
   var newdiv = document.createElement('div');
   newdiv.setAttribute('id', idname);
   
   if (width) {
       newdiv.style.width = width;
   }
   
   if (height) {
       newdiv.style.height = height;
   }
   
   if ((left || top) || (left && top)) {
       newdiv.style.position = "absolute";
       
       if (left) {
           newdiv.style.left = left;
       }
       
       if (top) {
           newdiv.style.top = top;
       }
   }
   
   newdiv.style.background="url('" + bgimg + "')";
      
   parentDiv.appendChild(newdiv);
};



