var RenderingEngine = {}

RenderingEngine.programs = null;
RenderingEngine.textures = null;
RenderingEngine.skybox = null;
RenderingEngine.terrain = null;
RenderingEngine.mirror = null;
RenderingEngine.tree = null;
RenderingEngine.deer = null;
RenderingEngine.shadowmap = null;
RenderingEngine.reflection = null;
RenderingEngine.cube = [];
RenderingEngine.Mcs = [];
RenderingEngine.TexureTree1 = [];
RenderingEngine.TexureTree2 = [];
RenderingEngine.eye = vec3.fromValues(0, 500, 3000);
RenderingEngine.center = vec3.fromValues(0,0,0);
RenderingEngine.up = vec3.fromValues(0,1,0);
RenderingEngine.Sun = vec3.fromValues(-100, 100, -200);
RenderingEngine.sun = vec3.fromValues(-100, 70, -200);
RenderingEngine.sunLook = vec3.fromValues(0,0,0);
RenderingEngine.angle = 0;
RenderingEngine.frequency = 5;
RenderingEngine.timer = 0;
RenderingEngine.ship = null;
RenderingEngine.knotsEye = [
    0,
    6000,
    12000,
    18000,
    28000,
    38000,
    58000,
    68000,
    78000,
    88000,
    99000,
    129000
];
RenderingEngine.valuesEye = [
    vec3.fromValues(0, 300, 4000),
    vec3.fromValues(-500, 300, 3500),
    vec3.fromValues(0, 200, 3000),
    vec3.fromValues(500, 100, 2500),
    vec3.fromValues(-250, 200, 2000),
    vec3.fromValues(250, 100, 1500),
    vec3.fromValues(1000, 200, 0),
    vec3.fromValues(0, 200, -1500),
    vec3.fromValues(-1000, 200, 0),
    vec3.fromValues(0, 200, 1000),
    vec3.fromValues(0, 500, 1500),
    vec3.fromValues(0, 300, 4000)

];

RenderingEngine.valuesShip = [
    vec3.fromValues(0, 0, -500),
    vec3.fromValues(0, 400, -500),
    vec3.fromValues(0, 700, 2000),
    vec3.fromValues(0, 700, -3000),
    vec3.fromValues(0, 400, -700),
    vec3.fromValues(0, 0, -500)
];

RenderingEngine.shipTime = [
    90000,
    100000,
    102500,
    102500,
    120000,
    120000
];

RenderingEngine.knotsSun = [
    0,
    20000,
    40000,
    60000,
    80000
    
];
RenderingEngine.valuesSun = [
    vec3.fromValues(-2000, 500, 0),
    vec3.fromValues(0, 1000, 0),
    vec3.fromValues(0, 500, 2000),
    vec3.fromValues(0, 1000, 0),
    vec3.fromValues(-2000, 500, 0)
];
RenderingEngine.valuessun = [
    vec3.fromValues(-2000, 500, 0),
    vec3.fromValues(0, 1000, 0),
    vec3.fromValues(0, 500, 2000),
    vec3.fromValues(0, 1000, 0),
    vec3.fromValues(-2000, 500, 0)
];

function NormalMatrix(V, M) {
  var VM = mat4.create();
  mat4.multiply(VM, V, M);
  var N = mat3.create();
  mat3.normalFromMat4(N, VM);
  return N;
}

RenderingEngine.DrawSkybox = function(gl, M, V, P) {
    //setup normal matrix
    let N = NormalMatrix(V, M);

    let program = this.programs[1];
    gl.useProgram(program.program);
    // set view and projection matrix
    gl.uniformMatrix4fv(program.uniforms["ModelMatrix"], false, M);
    gl.uniformMatrix4fv(program.uniforms["ViewMatrix"], false, V);
    gl.uniformMatrix3fv(program.uniforms["NormalMatrix"], false, N);
    gl.uniformMatrix4fv(program.uniforms["ProjectionMatrix"], false, P);
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture to texture unit 0
    this.textures[0].Bind(gl);
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(program.uniforms["ImageSampler"], 0);
    // draw the skybox
    this.skybox.Draw(gl);
}

