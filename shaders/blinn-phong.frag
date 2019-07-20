var BLINNPHONG_FRAG_SOURCE = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision highp float;

in vec4 vertex_eye;
in vec4 normal_eye;
in vec4 light_eye;
in vec3 tangent_eye;
in vec3 bitangent_eye;
in vec2 uvs;
in vec4 shadowCoord;

uniform float ambient_light;
uniform vec3 specular_color;
uniform float shininess;
uniform float reflection_fraction;
uniform float bias;
uniform int p_reflection;
uniform int p_nmapping;
uniform int p_shadows;
uniform int p_ambient;
uniform int p_texture;
uniform int p_specular;
uniform int p_diffuse;
uniform int mirror;

uniform mat4 ViewMatrix;

const float gamma = 2.2;

uniform sampler2D ImageSampler;
uniform sampler2D NormalSampler;
uniform sampler2D ShadowSampler;
uniform sampler2D ReflectionSampler;
uniform samplerCube EnvironmentSampler;

layout(location=0) out vec4 fColor;

void main() {
    //shadow visibility
    float visibility = 1.0;
    if(p_shadows == 1){
        vec4 shadowmap = texture(ShadowSampler, shadowCoord.xy);
        float depth = shadowmap.r;
        if (depth < shadowCoord.z - bias) {
            visibility = 0.0;
        }
    }

    
    // normalize v ectors for light calculation
    vec4 V = normalize(vertex_eye);
   	vec4 L = normalize(light_eye);
   	vec4 N = normalize(normal_eye);
   	vec4 No = normalize(normal_eye);
   	vec3 T = normalize(tangent_eye);
   	vec3 B = normalize(bitangent_eye);
    // adjust normal using normal map
    mat3 TBNt = mat3(T, B, vec3(N));
    mat3 TBN = transpose(TBNt);
    V = vec4(TBN * vec3(V), 0.0);
    L = vec4(TBN * vec3(L), 0.0);
    vec4 H = normalize(L + V);
    if(p_nmapping == 1){
        N = normalize(vec4(vec3(texture(NormalSampler, uvs)*2.0 - 1.0), 0.0));
    }
    vec3 R = -vec3(reflect(V, N));
    R = inverse(mat3(ViewMatrix))*TBNt*R;
    // get diffuse coefficient
    float NdotL = clamp(dot(N, L), 0.0, 1.0);
    float NdotH = clamp(dot(N, H), 0.0, 1.0);
    vec3 diffuse_color = vec3(1,1,1);
    if(p_texture == 1){
        diffuse_color = pow(texture(ImageSampler, uvs).rgb, vec3(gamma));
    }
    vec3 rColor = vec3(0,0,0);
    if(p_reflection == 1){
        rColor = pow(texture(EnvironmentSampler, R.xyz).rgb, vec3(gamma));
        diffuse_color = (1.f-reflection_fraction)*diffuse_color + reflection_fraction*rColor;
    }
    vec3 color = vec3(0,0,0);
    if(mirror == 1){
        vec4 reflectionmap = texture(ReflectionSampler, shadowCoord.xy);
        color = reflectionmap.xyz;
    }
    
    if(p_ambient == 1){
        color = color + diffuse_color*ambient_light/2.0*dot(N, No);
    }

    if(p_diffuse == 1){
        color = color + visibility*(diffuse_color*(NdotL));
    }

    if(p_specular == 1){
        color = color + visibility*(NdotL*specular_color*pow(NdotH, shininess));
    }

    fColor = vec4(pow(color, vec3(1.0/gamma)), 1);
}
`;
