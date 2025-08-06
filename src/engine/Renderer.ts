import vertexShader from "../shaders/vertex.wgsl?raw";
import fragmentShader from "../shaders/fragment.wgsl?raw";
import Mesh from "./Mesh.ts";
import { Camera, CameraController } from "./Camera.ts"
import { mat3, mat4 } from 'gl-matrix';

class Renderer {
    private static instance: Renderer;

    private canvas!: HTMLCanvasElement;

    public device!: GPUDevice;
    public context!: GPUCanvasContext | null;

    private pipeline!: GPURenderPipeline;
    
    private depthTexture!: GPUTexture;
    private msaaColourTexture!: GPUTexture;

    private uniformBuffer!: GPUBuffer;
    private normalBuffer!: GPUBuffer;
    private uniformBindGroup!: GPUBindGroup;

    private cameraController!: CameraController; 

    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.cameraController = new CameraController(new Camera(Math.PI/4, 1280/720, 0.1, 100));
        this.cameraController.initEvents(this.canvas);
    }

    public static create(canvas: HTMLCanvasElement) {
        if (!Renderer.instance) {
            Renderer.instance = new Renderer(canvas);
        }

        return Renderer.instance;
    }

    public async init() {
        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter!.requestDevice();

        this.context = this.canvas.getContext("webgpu");

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context!.configure({
            device: this.device,
            format: canvasFormat
        });

        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            sampleCount: 4
        });

        this.msaaColourTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            sampleCount: 4,
            format: canvasFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.uniformBuffer = this.device.createBuffer({
            size: 16 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

         this.normalBuffer = this.device.createBuffer({
            size: 16 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const uniformBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" }
                },

                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" }
                }
            ]
        });

        this.uniformBindGroup = this.device.createBindGroup({
            layout: uniformBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: { buffer: this.normalBuffer } }
            ]
        });

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 36,
            attributes: [
                {
                    format: "float32x3",
                    offset: 0,
                    shaderLocation: 0
                },

                {
                    format: "float32x3",
                    offset: 12,
                    shaderLocation: 1
                },
                {
                    format: "float32x3",
                    offset: 24,
                    shaderLocation: 2
                }
            ]
        };

        const vertexShaderModule = this.device.createShaderModule({
            label: "VertexShader",
            code : vertexShader
        });

        const fragmentShaderModule = this.device.createShaderModule({
            label: "FragmentShader",
            code: fragmentShader
        });

        this.pipeline = this.device.createRenderPipeline({
            label: "Pipeline",
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [uniformBindGroupLayout]}),
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
            },

            primitive: {
                topology: "triangle-list",
                cullMode: "back"
            },

            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            },
            
            multisample: {
                count: 4
            }
        });
    }

    public render(mesh: Mesh) {
        const camera = this.cameraController.getCamera();
        camera.update();

        const model = mat4.create();
        const mvp = mat4.multiply(mat4.create(), camera.viewProjection, model);

        const normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, model);

        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);

        this.device.queue.writeBuffer(this.uniformBuffer, 0, mvp as Float32Array);
        this.device.queue.writeBuffer(this.normalBuffer, 0, normalMatrix as Float32Array);

        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.msaaColourTexture.createView(),
                resolveTarget: this.context!.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: {r: 0.3, g: 0.3, b: 0.3, a: 1},
                storeOp: "store"
            }],

            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthLoadOp: "clear",
                depthClearValue: 1,
                depthStoreOp: "store"
            }
        });
        
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.uniformBindGroup);
        pass.setVertexBuffer(0, mesh.vertexBuffer);
        pass.setIndexBuffer(mesh.indexBuffer, "uint16");
        pass.drawIndexed(mesh.indexCount, 1, 0, 0, 0);
        pass.end();

        this.device.queue.submit([encoder.finish()]);
    }
}

export default Renderer;