RenderingEngine.DrawBlinnPhong = function(gl, M, V, P, S, models, params) {
    var texture = document.getElementById("texture").checked;
    var nmapping = document.getElementById("nmapping").checked;
    var shadows = document.getElementById("shadows").checked;
    var ambient = document.getElementById("ambient").checked;
    var specular = document.getElementById("specular").checked;
    var diffuse = document.getElementById("diffuse").checked;
    var reflection = document.getElementById("reflection").checked;

    //setup normal matrix
    let N = NormalMatrix(V, M);

    let program = this.programs[0];
    gl.useProgram(program.program);
    // set view and projection matrix
    gl.uniformMatrix4fv(program.uniforms["ModelMatrix"], false, M);
    gl.uniformMatrix4fv(program.uniforms["ViewMatrix"], false, V);
    gl.uniformMatrix3fv(program.uniforms["NormalMatrix"], false, N);
    gl.uniformMatrix4fv(program.uniforms["ProjectionMatrix"], false, P);
    gl.uniformMatrix4fv(program.uniforms["ShadowMatrix"], false, S);
    // set light position
    gl.uniform3fv(program.uniforms["Sun"], this.Sun);
    gl.uniform1f(program.uniforms["ambient_light"], params[0]);
    // set color
    gl.activeTexture(gl.TEXTURE0);
    params[1].Bind(gl);
    gl.uniform1i(program.uniforms["ImageSampler"], 0);
    gl.activeTexture(gl.TEXTURE1);
    params[2].Bind(gl);
    gl.uniform1i(program.uniforms["NormalSampler"], 1);
    gl.activeTexture(gl.TEXTURE2);
    this.textures[0].Bind(gl);
    gl.uniform1i(program.uniforms["EnvironmentSampler"], 2);
    gl.uniform1i(program.uniforms["ShadowSampler"], 3);
    gl.uniform1i(program.uniforms["ReflectionSampler"], 4);
    gl.uniform3fv(program.uniforms["specular_color"], params[3]);
    gl.uniform1f(program.uniforms["shininess"], params[4]);
    gl.uniform1f(program.uniforms["reflection_fraction"], params[5]);
    gl.uniform1f(program.uniforms["bias"], params[6]);

    // set parameters for components
    gl.uniform1i(program.uniforms["p_reflection"], reflection);
    gl.uniform1i(program.uniforms["p_nmapping"], nmapping);
    gl.uniform1i(program.uniforms["p_shadows"], shadows);
    gl.uniform1i(program.uniforms["p_ambient"], ambient);
    gl.uniform1i(program.uniforms["p_texture"], texture);
    gl.uniform1i(program.uniforms["p_specular"], specular);
    gl.uniform1i(program.uniforms["p_diffuse"], diffuse);
    gl.uniform1i(program.uniforms["mirror"], params[7]);


    // draw the car
    for (let i = 0; i < models.length; i++) {
        models[i].Draw(gl);
    }
}

