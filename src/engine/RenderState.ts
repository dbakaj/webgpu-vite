class RenderState {
    public meshColour: [number, number, number] = [1.0, 0.647, 0.0];
    public position: [number, number, number] = [0, 0, 0];
    public rotation: [number, number, number] = [0, 0 , 0];
    public scale: [number, number, number] = [1, 1, 1];
}

const renderState = new RenderState();

export default renderState;