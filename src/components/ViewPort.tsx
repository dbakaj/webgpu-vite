import {useEffect, useRef} from "react";
import useEditor from "../editor/useEditor";

function ViewPort() {
    const cref = useRef<HTMLCanvasElement>(null);
    const editor = useEditor();

    useEffect(() => {
        (async() => {
            await editor.init(cref.current!);
            editor.run();
        })();

    }, [editor]);
    
    return (
        <canvas ref={cref} width="1280" height="720"></canvas>
    );
}

export default ViewPort;