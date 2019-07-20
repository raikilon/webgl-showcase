GLFrameBuffer = {};

GLFrameBuffer.Create = function(gl, size) {
    // create fbo
    this.fbo = gl.createFramebuffer();
    this.size = size;
    this.Bind = function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    }
    this.Unbind = function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // bind frame buffer
    this.Bind(gl);
    // create texture for depth attachment
    this.depth = new GLTexture.CreateDepthTexture(gl, size, size);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depth.texture, 0);
    // set buffers for writing
    gl.drawBuffers([gl.NONE]);
    // unbind buffer
    this.Unbind(gl);

    return this;
}

GLFrameBuffer.CreateReflection = function(gl, size) {
    // create fbo
    this.fbo = gl.createFramebuffer();
    this.size = size;
    this.Bind = function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    }
    this.Unbind = function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // bind frame buffer
    this.Bind(gl);
    // create texture for depth attachment
    this.reflection = new GLTexture.CreateReflectionTexture(gl, size, size);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.reflection.texture, 0);
    // set buffers for writing
    gl.drawBuffers([gl.NONE]);
    // unbind buffer
    this.Unbind(gl);

    return this;
}
