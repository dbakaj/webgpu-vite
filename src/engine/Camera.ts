import { mat4 } from 'gl-matrix';

class Camera {
    public yaw = 0;
    public pitch = Math.PI/8;
    public zoom = 5;

    private projection!: mat4;
    public viewProjection!: mat4;

    public constructor(fovy: number, aspectRatio: number, near: number, far: number) {
        this.projection = mat4.perspective(mat4.create(), fovy, aspectRatio, near, far);
    }

    public update() {
        const cameraPosition = new Float32Array([
           this.zoom * Math.cos(this.pitch) * Math.sin(this.yaw), 
           this.zoom * Math.sin(this.pitch), 
           this.zoom * Math.cos(this.pitch) * Math.cos(this.yaw)
        ]);

        const view = mat4.lookAt(mat4.create(), cameraPosition, new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0]));
        this.viewProjection = mat4.multiply(mat4.create(), this.projection, view);
    }
}

class CameraController {
    camera!: Camera;

    private isDragging = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    public constructor(camera: Camera) {
        this.camera = camera;
    }

    public initEvents(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });

        window.addEventListener("mousemove", (e) =>{
            if (!this.isDragging) return;

            const dX = e.clientX - this.lastMouseX;
            const dY = e.clientY - this.lastMouseY;

            const sensitivity = 0.005;

            this.camera.yaw -= dX * sensitivity;
            this.camera.pitch += dY * sensitivity;

            const maxPitch = Math.PI / 2 - 0.01;
            if (this.camera.pitch > maxPitch) this.camera.pitch = maxPitch;
            if (this.camera.pitch < -maxPitch) this.camera.pitch = -maxPitch;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        canvas.addEventListener("wheel", (e) => {
            e.preventDefault();

            const zoomSensitivity = 0.5;
            this.camera.zoom += e.deltaY * zoomSensitivity * 0.01;

            const minZoom = 0.5;
            const maxZoom = 10;

            if (this.camera.zoom < minZoom) this.camera.zoom = minZoom;
            if (this.camera.zoom > maxZoom) this.camera.zoom = maxZoom;
            
        }, { passive: false });
    }

    public getCamera() {
        return this.camera;
    }
}

export { Camera, CameraController };