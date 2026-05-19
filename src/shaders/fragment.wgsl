struct MeshColour {
    colour: vec4f
};

@group(0) @binding(2)
var<uniform> meshColour: MeshColour;

@fragment
fn fragmentMain(@location(0) colour: vec3f, @location(1) normal: vec3f, @location(2) worldPos: vec3f) -> @location(0) vec4<f32> {

    let N = normalize(normal);
    let lightPos = vec3f(3.0, 4.0, 2.0);
    let spotDir = normalize(vec3f(-1.0, -1.0, -1.0));
    let L = normalize(lightPos - worldPos);
    let spotCos = dot(L, -spotDir);

    let cutoff = 0.8;
    let spot = smoothstep(cutoff, cutoff + 0.05, spotCos);
    let diffuse = max(dot(N, L), 0.0);
    let ambient = 0.15;

    return vec4f(meshColour.colour.xyz * colour * (ambient + diffuse * spot), 1.0);
}