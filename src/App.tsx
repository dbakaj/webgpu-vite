import "./App.css";
import {useEffect, useRef} from "react";
import vertexShader from "./shaders/vertex.wgsl?raw";
import fragmentShader from "./shaders/fragment.wgsl?raw";

function App() {
    const cref = useRef<HTMLCanvasElement>(null);

    async function render() {
        const canvas = cref.current!;
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter!.requestDevice();

        const context = canvas.getContext("webgpu");

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context!.configure({
            device: device,
            format: canvasFormat
        });

        const vertices = new Float32Array([
            -0.8, -0.8,
            0.8, -0.8,
            0.8, 0.8
        ]);

        const vertexBuffer = device.createBuffer({
            label: "VertexBuffer",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(vertexBuffer, 0, vertices);

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0
            }]
        };

        const vertexShaderModule = device.createShaderModule({
            label: "VertexShader",
            code : vertexShader
        });

        const fragmentShaderModule = device.createShaderModule({
            label: "FragmentShader",
            code: fragmentShader
        });

        const pipeline = device.createRenderPipeline({
            label: "Pipeline",
            layout: "auto",
            vertex: {
                module: vertexShaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },

            fragment: {
                module: fragmentShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            }
        });
        
        const encoder = device.createCommandEncoder();
        
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context!.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: {r: 0.3, g: 0.3, b:0.3, a: 1},
                storeOp: "store"
            }]
        });

        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(vertices.length / 2);

        pass.end();

        device.queue.submit([encoder.finish()]);
    }

    useEffect(() => {
        render();
    });

    return (
        <canvas ref={cref} width="640" height="480"></canvas>
    );
}

export default App;
