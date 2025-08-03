@fragment
fn fragmentMain(@location(0) colour: vec3f) -> @location(0) vec4f {
    return vec4f(colour, 1.0);
}