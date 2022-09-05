// Global Variables  
// for WebGL usage:--------------------
var gl;                     // WebGL rendering context
var canvas;									// HTML-5 'canvas' element ID#
var floatsPerVertex = 7.0;

// holds VBOs & Shaders:-----------------
worldBox = new VBObox0();	
gouraudSphereBox = new VBObox1();	
gouraudFishBox = new VBObox2();
gouraudAnemoneBox = new VBObox3();
phongSphereBox = new VBObox4();
phongFishBox = new VBObox5();
phongAnemoneBox = new VBObox6();

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.

// sphere rotation angle
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 30.0;           // rotation speed, in degrees/second 

var g_angle0now  =   0;       // init Current rotation angle, in degrees
var g_angle0rate = -30.0;       // init Rotation angle rate, in degrees/second.
var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle0min  = -20.0;       // init min, max allowed angle, in degrees.
var g_angle0max  =  20.0;
                                //---------------
var g_angle1now  =   0.0; 		
var g_angle1rate =  30.0;		
var g_angle1brake=	 1.0;			
var g_angle1min  = -20.0;     
var g_angle1max  =  20.0;

// fish wing angle
var g_angle2now  =   0.0; 
var g_angle2rate =  40.0;
var g_angle2brake=	 1.0;	
var g_angle2min  = -20.0;  
var g_angle2max  = 20.0;

var g_angle3now  =   0.0;
var g_angle3rate =  0.5;	
var g_angle3brake=	 1.0;	
var g_angle3min  = -0.8;       
var g_angle3max  = 0.8;	

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 

// For lamp location
var lampx = 5.0;
var lampy = 5.0;
var lampz = 10.0;

// For light rgb values
var ambientr = 0.3;
var ambientg = 0.3;
var ambientb = 0.3;

var diffuser = 0.95;
var diffuseg = 0.95;
var diffuseb = 0.95;

var specularr = 0.8;
var specularg = 0.8;
var specularb = 0.8;

var lightType = true;

var lightOn = true;


// GLOBAL CAMERA CONTROL:		
g_worldMat = new Matrix4();	
g_mvpMat = new Matrix4();


var eyeX = 10.0, eyeY = 0.0, eyeZ = 1.0; // Eye position
var thetarad = Math.PI; //radians
var deltaz = 0.0;
var upX = 0.0, upY = 0.0, upZ = 1.0;


function main() {
  canvas = document.getElementById('webgl');	

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.clearColor(0.0, 0.5, 0.5, 0.7);
  gl.enable(gl.DEPTH_TEST);


  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);
  gouraudSphereBox.init(gl); 
  gouraudFishBox.init(gl);  
  gouraudAnemoneBox.init(gl); 
  phongSphereBox.init(gl); 
  phongFishBox.init(gl);    
  phongAnemoneBox.init(gl);
	
gl.clearColor(0.0, 0.5, 0.5, 0.7);	  // RGBA color for clearing <canvas>
  
 // register key event handler
 document.onkeydown = function(ev){ keydown(ev, gl); };

  var tick = function() {	
    requestAnimationFrame(tick, canvas);
    timerAll();
    resize();
  };
  tick();

  function resize() {
    //Make canvas fill the top 2/3 of our browser window:
    var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
    canvas.width = innerWidth - xtraMargin;
    canvas.height = (innerHeight* (2/3)) - xtraMargin;
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
  
    var vpAspect = canvas.width / canvas.height;
    var near = 1.0;
    var far = 15.0; // 10
    var height = Math.tan((35/2)*(Math.PI)/180) * ((far - near)/3);
    var width = vpAspect * height;
  
    g_worldMat.setIdentity();
    g_worldMat.perspective(30.0,   // FOVY: top-to-bottom vertical image angle, in degrees
                        vpAspect,   // Image Aspect Ratio: camera lens width/height
                        near,   // camera z-near distance (always positive; frustum begins at z = -znear)
                        far);  // camera z-far distance (always positive; frustum ends at z = -zfar)
  
    g_worldMat.lookAt(eyeX, eyeY, eyeZ,	
                      eyeX + Math.cos(thetarad), eyeY + Math.sin(thetarad), eyeZ + deltaz,
                      upX, upY, upZ);	   
    drawAll();
  }
}

