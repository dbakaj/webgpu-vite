import Mesh from "./Mesh.ts";

class Entity {
    public id: string;
    public name: string;
    public mesh: Mesh;

    public position: [number, number, number] = [0, 0, 0];
    public rotation: [number, number, number] = [0, 0, 0];
    public scale: [number, number, number] =  [1, 1, 1];
    public meshColour: [number, number, number] = [1, 1, 1];

    public constructor(name: string, mesh: Mesh) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.mesh = mesh;
    }
}

export default Entity;