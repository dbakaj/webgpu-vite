import Application from "./Application.ts";
import Mesh from "./Mesh.ts";
import Renderer from "./Renderer.ts";
//import latticeUrl from '../assets/lattice.glb?url';

class TestApplication extends Application {
    private renderer!: Renderer;
    private mesh!: Mesh;

    protected async onInit() {
        this.renderer = new Renderer();
        this.mesh = new Mesh();
        
        await this.mesh.loadCube();
        //await this.mesh.load(latticeUrl);
    }
    
    protected onRender() {
        this.renderer.render(this.mesh);
    }
}

export default TestApplication;