import Mesh from "./Mesh.ts";
import Entity from "./Entity.ts";

class Scene {
    private entities: Entity[] = [];

    public addCube() {
        const mesh = new Mesh();
        mesh.loadCube();

        const entity = new Entity("Cube", mesh);
        this.entities.push(entity);

        return entity;
    }

    public getEntities() {
        return this.entities;
    }
}

export default Scene;