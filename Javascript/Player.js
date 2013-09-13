var Player =
{
    plugin : null,
    state : -1,
    skipState : -1,
    stopCallback : null,    /* Callback function to be set by client */
    originalSource : null,
    
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,  
    FORWARD : 3,
    REWIND : 4
};

Player.init = function()
{
    var success = true;
    
    this.state = this.STOPPED;
    
    this.plugin = document.getElementById("pluginPlayer");
    
    if (!this.plugin)
    {
         success = false;
    }
    else
    {
        var mwPlugin = document.getElementById("pluginTVMW");
        
        if (!mwPlugin)
        {
            success = false;
        }
        else
        {
            /* Save current TV Source */
            this.originalSource = mwPlugin.GetSource();
            
            /* Set TV source to media player plugin */
            mwPlugin.SetMediaSource();
        }
    }
    
    this.setWindow();
    
    this.plugin.OnCurrentPlayTime = 'Player.setCurTime';
    this.plugin.OnStreamInfoReady = 'Player.setTotalTime';
    this.plugin.OnBufferingStart = 'Player.onBufferingStart';
    this.plugin.OnBufferingProgress = 'Player.onBufferingProgress';
    this.plugin.OnBufferingComplete = 'Player.onBufferingComplete';           
            
    return success;
};

Player.deinit = function()
{
    var mwPlugin = document.getElementById("pluginTVMW");
    
    if (mwPlugin && (this.originalSource != null) )
    {
        /* Restore original TV source before closing the widget */
        mwPlugin.SetSource(this.originalSource);
        alert("Restore source to " + this.originalSource);
    }
};

Player.setWindow = function()
{
    this.plugin.SetDisplayArea(458, 58, 472, 270);
};

Player.setFullscreen = function()
{
    if (this.state === this.PLAYING)
    {
        this.plugin.SetDisplayArea(0, 0, 960, 540);
    }
};

Player.setVideoURL = function(url)
{
    this.url = url;
    alert("URL = " + this.url);
};

Player.playVideo = function()
{
    if (this.url == null)
    {
        alert("No videos to play");
    }
    else
    {
        this.state = this.PLAYING;
        document.getElementById("play").style.opacity = '0.2';
        document.getElementById("stop").style.opacity = '1.0';
        document.getElementById("pause").style.opacity = '1.0';
        document.getElementById("forward").style.opacity = '1.0';
        document.getElementById("rewind").style.opacity = '1.0';
        Display.status("Play");
        this.setWindow();
        
        this.plugin.SetInitialBuffer(640*1024);
        this.plugin.SetPendingBuffer(640*1024); 
       
        this.plugin.Play( this.url );
        Audio.plugin.SetSystemMute(false);
    }
};

Player.pauseVideo = function()
{
    this.state = this.PAUSED;
    document.getElementById("play").style.opacity = '1.0';
    document.getElementById("stop").style.opacity = '1.0';
    document.getElementById("pause").style.opacity = '0.2';
    document.getElementById("forward").style.opacity = '0.2';
    document.getElementById("rewind").style.opacity = '0.2';
    Display.status("Pause");
    this.plugin.Pause();
};

Player.stopVideo = function()
{
    if (this.state != this.STOPPED)
    {
        this.state = this.STOPPED;
        document.getElementById("play").style.opacity = '1.0';
        document.getElementById("stop").style.opacity = '0.2';
        document.getElementById("pause").style.opacity = '0.2';
        document.getElementById("forward").style.opacity = '0.2';
        document.getElementById("rewind").style.opacity = '0.2';
        Display.status("Stop");
        this.plugin.Stop();
        Display.setTime(0);
        
        if (this.stopCallback)
        {
            this.stopCallback();
        }
    }
    else
    {
        alert("Ignoring stop request, not in correct state");
    }
};

Player.resumeVideo = function()
{
    this.state = this.PLAYING;
    document.getElementById("play").style.opacity = '0.2';
    document.getElementById("stop").style.opacity = '1.0';
    document.getElementById("pause").style.opacity = '1.0';
    document.getElementById("forward").style.opacity = '1.0';
    document.getElementById("rewind").style.opacity = '1.0';
    Display.status("Play");
    this.plugin.Resume();
};

Player.skipForwardVideo = function()
{
    this.skipState = this.FORWARD;
    this.plugin.JumpForward(5);    
};

Player.skipBackwardVideo = function()
{
    this.skipState = this.REWIND;
    this.plugin.JumpBackward(5);
};

Player.getState = function()
{
    return this.state;
};

// Global functions called directly by the player 

Player.onBufferingStart = function()
{
    Display.status("Buffering...");
    switch(this.skipState)
    {
        case this.FORWARD:
            document.getElementById("forward").style.opacity = '0.2';
            break;
        
        case this.REWIND:
            document.getElementById("rewind").style.opacity = '0.2';
            break;
    }
};

Player.onBufferingProgress = function(percent)
{
    Display.status("Buffering:" + percent + "%");
};

Player.onBufferingComplete = function()
{
    Display.status("Play");
    switch(this.skipState)
    {
        case this.FORWARD:
            document.getElementById("forward").style.opacity = '1.0';
            break;
        
        case this.REWIND:
            document.getElementById("rewind").style.opacity = '1.0';
            break;
    }
};

Player.setCurTime = function(time)
{
    Display.setTime(time);
};

Player.setTotalTime = function()
{
    Display.setTotalTime(Player.plugin.GetDuration());
};

onServerError = function()
{
    Display.status("Server Error!");
};

OnNetworkDisconnected = function()
{
    Display.status("Network Error!");
};

getBandwidth = function(bandwidth) { alert("getBandwidth " + bandwidth); };

onDecoderReady = function() { alert("onDecoderReady"); };

onRenderError = function() { alert("onRenderError"); };

stopPlayer = function()
{
    Player.stopVideo();
};

setTottalBuffer = function(buffer) { alert("setTottalBuffer " + buffer); };

setCurBuffer = function(buffer) { alert("setCurBuffer " + buffer); };
