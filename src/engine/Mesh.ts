import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from '@gltf-transform/extensions';

class Mesh {
    private device: GPUDevice;

    public vertexBuffer!: GPUBuffer;
    public indexBuffer!: GPUBuffer;
    public indexCount = 0;

    public constructor(device: GPUDevice) {
        this.device = device;
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
                vertexData[i * 9 + 3] = col[i * 3 + 0];
                vertexData[i * 9 + 4] = col[i * 3 + 1];
                vertexData[i * 9 + 5] = col[i * 3 + 2];
            } 
            
            else {
                vertexData[i * 9 + 3] = 1.0;
                vertexData[i * 9 + 4] = 1.0;
                vertexData[i * 9 + 5] = 1.0;
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