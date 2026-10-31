import vertexShader from "../shaders/vertex.wgsl?raw";
import fragmentShader from "../shaders/fragment.wgsl?raw";

import Scene from "./Scene.ts";
import { Camera, CameraController } from "./Camera.ts"
import { mat3, mat4 } from 'gl-matrix';
import WebGPUContext from "../engine/WebGPUContext.ts";

class Renderer {
    private canvas!: HTMLCanvasElement;
    public device!: GPUDevice;
    public canvasContext!: GPUCanvasContext | null;

    private pipeline!: GPURenderPipeline;
    
    private depthTexture!: GPUTexture;
    private msaaColourTexture!: GPUTexture;

    private uniformBindGroupLayout!: GPUBindGroupLayout;
    private uniformBindGroup!: GPUBindGroup;
    private uniformBuffer!: GPUBuffer;

    private cameraController!: CameraController;

    private readonly uniformSize = 128;
    private readonly uniformStride: number;
    private uniformCapacity = 0;

    public constructor() {
        const webgpuContext = WebGPUContext.getInstance();
        this.device = webgpuContext.getDevice();
        this.canvas = webgpuContext.getCanvas();
        this.canvasContext = webgpuContext.getCanvasContext();

        this.cameraController = new CameraController(new Camera(Math.PI/4, 1280/720, 0.1, 100));
        this.cameraController.initEvents(this.canvas);

        const alignment = this.device.limits.minUniformBufferOffsetAlignment;
        this.uniformStride = Math.ceil(this.uniformSize / alignment) * alignment;

        this.uniformBindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform",
                    hasDynamicOffset: true,
                    minBindingSize: this.uniformSize
                }
            }]
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
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 36,
            stepMode: "vertex",
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
        }

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
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.uniformBindGroupLayout]}),
            vertex: {
                module: vertexShaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },

            fragment: {
                module: fragmentShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat()
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

    public render(scene: Scene) {
        const entities = scene.getEntities();

        if (entities.length > this.uniformCapacity) {
            this.uniformCapacity = Math.max(entities.length, this.uniformCapacity * 2, 1);

            this.uniformBuffer?.destroy();

            this.uniformBuffer = this.device.createBuffer({
                label: "DynamicUniformBuffer",
                size: this.uniformCapacity * this.uniformStride,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            this.uniformBindGroup = this.device.createBindGroup({
                label: "DynamicUniformBindGroup",
                layout: this.uniformBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.uniformBuffer,
                            offset: 0,
                            size: this.uniformSize
                        }
                    }
                ]
            });
        }

        const camera = this.cameraController.getCamera();
        camera.update();

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.msaaColourTexture.createView(),
                    resolveTarget: this.canvasContext!.getCurrentTexture().createView(),
                    loadOp: "clear",
                    clearValue: {
                        r: 0.05,
                        g: 0.05,
                        b: 0.057,
                        a: 1
                    },

                    storeOp: "store"
                }
            ],

            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthLoadOp: "clear",
                depthClearValue: 1,
                depthStoreOp: "store"
            }
        });

        pass.setPipeline(this.pipeline);

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            const model = mat4.create();

            mat4.translate(model, model, entity.position);
            mat4.rotateX(model, model, entity.rotation[0]);
            mat4.rotateY(model, model, entity.rotation[1]);
            mat4.rotateZ(model, model, entity.rotation[2]);
            mat4.scale(model, model, entity.scale);

            const mvp = mat4.multiply(mat4.create(), camera.viewProjection, model);

            const normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, model);
            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix, normalMatrix);

            const uniformData = new Float32Array([
                ...mvp,

                normalMatrix[0], normalMatrix[1], normalMatrix[2], 0,
                normalMatrix[3], normalMatrix[4], normalMatrix[5], 0,
                normalMatrix[6], normalMatrix[7], normalMatrix[8], 0,

                entity.meshColour[0],
                entity.meshColour[1],
                entity.meshColour[2],
                1.0
            ]);

            this.device.queue.writeBuffer(this.uniformBuffer, i * this.uniformStride, uniformData);

            pass.setBindGroup(0, this.uniformBindGroup, [i * this.uniformStride]);
            pass.setVertexBuffer(0, entity.mesh.vertexBuffer);
            pass.setIndexBuffer(entity.mesh.indexBuffer, "uint16");
            pass.drawIndexed(entity.mesh.indexCount, 1, 0, 0, 0);
        }

        pass.end();
        
        this.device.queue.submit([encoder.finish()]);
    }
}

export default Renderer;