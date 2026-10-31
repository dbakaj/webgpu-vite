import { useEffect, useState } from "react";
import EditorApplication from "./EditorApplication.ts";
import EditorContext from "./EditorContext.ts";

function EditorProvider({editor, children}: {editor: EditorApplication; children: React.ReactNode}) {
    const [, setVersion] = useState(0);

    useEffect(() => {
        return editor.subscribe(() => {
            setVersion(v => v + 1);
        });
    }, [editor]);

    return <EditorContext value={{editor}}>{children}</EditorContext>
}

export default EditorProvider;