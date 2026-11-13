import WebGPUContext from "./WebGPUContext";

abstract class Application {
    protected abstract onRender(): void;
    protected abstract onInit(): void;
    
    public async init(canvas: HTMLCanvasElement): Promise<void> {
        await WebGPUContext.create(canvas);
        this.onInit();
    }

    public run(): void {
        const loop = () => {
            this.onRender();
            requestAnimationFrame(loop);
        };
        
        loop();
    }
}

export default Application;