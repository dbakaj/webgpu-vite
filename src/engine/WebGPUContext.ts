class WebGPUContext {
    private static instance: WebGPUContext;
    private device!: GPUDevice;
    private canvas!: HTMLCanvasElement;
    private canvasContext!: GPUCanvasContext | null;

    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    private async init() {
        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter!.requestDevice();
        this.canvasContext = this.canvas.getContext("webgpu");

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.canvasContext!.configure({
            device: this.device,
            format: canvasFormat
        });
    }

    public static async create(canvas: HTMLCanvasElement) {
        if (!WebGPUContext.instance) {
            const instance = new WebGPUContext(canvas);
            await instance.init();
            WebGPUContext.instance = instance;
        }

        return WebGPUContext.instance;
    }

    public static getInstance() {
        return WebGPUContext.instance;
    }

    public getDevice() {
        return this.device;
    }

    public getCanvas() {
        return this.canvas;
    }

    public getCanvasContext() {
        return this.canvasContext;
    }
}

export default WebGPUContext;