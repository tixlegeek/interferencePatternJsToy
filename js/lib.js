
  var intRand = function(i){
    return Math.floor(Math.random() * Math.floor(i));
  }
  var globaltimer=0;
  var globalrate=0.01;
  var drawNullPattern = false;
  var nullPatternWidth = 2;

  var canvas =  document.getElementById('canvas');

  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;


  var control = function(parent=document.body, type="range", def=0, args={}, name="control", text="Control:", eventId, callback)
  {
    this.type = type;
    this.parent = parent;
    this.args = args;
    this.name = name;
    this.text = text;
    this.eventId = eventId;
    this.callback = callback;
    this.value=def;
    this.input = document.createElement("INPUT");
    this.mon = document.createElement("INPUT");
    this.div=document.createElement("DIV");
    this.label=document.createElement("LABEL");

    this.switchVisibility = (elem) => {
        if (elem.input.checked) {
          this.parent.classList.add('active')
        } else if (!elem.input.checked && elem.name === 'active') {
          this.parent.classList.remove('active')
        }
    }

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
          this.value = this.input.checked?"true":"false";
          this.mon.value = this.value;
          break;
      }
    };

    this.draw = function(){
      this.div.classList.add("inputCombo");
      this.mon.setAttribute("type", "text");
      this.mon.setAttribute("name", this.name+"_mon");
      this.mon.value = this.value;
      this.mon.classList.add("mon_input");


      this.label.setAttribute("for", this.name);
      this.label.innerHTML = this.text;

      switch (this.type) {
        case "range":
        this.input.setAttribute("type", "range");
        this.input.setAttribute("name", this.name);
        this.input.setAttribute("max", this.args.max || 100);
        this.input.setAttribute("min", this.args.min || 0);
        this.input.setAttribute("step", this.args.step || 1);
        this.input.value = this.value;
        this.input.addEventListener(this.eventId, callback.bind(this));
        this.div.appendChild(this.label);
        this.div.appendChild(this.input);
        this.div.appendChild(this.mon);
        break;
        case "checkbox":
        this.input.setAttribute("type", "checkbox");
        this.input.setAttribute("name", this.name);
        this.input.checked = (this.value==false)?false:true;
        this.input.addEventListener(this.eventId, callback.bind(this));
        this.div.appendChild(this.label);
        this.div.appendChild(this.input);
      
      this.switchVisibility(this);  
        break;
        default:

      }
      
      this.parent.appendChild(this.div);

    }

    this.draw();
    return this;
  };
  var emmitter = function(x,y,step, phase=0, f=100, a=50, active=false){
    this.x = x;
    this.y = y;

    this.f = f;
    this.a = a;
    this.phase = phase;
    this.step = step;
        this.d = 0;

    this.animate = false;
    this.offset = 0;
    this.checked = active;

    this.checkedinput=document.createElement("INPUT");
    this.animateinput=document.createElement("INPUT");
    this.ainput=document.createElement("INPUT");
    this.adiv=document.createElement("DIV");
    this.finput=document.createElement("INPUT");
    this.fdiv=document.createElement("DIV");
    this.pinput=document.createElement("INPUT");
    this.pdiv=document.createElement("DIV");
    this.div=document.createElement("DIV");

    this.drawControls = function(){
      var self=this;
      this.div.classList.add("rangeCombo");
      new control(this.div,"checkbox",this.checked, {},"active","Activate :", "click",function(e){self.checked = this.value = this.input.checked;this.changed();});
      new control(this.div,"checkbox",this.animate, {},"animate","Animated :", "click",function(e){self.animate = this.value = this.input.checked;this.changed();});
      new control(this.div,"range",this.f, {max:500, min:1, step:0.5},"freq","Frequency :", "input",function(e){self.f = this.input.value * 1;this.changed();});
      new control(this.div,"range",this.phase, {max:2*Math.PI*100, min:0, step:0.05},"phas","Phase :", "input",function(e){self.phase = this.input.value * 1;this.changed();});
      new control(this.div,"range",this.a, {max:100, min:0, step:1},"ampl","Amplification :", "input",function(e){self.a = this.input.value * 1;this.changed();});
      document.getElementById("controls").appendChild(this.div);
    }

    this.drawControls();
    return this;
  }

  new control(document.getElementById("generalControls"),"range",globalrate, { 'max':1,'min':-1, 'step':.01},"globalrate","Animation Rate:", "input",function(e){globalrate = this.value*1;this.changed();});
  new control(document.getElementById("generalControls"),"checkbox",drawNullPattern, {},"drawNullPattern","Draw Null Pattern :", "click",function(e){drawNullPattern = this.value = this.input.checked;this.changed();});
  new control(document.getElementById("generalControls"),"range",nullPatternWidth, { 'max':20,'min':1, 'step':.01},"drawNullPatternTrigz","Null Pattern width :", "input",function(e){nullPatternWidth = this.value*1;this.changed();});

  var emmitters = [
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15, true),
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15, true),
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15+1),
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15+1),
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15+1),
    new emmitter(intRand(WIDTH),intRand(HEIGHT), function(){}, 0,200,15+1),
  ];
 
  var CANVASOBJ = function(canvas){
    this.canvas = canvas;
    this.emmitter = 0;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width,  this.canvas.height);
    this.drawing=true;

    this.canvas.addEventListener('mousedown', function(e){
      if(this.drawing==false)
      {
        this.emmitter++;
        if(this.emmitter >= emmitters.length)
        this.emmitter=0;
        this.drawing=true;
      }
    }.bind(this));

    this.canvas.addEventListener('mouseup', function(e){
      this.drawing=false;
    }.bind(this));

    this.canvas.addEventListener('mousemove', function(e){
      if(this.drawing)
      {
        var rect = this.canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) * this.canvas.width / this.canvas.clientWidth;
        var y = (e.clientY - rect.top) * this.canvas.height / this.canvas.clientHeight;
        emmitters[this.emmitter].x=x;
        emmitters[this.emmitter].y=y;
      }
    }.bind(this));

    this.pass = function() {
      if(this.ctx){
        var imgData = this.ctx.getImageData(0, 0, this.canvas.width,  this.canvas.height);
        var data = imgData.data;

        for (var i = 0; i < data.length; i += 4) {
          SHADER01(data, i);
        }
        this.ctx.putImageData(imgData, 0, 0);
      }
    };

    this.rIndexData = function(data, i, ix, iy){
      if(!data){
        var imgData = this.ctx.getImageData(0, 0, this.canvas.width,  this.canvas.height);
        var data = imgData.data;
      }
      var ni = i + ((ix+(iy*this.canvas.width))*4);
      if((ni>=0)&&(ni<=data.length))
      return ni;
      return null;
    }

    this.render = function (){
      this.pass();
      for(var j =0; j<emmitters.length; j++)
      {
        if(emmitters[j].checked)
        {
          this.ctx.strokeStyle="#0f0";
          this.ctx.strokeRect(emmitters[j].x-10,emmitters[j].y-10,20,20);
          this.ctx.font = "8px Monospace";
          this.ctx.fillText(emmitters[j].f+", "+Math.floor(emmitters[j].a), emmitters[j].x-10,emmitters[j].y-10 )
        }
      }
      globaltimer+=globalrate;
      //console.log(globaltimer);
      requestAnimationFrame(this.render.bind(this));
    }
    return this;
  }


  var SHADER01 = function(data, i){

    var x = (i/4)%WIDTH;
    var y = Math.floor((i/4)/WIDTH);
    var c = 0;
    var d = 0;
    for(var j =0; j<emmitters.length; j++)
    {
      if(emmitters[j].checked)
      {
        var offset = (emmitters[j].animate)?globaltimer:0;
        emmitters[j].d = Math.sqrt(Math.pow(x - emmitters[j].x,2)+Math.pow(y - emmitters[j].y, 2));
        var ca = (Math.sin(emmitters[j].d*(emmitters[j].f/1000)-((emmitters[j].phase/100) + offset)));
        c += ca*(1/emmitters[j].d*emmitters[j].a);
      }
    }
    c = (c*127)+127;
    data[i+0]= c;
    data[i+1]= (c>127-nullPatternWidth&&c<127+nullPatternWidth&&drawNullPattern)?255:c;
    data[i+2]= c;
  }
  var cnv = new CANVASOBJ(canvas);

  cnv.render();