RenderingEngine.DrawShadowmap = function(gl, Ms, models) {
    this.shadowmap.Bind(gl);
    gl.viewport(0, 0, this.shadowmap.size, this.shadowmap.size);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var Pd = mat4.create();
    var sdist = 4000;
    mat4.ortho(Pd, -sdist, sdist, -sdist, sdist, 0.1, 4500);
    var Vd = mat4.create();
    mat4.lookAt(Vd, this.sun, this.sunLook, this.up);

    var depthMVP = mat4.create();
    mat4.multiply(depthMVP, Pd, Vd);

    gl.useProgram(this.programs[2].program);
    gl.uniformMatrix4fv(this.programs[2].uniforms["ViewMatrix"], false, Vd);
    gl.uniformMatrix4fv(this.programs[2].uniforms["ProjectionMatrix"], false, Pd);
    for (let i = 0; i < Ms.length; i++) {
        gl.uniformMatrix4fv(this.programs[2].uniforms["ModelMatrix"], false, Ms[i]);
        for (let j = 0; j < models[i].length; j++) {
            models[i][j].Draw(gl);
        }
    }

    this.shadowmap.Unbind(gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.activeTexture(gl.TEXTURE3);
    this.shadowmap.depth.Bind(gl);

    return depthMVP;
}

RenderingEngine.DrawReflection = function(gl, Ms, models) {
    this.reflection.Bind(gl);
    gl.viewport(0, 0, this.reflection.size, this.reflection.size);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var Pd = mat4.create();
    var sdist = 4000;
    mat4.ortho(Pd, -sdist, sdist, -sdist, sdist, 0.1, 4500);
    var Vd = mat4.create();
    mat4.lookAt(Vd, vec3.fromValues(0, 0, -700), vec3.fromValues(0, 300, 4000), this.up);

    var depthMVP = mat4.create();
    mat4.multiply(depthMVP, Pd, Vd);

    gl.useProgram(this.programs[3].program);
    gl.uniformMatrix4fv(this.programs[3].uniforms["ViewMatrix"], false, Vd);
    gl.uniformMatrix4fv(this.programs[3].uniforms["ProjectionMatrix"], false, Pd);
    for (let i = 0; i < Ms.length; i++) {
        gl.uniformMatrix4fv(this.programs[3].uniforms["ModelMatrix"], false, Ms[i]);
        for (let j = 0; j < models[i].length; j++) {
            models[i][j].Draw(gl);
        }
    }

    this.reflection.Unbind(gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.activeTexture(gl.TEXTURE4);
    this.reflection.reflection.Bind(gl);

    return depthMVP;
}

RenderingEngine.Render = function(gl, previous) {
    // get ellapsed time in miliseconds
    var current = Date.now();
    var millis = current - previous;
    this.timer += millis;
    // animete camera and sun
    this.eye = InterpolateVectorsCubic(this.knotsEye, this.valuesEye, this.timer, true);
    this.Sun = InterpolateVectorsCubic(this.knotsSun, this.valuesSun, this.timer, true);
    this.sun = InterpolateVectorsCubic(this.knotsSun, this.valuessun, this.timer, true);
    // create projection matrix
    var P = mat4.create();
    mat4.perspective(P, 40*0.0174532925, 1280/720, 0.1, 6000);
    // create view matrix
    var V = mat4.create();
    mat4.lookAt(V, this.eye, this.center, this.up);
    // create skybox model matrix
    var S = mat4.create();
    var scaling = vec3.fromValues(4000,4000,4000);
    mat4.fromScaling(S, scaling);
    var T = mat4.create();
    var translation = vec3.fromValues(0,0,0);
    mat4.fromTranslation(T, translation);
    mat4.multiply(S, T, S);

    // create terrain model matrix
    var Tm = mat4.create();
    mat4.fromScaling(Tm, scaling);

    // create terrain model matrix
    var Mm = mat4.create();
    mat4.fromTranslation(Mm, vec3.fromValues(0, 0, -700));

    // create sphere rotate matrix
    //let St = mat4.create();
    let Stb = mat4.create();
    //let Sr = mat4.create();
    let SM = mat4.create();
    //let forwardRotation = mat4.create();
    let scaleMatrix = mat4.create();

    //var ball_radius = 25;
    //var amplitude = 60;
    //var max_penetration = 2/(1+Math.exp(-amplitude/60))-1;
    //var height = ball_radius+amplitude*Math.abs(Math.sin(10/Math.sqrt(amplitude)*this.frequency*this.angle))-max_penetration*ball_radius;

    //var squish = Math.min((height+ball_radius)/ball_radius/2, 1);
    //height = height - (height-ball_radius)/2;

    //var trajectory_radius = 80;

    //mat4.fromScaling(scaleMatrix,vec3.fromValues(Math.sqrt(1/squish)*ball_radius*2,squish*ball_radius*2,Math.sqrt(1/squish)*ball_radius*2));
    
    //mat4.fromTranslation(St, vec3.fromValues(trajectory_radius, height, 0));
    //mat4.fromRotation(Sr, this.angle, vec3.fromValues(0, 1, 0));
    mat4.fromTranslation(Stb, vec3.fromValues(0, 0, 0));

    mat4.fromScaling(scaleMatrix,vec3.fromValues(2,2,2));// size deer
    mat4.multiply(SM, SM, scaleMatrix);
    //mat4.multiply(SM, Sr, SM);
    mat4.multiply(SM, Stb, SM);
    //this.angle += (millis / 33)*0.0174532925;

    
    var shipTraslate = InterpolateVectorsCubic(this.shipTime, this.valuesShip, this.timer, true);
    //let rotMatrixShip = mat4.create();
    //mat4.fromRotation(rotMatrixShip, 90, vec3.fromValues(0, 1, 0));
    let ShipM = mat4.create();
    var ShipT = mat4.create();
    mat4.fromTranslation(ShipT, shipTraslate);
    mat4.multiply(ShipM, ShipM, ShipT);

    // clear color to background
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // render shadowmap
    var elements = [];
    var Matrices = [];
    for (var i = 0; i < 70; i++) {
        elements.push(this.tree)
        Matrices.push(this.Mcs[i])
    }
    elements.push(this.deer)
    Matrices.push(SM)
    elements.push(this.ship)
    Matrices.push(ShipM)
    var depthMVP = this.DrawShadowmap(gl, Matrices, elements);
    var reflectionMVP = this.DrawReflection(gl, Matrices, elements);
    var skybox = document.getElementById("skybox").checked;
    if(skybox){
        // render skybox
        gl.disable(gl.CULL_FACE);
        this.DrawSkybox(gl, S, V, P);
        gl.enable(gl.CULL_FACE);
    }
    // render terrain
    this.DrawBlinnPhong(gl, Tm, V, P, depthMVP, [this.terrain], [
        0.1,
        this.textures[1],
        this.textures[5],
        vec3.fromValues(1, 1, 1),
        1000,
        0,
        1e-3,
        false
    ]);
    // render mirror
    this.DrawBlinnPhong(gl, Mm, V, P, reflectionMVP, [this.mirror], [
        0.1,
        this.textures[1],
        this.textures[5],
        vec3.fromValues(1, 1, 1),
        1000,
        0,
        1e-3,
        false
    ]);
    // render ship
    this.DrawBlinnPhong(gl, ShipM, V, P, depthMVP, this.ship, [
        0.1,
        this.textures[11],
        this.textures[12],
        vec3.fromValues(1, 1, 1),
        1000,
        0.3,
        1e-3,
        false
    ]);
    // render deer
    this.DrawBlinnPhong(gl, SM, V, P, depthMVP, this.deer, [
        0.05,
        this.textures[9],
        this.textures[10],
        vec3.fromValues(1, 1, 1),
        120,
        0.6,
        5e-3,
        false
    ]);
    // render Grass
    /*this.DrawBlinnPhong(gl, SM, V, P, depthMVP, this.grass, [
        1,
        this.textures[2],
        this.textures[4],
        vec3.fromValues(0, 1, 0),
        40,
        0,
        5e-3
    ]);
    */
    
    // render the cubes
    for (let i = 0; i < 70; i++) {
        this.DrawBlinnPhong(gl, this.Mcs[i], V, P, depthMVP, this.tree, [
            0.05,
            this.textures[this.TexureTree1[i]],
            this.textures[this.TexureTree2[i]],
            vec3.fromValues(1, 1, 1),
            50,
            0,
            1e-3,
            false
        ]);
    }

    // repeat the rendering after a delay
    var _this = this;
    window.requestAnimationFrame(function() {_this.Render(gl, current);});
}
