import Application from "./engine/Application";
import Mesh from "./engine/Mesh";
import Renderer from "./engine/Renderer";
import latticeUrl from './assets/lattice.glb?url';

class TestApplication extends Application {
    private renderer!: Renderer;
    private mesh!: Mesh;

    protected async onInit() {
        this.renderer = new Renderer();
        this.mesh = new Mesh();
        
        await this.mesh.load(latticeUrl);
    }
    
    protected onRender() {
        this.renderer.render(this.mesh);
    }
}

export default TestApplication;