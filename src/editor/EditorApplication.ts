import Application from "../engine/Application.ts";
import Renderer from "../engine/Renderer.ts";
import Scene from "../engine/Scene.ts";
import Entity from "../engine/Entity.ts";

class EditorApplication extends Application {
    private renderer!: Renderer;
    private scene!: Scene;
    private selectedEntity: Entity | null = null;

    private listeners = new Set<() => void>();

    protected onInit() {
        this.renderer = new Renderer();
        this.scene = new Scene();

        const cube1 = this.scene.addCube();
        const cube2  = this.scene.addCube();

        cube1.position[0] = -2;
        cube2.position[0] = 2;
        cube2.meshColour = [1, 0, 0];

        this.selectedEntity = cube1;

        this.notify();
    }

    protected onRender() {
        this.renderer.render(this.scene);
    }

    public setPosition(entity: Entity, axis: number, value: number) {
        entity.position[axis] = value;
        this.notify();
    }

    public setRotation(entity: Entity, axis: number, value: number) {
        entity.rotation[axis] = value;
        this.notify();
    }

    public setScale(entity: Entity, axis: number, value: number) {
        entity.scale[axis] = value;
        this.notify();
    }

    public setMeshColour(entity: Entity, colour: [number, number, number]) {
        entity.meshColour = colour;
        this.notify();
    }

    public getSelectedEntity() {
        return this.selectedEntity;
    }

    public getEntities(): Entity[] {
        return this.scene?.getEntities() ?? [];
    }

    public getScene() {
        return this.scene;
    }

    public selectEntity(entity: Entity) {
        this.selectedEntity = entity;
        this.notify();
    }

    public subscribe(listener: () => void) {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

export default EditorApplication;