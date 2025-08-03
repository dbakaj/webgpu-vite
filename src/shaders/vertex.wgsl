struct output {
    @builtin(position) pos: vec4f,
    @location(0) colour: vec3f
};

@vertex
fn vertexMain(@location(0) pos: vec2f, @location(1) colour: vec3f) -> output {
    var out: output;
    out.pos = vec4f(pos, 0.0, 1.0);
    out.colour = colour;
    
    return out;
}