import {useEffect, useRef} from "react";
import TestApplication from "../TestApplication.ts";

function Canvas() {
    const cref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        (async() => {
            const testApp = new TestApplication();
            await testApp.init(cref.current!);
            testApp.run();
        })();

    }, []);

    return (
        <canvas ref={cref} width="1280" height="720"></canvas>
    );
}

export default Canvas;