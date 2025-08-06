import {useEffect, useRef} from "react";
import Renderer from "../engine/Renderer.ts";
import Mesh from "../engine/Mesh.ts";

import latticeUrl from '../assets/lattice.glb?url';

function Canvas() {
    const cref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        (async() => {
            const renderer = Renderer.create(cref.current!);
            await renderer.init();
            
            const mesh = new Mesh(renderer.device);
            await mesh.load(latticeUrl);
            
            function run() {
                renderer.render(mesh);
                requestAnimationFrame(run);
            }
            
            run();
        })();
    }, []);

    return (
        <canvas ref={cref} width="1280" height="720"></canvas>
    );
}

export default Canvas;