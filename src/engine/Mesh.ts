import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from '@gltf-transform/extensions';
import WebGPUContext from "./WebGPUContext.ts";

class Mesh {
    private device!: GPUDevice;

    public vertexBuffer!: GPUBuffer;
    public indexBuffer!: GPUBuffer;
    public indexCount = 0;

    public constructor() {
        const webgpuContext = WebGPUContext.getInstance();
        this.device = webgpuContext.getDevice();
    }

    public async loadCube() {
        const vertices = new Float32Array([
            -1, -1,  1,  1,1,1,  0,0,1,
             1, -1,  1,  1,1,1,  0,0,1,
             1,  1,  1,  1,1,1,  0,0,1,
            -1,  1,  1,  1,1,1,  0,0,1,

            -1, -1, -1,  1,1,1,  0,0,-1,
             1, -1, -1,  1,1,1,  0,0,-1,
             1,  1, -1,  1,1,1,  0,0,-1,
            -1,  1, -1,  1,1,1,  0,0,-1,

            -1, -1, -1,  1,1,1,  -1,0,0,
            -1, -1,  1,  1,1,1,  -1,0,0,
            -1,  1,  1,  1,1,1,  -1,0,0,
            -1,  1, -1,  1,1,1,  -1,0,0,

             1, -1, -1,  1,1,1,  1,0,0,
             1, -1,  1,  1,1,1,  1,0,0,
             1,  1,  1,  1,1,1,  1,0,0,
             1,  1, -1,  1,1,1,  1,0,0,

            -1,  1, -1,  1,1,1,  0,1,0,
            -1,  1,  1,  1,1,1,  0,1,0,
             1,  1,  1,  1,1,1,  0,1,0,
             1,  1, -1,  1,1,1,  0,1,0,

            -1, -1, -1,  1,1,1,  0,-1,0,
            -1, -1,  1,  1,1,1,  0,-1,0,
             1, -1,  1,  1,1,1,  0,-1,0,
             1, -1, -1,  1,1,1,  0,-1,0,
        ]);

        const indices = new Uint16Array([
            0,1,2,
            0,2,3,

            4,6,5,
            4,7,6,

            8,9,10,
            8,10,11,

            12,14,13,
            12,15,14,

            16,17,18,
            16,18,19,

            20,22,21,
            20,23,22
        ]);

        this.indexCount = indices.length;

        this.vertexBuffer = this.device.createBuffer({
            label: "VertexBuffer",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);

        this.indexBuffer = this.device.createBuffer({
            label: "IndexBuffer",
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(this.indexBuffer, 0, indices);
    }

    public async load(url: string) {
        const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
        const buffer = await fetch(url).then(r => r.arrayBuffer());
        const uint8Array = new Uint8Array(buffer);
        const doc = await io.readBinary(uint8Array);

        const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
        const pos = prim.getAttribute('POSITION')!.getArray()!;
        const col = prim.getAttribute('COLOR_0')?.getArray();
        const norm = prim.getAttribute('NORMAL')?.getArray();
        const idx = prim.getIndices()!.getArray()!;
        
        const vertexCount = pos.length / 3;

        this.indexCount = idx.length;

        const vertexData = new Float32Array(vertexCount * 9);

        for (let i = 0; i < vertexCount; i++) {
            vertexData[i * 9 + 0] = pos[i * 3 + 0];
            vertexData[i * 9 + 1] = pos[i * 3 + 1];
            vertexData[i * 9 + 2] = pos[i * 3 + 2];
            
            if (col) {
                vertexData[i * 9 + 3] = 1.0;
                vertexData[i * 9 + 4] = 1.0;
                vertexData[i * 9 + 5] = 1.0;
            } 
            
            else {
                vertexData[i * 9 + 3] = 1.0;
                vertexData[i * 9 + 4] = 0.647;
                vertexData[i * 9 + 5] = 0.0;
            }

            if (norm) {
                vertexData[i * 9 + 6] = norm[i * 3 + 0];
                vertexData[i * 9 + 7] = norm[i * 3 + 1];
                vertexData[i * 9 + 8] = norm[i * 3 + 2];
            } 
            
            else {
                vertexData[i * 9 + 6] = 0.0;
                vertexData[i * 9 + 7] = 0.0;
                vertexData[i * 9 + 8] = 1.0; 
            }
        }

        this.vertexBuffer = this.device.createBuffer({
            label: "VertexBuffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);

        this.indexBuffer = this.device.createBuffer({
            label: "IndexBuffer",
            size: idx.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(this.indexBuffer, 0, idx);
    }
}

export default Mesh;