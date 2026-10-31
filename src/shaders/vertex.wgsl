struct Uniforms {
    mvp: mat4x4f,
    normalMatrix: mat3x3f,
    meshColour: vec4f
}

struct Output {
    @builtin(position) pos: vec4f,
    @location(0) colour: vec3f,
    @location(1) normal: vec3f,
    @location(2) worldPos: vec3f
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@location(0) pos: vec3f, @location(1) colour: vec3f, @location(2) normal: vec3f) -> Output {
    var out: Output;

    let localPos = vec4f(pos, 1.0);

    out.pos = uniforms.mvp * localPos;
    out.worldPos = pos;
    out.normal = normalize(uniforms.normalMatrix * normal);
    out.colour = colour;

    return out;
}