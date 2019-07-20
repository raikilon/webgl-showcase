"use strict";

function InitGL(canvasID) {
    // get canvas by ID
    var canvas = document.getElementById(canvasID);
    // get webgl context
    var gl = canvas.getContext("webgl2");
    // set webgl viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // set webgl depth test to less or equal
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // set backface culling to true
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearStencil(0);
    // check if everything went ok
    if (gl) {
        return gl;
    }
    console.log("WebGL context failed to initialize");
}

function main(images) {
    // init WebGL
    var gl = InitGL("window");
    // load textures
    RenderingEngine.textures = [
        new GLTexture.CreateCubeMap(gl, [
            images[0],
            images[1],
            images[2],
            images[3],
            images[4],
            images[5]
        ]),
        new GLTexture.CreateTexture2D(gl, images[6], true),
        new GLTexture.CreateTexture2D(gl, images[7]),
        new GLTexture.CreateTexture2D(gl, images[8]),
        new GLTexture.CreateTexture2D(gl, images[9]),
        new GLTexture.CreateTexture2D(gl, images[10],true),
        new GLTexture.CreateTexture2D(gl, images[11]),
        new GLTexture.CreateTexture2D(gl, images[12]),
        new GLTexture.CreateTexture2D(gl, images[13]),
        new GLTexture.CreateTexture2D(gl, images[14]),
        new GLTexture.CreateTexture2D(gl, images[15]),
        new GLTexture.CreateTexture2D(gl, images[16], true),
        new GLTexture.CreateTexture2D(gl, images[17], true)
    ];
    // create our programs
    var skybox_program = new GLProgram.Create(gl, SKYBOX_VERT_SOURCE, SKYBOX_FRAG_SOURCE);
    // get uniforms for model, view, and projection matrix
    skybox_program.GetUniforms(gl, [
        "ModelMatrix",
        "ViewMatrix",
        "NormalMatrix",
        "ProjectionMatrix",
        "ImageSampler",
    ]);
    var blinnphong_program = new GLProgram.Create(gl, BLINNPHONG_VERT_SOURCE, BLINNPHONG_FRAG_SOURCE);
    // get uniforms for model, view, and projection matrix
    blinnphong_program.GetUniforms(gl, [
        "ModelMatrix",
        "ViewMatrix",
        "NormalMatrix",
        "ProjectionMatrix",
        "ImageSampler",
        "specular_color",
        "NormalSampler",
        "shininess",
        "Sun",
        "ambient_light",
        "reflection_fraction",
        "EnvironmentSampler",
        "ShadowSampler",
        "ShadowMatrix",
        "bias",
        "p_texture",
        "p_reflection",
        "p_nmapping",
        "p_shadows",
        "p_ambient",
        "p_specular",
        "p_diffuse",
        "mirror",
        "ReflectionSampler"

    ]);
    var shadowmap_program = new GLProgram.Create(gl, SHADOWMAP_VERT_SOURCE, SHADOWMAP_FRAG_SOURCE);
    // get uniforms for model, view, and projection matrix
    shadowmap_program.GetUniforms(gl, [
        "ModelMatrix",
        "ViewMatrix",
        "ProjectionMatrix"
    ]);
    // create shadowmap fbo
    RenderingEngine.shadowmap = new GLFrameBuffer.Create(gl, 4096);

    var reflection_program = new GLProgram.Create(gl, SHADOWMAP_VERT_SOURCE, SHADOWMAP_FRAG_SOURCE);
    // get uniforms for model, view, and projection matrix
    reflection_program.GetUniforms(gl, [
        "ModelMatrix",
        "ViewMatrix",
        "ProjectionMatrix"
    ]);
    // create shadowmap fbo
    RenderingEngine.reflection = new GLFrameBuffer.CreateReflection(gl, 4096);
    // create skybox
    RenderingEngine.skybox = GLModels.CreateCube(gl);
    // create terrain
    RenderingEngine.terrain = GLModels.CreateTerrain(gl);
    // create terrain
    RenderingEngine.mirror = GLModels.CreateTerrain(gl);
    // create 3 textured cubes
    RenderingEngine.cube = GLModels.CreateCube(gl);

    var rotations = [];
    var scales = [];
    var translations = [];
    var z = 200;
    for (var j = 0; j < 10; j++) {
        var start_pos = -1500
        for (var i = 0; i < 7; i++) {
            var size = (Math.random() * 0.5) + 0.5;
            scales.push(vec3.fromValues(size, size, size));

            start_pos += Math.floor((Math.random() * 300) + 200);
            translations.push(vec3.fromValues(start_pos, 0, z + Math.floor((Math.random() * 300) + 200)))

            var rot = Math.floor((Math.random() * 360));
            rotations.push(rot)
        }
        z += 300;
    }

    for (let i = 0; i < rotations.length; i++) {
        RenderingEngine.Mcs[i] = mat4.create();
        RenderingEngine.TexureTree1.push(Math.floor(Math.random()*(4-2+1)+2))
        RenderingEngine.TexureTree2.push(Math.floor(Math.random()*(8-6+1)+6))
        let S = mat4.create();
        mat4.fromScaling(S, scales[i]);
        let R = mat4.create();
        mat4.fromRotation(R, rotations[i], vec3.fromValues(0, 1, 0))
        let T = mat4.create();
        mat4.fromTranslation(T, translations[i]);
        mat4.multiply(RenderingEngine.Mcs[i], S, R);
        mat4.multiply(RenderingEngine.Mcs[i], T, RenderingEngine.Mcs[i]);
    }
    // create sphere
    RenderingEngine.tree = GLModels.LoadOBJs(gl, [TREE]);
    RenderingEngine.deer = GLModels.LoadOBJs(gl, [DEER]);
    RenderingEngine.ship = GLModels.LoadOBJs(gl, [SHIP]);
    // setup renderer with webgl programs, and vaos
    RenderingEngine.programs = [
        blinnphong_program,
        skybox_program,
        shadowmap_program,
        reflection_program
    ];
    // start the rendering loop
    RenderingEngine.Render(gl, Date.now());
}

GLTexture.LoadImages([
    "textures/px.jpg",
    "textures/nx.jpg",
    "textures/py.jpg",
    "textures/ny.jpg",
    "textures/pz.jpg",
    "textures/nz.jpg",
    "textures/Snow_003_COLOR.jpg",
    "textures/Agate_001_COLOR.jpg",
    "textures/Agate_002_COLOR.jpg",
    "textures/Lapis_Lazuli_001_COLOR.jpg",
    "textures/Snow_003_NORM.jpg",
    "textures/Agate_001_NORM.jpg",
    "textures/Agate_002_NORM.jpg",
    "textures/Lapis_Lazuli_001_NORM.jpg",
    "textures/Shingles_Wood_Stylized_001_baseColor.jpg",
    "textures/Shingles_Wood_Stylized_001_normal.jpg",
    "textures/Gold_Nugget_001_COLOR.JPG",
    "textures/Gold_Nugget_001_NORM.jpg"
], main);
