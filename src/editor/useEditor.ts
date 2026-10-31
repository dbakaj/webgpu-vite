import { useContext } from "react";
import type EditorApplication from "./EditorApplication.ts";
import EditorContext from "./EditorContext.ts"

function useEditor(): EditorApplication {
    const context = useContext(EditorContext);

    if (!context) {
        throw new Error("useEditor must be used inside EditorProvider");
    }

    return context.editor;
}

export default useEditor;