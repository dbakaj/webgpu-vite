import WebGPUContext from "./WebGPUContext";

abstract class Application {
    protected abstract onRender(): void;
    protected abstract onInit(): Promise<void>;
    
    public async init(canvas: HTMLCanvasElement) {
        await WebGPUContext.create(canvas);
        await this.onInit();
    }

    public run() {
        const loop = () => {
            this.onRender();
            requestAnimationFrame(loop);
        };
        
        loop();
    }
}

export default Application;