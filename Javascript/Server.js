var Server =
{
    /* Callback function to be set by client */
    dataReceivedCallback : null,
    
    XHRObj : null,
    url : "http://feeds2.feedburner.com/AllJupiterVideos?format=xml"
    //url : "XML/videoList.xml"
};

Server.init = function()
{
    var success = true;

    if (this.XHRObj)
    {
        this.XHRObj.destroy();  // Save memory
        this.XHRObj = null;
    }
    
    return success;
};

Server.fetchVideoList = function()
{
    if (this.XHRObj == null)
    {
        this.XHRObj = new XMLHttpRequest();
    }
    
    if (this.XHRObj)
    {
        this.XHRObj.onreadystatechange = function()
            {
                if (Server.XHRObj.readyState == 4)
                {
                    Server.createVideoList();
                }
            };
            
        this.XHRObj.open("GET", this.url, true);
        this.XHRObj.send(null);
     }
    else
    {
        alert("Failed to create XHR");
    }
};

Server.createVideoList = function()
{
    if (this.XHRObj.status != 200)
    {
        Display.status("XML Server Error " + this.XHRObj.status);
    }
    else
    {
        var xmlElement = this.XHRObj.responseXML.documentElement;
        
        if (!xmlElement)
        {
            alert("Failed to get valid XML");
        }
        else
        {
            // Parse RSS
            // Get all "item" elements
            var items = xmlElement.getElementsByTagName("item");
            
            var videoNames = [ ];
            var videoURLs = [ ];
            var videoDescriptions = [ ];
  
            //Add Live stream Link
            videoNames[0] = "Jupiter Broadcasting";
            videoURLs[0] = "http://jblive.videocdn.scaleengine.net/jb-live/play/jblive.stream/playlist.m3u8|COMPONENT=HLS";
            videoDescriptions[0] = "JB Live Stream"
            
            for (var index = 0; index < items.length; index++)
            {
                var titleElement = items[index].getElementsByTagName("title")[0];
                var descriptionElement = items[index].getElementsByTagName("description")[0];
                //var linkElement = items[index].getElementsByTagName("link")[0];
                var enclosureElement = items[index].getElementsByTagName("enclosure")[0];
                
                if (titleElement && descriptionElement && enclosureElement)
                {
                    videoNames[index+1] = '<div class="showTitle">' + ((titleElement.firstChild.data).replace(' | ', '</div><div class="showName">'))+'</div>';
                    videoURL = enclosureElement.getAttribute('url');
                    videoURL = videoURL.replace('www.podtrac.com/pts/redirect.mp4/', '');
                    videoURLs[index+1] = videoURL; 
                    videoDescriptions[index+1] = descriptionElement.firstChild.data;
                }
            }
        
            Data.setVideoNames(videoNames);
            Data.setVideoURLs(videoURLs);
            Data.setVideoDescriptions(videoDescriptions);
            
            if (this.dataReceivedCallback)
            {
                this.dataReceivedCallback();    /* Notify all data is received and stored */
            }
        }
    }
};
