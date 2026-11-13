import Application from "../engine/Application.ts";
import Renderer from "../engine/Renderer.ts";
import Scene from "../engine/Scene.ts";
import Entity from "../engine/Entity.ts";

class EditorApplication extends Application {
    private renderer!: Renderer;
    private scene!: Scene;
    private selectedEntity: Entity | null = null;

    private listeners = new Set<() => void>();

    protected onInit(): void {
        this.renderer = new Renderer();
        this.scene = new Scene();

        const cube1 = this.scene.addCube("Cube 1");
        const cube2  = this.scene.addCube("Cube 2");

        cube1.position[0] = -2;
        cube2.position[0] = 2;
        cube2.meshColour = [1, 0, 0];
        
        this.selectedEntity = cube1;

        this.notify();
    }

    protected onRender(): void {
        this.renderer.render(this.scene);
    }

    public setPosition(entity: Entity, axis: number, value: number): void {
        entity.position[axis] = value;
        this.notify();
    }

    public setRotation(entity: Entity, axis: number, value: number): void {
        entity.rotation[axis] = value;
        this.notify();
    }

    public setScale(entity: Entity, axis: number, value: number): void {
        entity.scale[axis] = value;
        this.notify();
    }

    public setMeshColour(entity: Entity, colour: [number, number, number]): void {
        entity.meshColour = colour;
        this.notify();
    }

    public getSelectedEntity(): Entity | null {
        return this.selectedEntity;
    }

    public getEntities(): Entity[] {
        return this.scene?.getEntities() ?? [];
    }

    public getScene(): Scene {
        return this.scene;
    }

    public selectEntity(entity: Entity): void {
        this.selectedEntity = entity;
        this.notify();
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

export default EditorApplication;