function timerAll() {
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {            
    elapsedMS = 1000.0/30.0;
  }

    g_angle01 = g_angle01 + (g_angle01Rate * elapsedMS) / 1000.0; 
	  // Find new time-dependent parameters using the current or elapsed time:
	  g_angle0now += g_angle0rate * g_angle0brake * (elapsedMS * 0.001);	// update.
	  g_angle1now += g_angle1rate * g_angle1brake * (elapsedMS * 0.001);
	  g_angle2now += g_angle2rate * g_angle2brake * (elapsedMS * 0.001);
	  g_angle3now += g_angle3rate * g_angle3brake * (elapsedMS * 0.001);
	  // apply angle limits:  going above max, or below min? reverse direction!
	  if((g_angle0now >= g_angle0max && g_angle0rate > 0) || // going over max, or
		   (g_angle0now <= g_angle0min && g_angle0rate < 0)  ) // going under min ?
		   g_angle0rate *= -1;	// YES: reverse direction.
	  if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or 
		   (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
		   g_angle1rate *= -1;	// YES: reverse direction.
	  if((g_angle2now >= g_angle2max && g_angle2rate > 0) || // going over max, or
		   (g_angle2now <= g_angle2min && g_angle2rate < 0) )	 // going under min ?
		   g_angle2rate *= -1;	// YES: reverse direction.
	  if((g_angle3now >= g_angle3max && g_angle3rate > 0) || // going over max, or
		   (g_angle3now <= g_angle3min && g_angle3rate < 0) )	 // going under min ?
		   g_angle3rate *= -1;
		// *NO* limits? Don't let angles go to infinity! cycle within -180 to +180.
		if(g_angle0min > g_angle0max)	
		{// if min and max don't limit the angle, then
			if(     g_angle0now < -180.0) g_angle0now += 360.0;	// go to >= -180.0 or
			else if(g_angle0now >  180.0) g_angle0now -= 360.0;	// go to <= +180.0
		}
		if(g_angle1min > g_angle1max)
		{
			if(     g_angle1now < -180.0) g_angle1now += 360.0;	
			else if(g_angle1now >  180.0) g_angle1now -= 360.0;
		}
	  if(g_angle2min > g_angle2max)
		{
			if(     g_angle2now < -180.0) g_angle2now += 360.0;	
			else if(g_angle2now >  180.0) g_angle2now -= 360.0;	
		}
	  if(g_angle3min > g_angle3max)
		{
			if(     g_angle3now < -180.0) g_angle3now += 360.0;	
			else if(g_angle3now >  180.0) g_angle3now -= 360.0;	
		}
}

function drawAll() {
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var b4Draw = Date.now();
  var b4Wait = b4Draw - g_lastMS;

	if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	  worldBox.switchToMe();  // Set WebGL to render from this VBObox.
		worldBox.adjust();		  // Send new values for uniforms to the GPU, and
		worldBox.draw();			  // draw our VBO's contents using our shaders.
  }
  if(g_show1 == 1) {
    gouraudSphereBox.switchToMe();  
    gouraudSphereBox.adjust();	
    gouraudSphereBox.draw();

    gouraudFishBox.switchToMe();
    gouraudFishBox.adjust();
    gouraudFishBox.draw();

    gouraudAnemoneBox.switchToMe();
    gouraudAnemoneBox.adjust();
    gouraudAnemoneBox.draw();
	} else if(g_show1 == 0) {
    phongSphereBox.switchToMe();
    phongSphereBox.adjust();
    phongSphereBox.draw();

    phongFishBox.switchToMe();
    phongFishBox.adjust();
    phongFishBox.draw();

    phongAnemoneBox.switchToMe();
    phongAnemoneBox.adjust();
    phongAnemoneBox.draw();
  }
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
  if(g_show1 != 1) g_show1 = 1;			// show,
  else g_show1 = 0;									// hide.
  console.log('g_show1: '+g_show1);
}

function lightSwitch() {
  if(lightOn == true) {
    lightOn = false;
  } else {
    lightOn = true;
  }
}

function moveLamp() {
  lampx = document.getElementById('userLampX').value;
  lampy = document.getElementById('userLampY').value;
  lampz = document.getElementById('userLampZ').value;
}

function setAmbient() {
  ambientr = document.getElementById('userAmbR').value;
  ambientg = document.getElementById('userAmbG').value;
  ambientb = document.getElementById('userAmbB').value;
}

function setDiffuse() {
  diffuser = document.getElementById('userDiffR').value;
  diffuseg = document.getElementById('userDiffG').value;
  diffuseb = document.getElementById('userDiffB').value;
}

function setSpecular() {
  specularr = document.getElementById('userSpecR').value;
  specularg = document.getElementById('userSpecG').value;
  specularb = document.getElementById('userSpecB').value;
}

function changeLightType() {
  if(lightType == true) {
    lightType = false;
    console.log('Phong lighting');
  }
  else {
    lightType = true;
    console.log('Blinn-phong lighting');
  }
}

function keydown(ev, gl) {
	if(ev.keyCode == 39) { // The right arrow key was pressed, we want to strafe right
		eyeX += 0.1 * Math.sin(thetarad);
		eyeY -= 0.1 * Math.cos(thetarad);
	} 
	else if (ev.keyCode == 37) { // The left arrow key was pressed
		eyeX -= 0.1 * Math.sin(thetarad);
		eyeY += 0.1 * Math.cos(thetarad);
	} 
	else if (ev.keyCode == 38) { // Up arrow key
		eyeX += 0.1 * Math.cos(thetarad);
		eyeY += 0.1 * Math.sin(thetarad);
		eyeZ += 0.1 * deltaz;
	} 
  else if (ev.keyCode == 40) { // Down arrow key
		eyeX -= 0.1 * Math.cos(thetarad);
		eyeY -= 0.1 * Math.sin(thetarad);
		eyeZ -= 0.1 * deltaz;
	} 
  else if (ev.keyCode == 87) { // W key
		deltaz += 0.05;
	} 
	else if (ev.keyCode == 65) { // A key
		thetarad += Math.PI/100;
	} 
	else if (ev.keyCode == 83) { // S key
		deltaz -= 0.05;
	} 
	else if (ev.keyCode == 68) { // D key
		thetarad -= Math.PI/100;
	}
  else if (ev.keyCode == 77) { // M key
    gouraudSphereBox.matlSel = (gouraudSphereBox.matlSel +1)%MATL_DEFAULT;
    gouraudSphereBox.matl0.setMatl(gouraudSphereBox.matlSel);

    phongSphereBox.matlSel = (phongSphereBox.matlSel +1)%MATL_DEFAULT;
    phongSphereBox.matl0.setMatl(phongSphereBox.matlSel);
  }	
	else { return; }
  drawAll(); 
}