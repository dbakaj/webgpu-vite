import { createContext } from "react";

import EditorApplication from "./EditorApplication.ts";

interface EditorContextValue {
    editor: EditorApplication;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export default EditorContext;