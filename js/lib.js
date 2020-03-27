  // Little helper which return a random uint
  var uirand = function(i){
    return Math.floor(Math.random() * Math.floor(i));
  }

  // Dummy object to handle global controls.
  var globalControlScope = {
    div: document.getElementById("generalControls"),
    timer:0,
    rate:0.01,
    drawNullPattern :false,
    nullPatternWidth :2,
    bwh: 5,
  };

  // This canvas will display the interference pattern
  var canvas =  document.getElementById('canvas');
  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;

  /*
      Control object. This method will create and bind a control to
      an object's value.
  */
  var CONTROL = function(parent, type="range", def=0, args={}, name="value", text="Control:", eventId, callback)
  {
    this.type = type;         // Control type ( range/checkbox )
    this.parent = parent;     // Parent of the control. must contain Name as value
    this.args = args;         // Arguments used by the control
    this.name = name;         // Name of the binded value.
    this.text = text;         // Text to be displayed.
    this.value=def;           // Value

    this.eventId = eventId;   // eventId triggering the callback.
    this.callback = callback; // Callback, triggered on enventId.

    this.input = document.createElement("INPUT"); // DOM Input manipulated by the user
    this.mon = document.createElement("INPUT");   // DOM Input monitoring the value
    this.div=document.createElement("DIV");       // DOM Div, which contains everything
    this.label=document.createElement("LABEL");   // DOM Label, used to display the control name.

    // Show and hide the control
    this.switchVisibility = (elem) => {
      if (elem.input.checked) {
        this.parent.div.classList.add('active')
      } else if (!elem.input.checked && elem.name === 'active') {
        this.parent.div.classList.remove('active')
      }
    }

    // Updates the control value when changed.
    this.changed = function(){
      switch (this.type) {
        case 'checkbox':
          this.value = this.input.checked?"true":"false";
          this.mon.value = this.value;
          if (this.name == 'active') {
            this.switchVisibility(this);
          }
        break;
        default:
          this.value = this.input.value;
          this.mon.value = this.value;
        break;
      }
    };

    // Draw the control on parent.div
    this.draw = function(){

      this.div.classList.add("inputCombo");
      // Setup the monitor input
      this.mon.setAttribute("type", "text");
      this.mon.setAttribute("name", this.name+"_mon");
      this.mon.value = this.value;
      this.mon.classList.add("mon_input");
      // Setup the label
      this.label.setAttribute("for", this.name);
      this.label.innerHTML = this.text;

      switch (this.type) {
        case "range":
          // Setup the range input
          this.input.setAttribute("type", "range");
          this.input.setAttribute("name", this.name);
          this.input.setAttribute("max", this.args.max || 100);
          this.input.setAttribute("min", this.args.min || 0);
          this.input.setAttribute("step", this.args.step || 1);
          this.input.value = this.value;
          // Callback of the input
          this.input.addEventListener(this.eventId, callback.bind(this));
          // update the slider from mon input.
          this.mon.addEventListener("keyup", function(e){ this.parent[this.name] = this.input.value = this.mon.value;this.changed(); }.bind(this));
          // Fills the div with created elements
          this.div.appendChild(this.label);
          this.div.appendChild(this.input);
          this.div.appendChild(this.mon);
        break;
        case "checkbox":
          // Setup the checkbox input
          this.input.setAttribute("type", "checkbox");
          this.input.setAttribute("name", this.name);
          this.input.checked = (this.value==false)?false:true;
          // Callback of the input
          this.input.addEventListener(this.eventId, callback.bind(this));
          // Fills the div with created elements
          this.div.appendChild(this.label);
          this.div.appendChild(this.input);
          this.switchVisibility(this);
        break;
        default:
      }


    }
    // Draws and apply the control to the parent.
    this.draw();
    if(this.parent.div)
      this.parent.div.appendChild(this.div);
    return this;
  };

  var EMITTER = function(x,y,step, phase=0, f=100, a=50, active=false){
    // set default value to highlight
    let hightlightStatus = true;

    this.x = x;           // x position of the emitter on the canvas.
    this.y = y;           // y position of the emitter on the canvas.

    this.f = f;           // Frequency
    this.a = a;           // Amplitude
    this.phase = phase;   // Phase
    this.step = step;     // Callback (not used for now)
    this.d = 0;           // Used in rendering. It stores the d value when rasterizing the interferences
    this.hl = false;      // Is the emitter selected?
    this.animate = false; // Is the emitter animated?
    this.checked = active;// Is the emitter activated?

    this.checkedinput=document.createElement("INPUT");  // DOM Input tweaking emitter's checkbox
    this.animateinput=document.createElement("INPUT");  // DOM Input tweaking emitter's animation state

    this.ainput=document.createElement("INPUT");        // DOM Input tweaking emitter's amplitude value
    this.adiv=document.createElement("DIV");            // DOM Div containing amplitude control.

    this.finput=document.createElement("INPUT");        // DOM Input tweaking emitter's frequency value
    this.fdiv=document.createElement("DIV");            // DOM Div containing frequency control.

    this.pinput=document.createElement("INPUT");        // DOM Input tweaking emitter's phase value
    this.pdiv=document.createElement("DIV");            // DOM Div containing phase control.

    this.div=document.createElement("DIV");             // DOM Div containing the controls

    // Draws emitter's controls
    this.drawControls = function(){
      var self=this;
      this.div.classList.add("rangeCombo");
      new CONTROL(this,"checkbox",this.checked, {},"active","Activate :", "click",function(e){self.checked = this.value = this.input.checked;this.changed();});
      new CONTROL(this,"checkbox",this.animate, {},"animate","Animated :", "click",function(e){self.animate = this.value = this.input.checked;this.changed();});
      new CONTROL(this,"range",this.f, {max:500, min:1, step:0.5},"f","Frequency :", "input",function(e){self.f = this.input.value * 1;this.changed();});
      new CONTROL(this,"range",this.phase, {max:2*Math.PI*100, min:0, step:0.05},"phase","Phase :", "input",function(e){self.phase = this.input.value * 1;this.changed();});
      new CONTROL(this,"range",this.a, {max:100, min:0, step:1},"a","Amplification :", "input",function(e){self.a = this.input.value * 1;this.changed();});
      document.getElementById("controls").appendChild(this.div);
    }

    // Highlights the control oh the emitter.
    this.highlight = function(hightlightStatus){
      this.hl = hightlightStatus|false;
      if(hightlightStatus)
      this.div.classList.add("selectedCombo");
      else
      this.div.classList.remove("selectedCombo");
    }

    // Create and apply controls to the page.
    this.drawControls();
    return this;
  }


  var CANVASOBJ = function(canvas){
    this.canvas = canvas;
    this.emitter = 0;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = 'miter';
    this.ctx.miterLimit = 2; // fiddle around until u find the miterLimit that looks best to you.
    this.ctx.fillRect(0, 0, this.canvas.width,  this.canvas.height);
    this.drawing=true;

    // Handle clicks.
    this.canvas.addEventListener('mousedown', function(e){
      if(this.drawing==false)
      {
        var nearest = null;
        var rect = this.canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) * this.canvas.width / this.canvas.clientWidth;
        var y = (e.clientY - rect.top) * this.canvas.height / this.canvas.clientHeight;
        var nd = globalControlScope.bwh<<1;
        var ne = null;
        // find nearest emitter
        for(var n  in emitters)
        {
          emitters[n].highlight(false);
          if(emitters[n].checked == true){
            d =  Math.sqrt(Math.pow(x - emitters[n].x,2)+Math.pow(y - emitters[n].y, 2));
            if(d<nd)
            {
              nd=d;
              ne=n;
            }
          }
        }
        this.emitter = ne;
        // If user clicked on an emitter, it highlights.
        if(this.emitter!=null)
        {
          emitters[this.emitter].highlight();
        }
        this.drawing=true;
      }
    }.bind(this));

    // Handle mouseUp.
    this.canvas.addEventListener('mouseup', function(e){
      this.drawing=false;
    }.bind(this));

    // Handle dragging
    this.canvas.addEventListener('mousemove', function(e){
      if(this.drawing)
      {
        var rect = this.canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) * this.canvas.width / this.canvas.clientWidth;
        var y = (e.clientY - rect.top) * this.canvas.height / this.canvas.clientHeight;
        if(this.emitter!=null){
          emitters[this.emitter].x=x;
          emitters[this.emitter].y=y;
        }
      }
    }.bind(this));

    // Each pass updates the entire canvas.
    this.pass = function() {
      if(this.ctx){
        // Extract pixel data.
        var imgData = this.ctx.getImageData(0, 0, this.canvas.width,  this.canvas.height);
        var data = imgData.data;
        // Pass over everything.
        for (var i = 0; i < data.length; i += 4) {
          SHADER01(data, i);
        }
        // Put computed data on the canvas.
        this.ctx.putImageData(imgData, 0, 0);
      }
    };

    // Get Pixel index relative to another one (not used, but, what can you do about it?)
    this.rIndexData = function(data, i, ix, iy){
      if(!data){
        var imgData = this.ctx.getImageData(0, 0, this.canvas.width,  this.canvas.height);
        var data = imgData.data;
      }
      var ni = i + ((ix+(iy*this.canvas.width))<<2);
      if((ni>=0)&&(ni<=data.length))
      return ni;
      return null;
    }

    // The renderer makes a pass, draw some things on the canvas, and call for the next rendering.
    this.render = function (){
      this.pass();
      for(var j =0; j<emitters.length; j++)
      {
        if(emitters[j].checked)
        {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle=emitters[j].hl?"#0f0":"#f00";
          this.ctx.strokeRect(emitters[j].x-globalControlScope.bwh,emitters[j].y-globalControlScope.bwh,globalControlScope.bwh<<1,globalControlScope.bwh<<1);
          this.ctx.font = "7px Monospace";
          this.ctx.strokeStyle="#000";
          this.ctx.fillStyle="#cdf";
          this.ctx.lineWidth = 3;
          this.ctx.strokeText(emitters[j].f+"|"+Math.floor(emitters[j].a)+"|"+Math.floor(emitters[j].phase), emitters[j].x-10,emitters[j].y-10 )
          this.ctx.fillText(emitters[j].f+"|"+Math.floor(emitters[j].a)+"|"+Math.floor(emitters[j].phase), emitters[j].x-10,emitters[j].y-10 )
        }
      }
      globalControlScope.timer+=globalControlScope.rate;
      requestAnimationFrame(this.render.bind(this));
    }
    return this;
  }


  /*
      Shader. I planned to incorporate multiple ones, but, it turned out to be the only one.
  */
  var SHADER01 = function(data, i){
    // Fond x and y from i
    var x = (i/4)%WIDTH;
    var y = Math.floor((i/4)/WIDTH);
    // point value;
    var c = 0;

    // Computes the rasterized value.
    for(var j =0; j<emitters.length; j++)
    {
      if(emitters[j].checked)
      {
        var offset = (emitters[j].animate)?globalControlScope.timer:0;
        emitters[j].d = Math.sqrt(Math.pow(x - emitters[j].x,2)+Math.pow(y - emitters[j].y, 2));
        var ca = (Math.sin(emitters[j].d*(emitters[j].f/1000)-((emitters[j].phase/100) + offset)));
        c += ca*(1/emitters[j].d*emitters[j].a);
      }
    }
    // Normalizes the value.
    c = (c*127)+127;
    data[i+0]= c;
    // Plot twist: green channel is used to visualize null patterns.
    data[i+1]= (c>127-globalControlScope.nullPatternWidth&&c<127+globalControlScope.nullPatternWidth&&globalControlScope.drawNullPattern)?255:c;
    data[i+2]= c;
  }

    // Create global controls.
    new CONTROL(globalControlScope,"range",globalControlScope.rate, { 'max':1,'min':-1, 'step':.01},"globalControlScope.rate","Animation Rate:", "input",function(e){globalControlScope.rate = this.value*1;this.changed();});
    new CONTROL(globalControlScope,"checkbox",globalControlScope.drawNullPattern, {},"globalControlScope.drawNullPattern","Draw Null Pattern :", "click",function(e){globalControlScope.drawNullPattern = this.value = this.input.checked;this.changed();});
    new CONTROL(globalControlScope,"range",globalControlScope.nullPatternWidth, { 'max':20,'min':1, 'step':.01},"globalControlScope.drawNullPatternTrigz","Null Pattern width :", "input",function(e){globalControlScope.nullPatternWidth = this.value*1;this.changed();});

    // Create emitters.
    var emitters = [
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15, true),
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15, true),
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15+1),
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15+1),
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15+1),
      new EMITTER(uirand(WIDTH),uirand(HEIGHT), function(){}, 0,200,15+1),
    ];

    // Create the canvas obj.
    var CANVAS = new CANVASOBJ(canvas);

    // start rendering.
    CANVAS.render();
