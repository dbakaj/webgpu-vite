@fragment
fn fragmentMain(@location(0) colour: vec3f, @location(1) normal: vec3f) -> @location(0) vec4<f32> {

    let norm = normalize(normal);
    let lightDir = normalize(vec3f(1.0, 1.0, 1.0));
    let diffuse = max(dot(norm, lightDir), 0.0);

    let finalColor = colour * diffuse;

    return vec4f(finalColor, 1.0);
}