struct Output {
    @builtin(position) pos: vec4f,
    @location(0) colour: vec3f,
    @location(1) normal: vec3f,
    @location(2) worldPos: vec3f
};

struct MVP {
    matrix: mat4x4f
};

struct NormalMatrix {
    matrix: mat3x3f
};

@group(0) @binding(0)
var<uniform> mvp: MVP;

@group(0) @binding(1)
var<uniform> normMat: NormalMatrix;

@vertex
fn vertexMain(@location(0) pos: vec3f, @location(1) colour: vec3f, @location(2) normal: vec3f) -> Output {

    var out: Output;

    let worldPos = vec4f(pos, 1.0);
    out.worldPos = worldPos.xyz;
    out.pos = mvp.matrix * worldPos;
    out.normal = normalize(normMat.matrix * normal);
    out.colour = colour;

    return out;
}