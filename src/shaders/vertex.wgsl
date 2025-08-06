struct output {
    @builtin(position) pos: vec4f,
    @location(0) colour: vec3f,
    @location(1) normal: vec3f
};

@group(0) @binding(0) var<uniform> mvp: mat4x4f;
@group(0) @binding(1) var<uniform> normMat: mat3x3f;

@vertex
fn vertexMain(@location(0) pos: vec3f, @location(1) colour: vec3f, @location(2) normal: vec3f) -> output {
    var out: output;
    out.pos = mvp * vec4f(pos, 1.0);
    out.normal = normalize(normMat * normal);
    out.colour = colour;
    
    return out;
}