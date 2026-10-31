import { useState } from "react";

import "./App.css";
import ViewPort from "./components/ViewPort.tsx";
import SettingsPanel from "./components/SettingsPanel.tsx";
import EditorApplication from "./editor/EditorApplication.ts";
import EditorProvider from "./editor/EditorProvider.tsx";

import { DockviewReact, type DockviewReadyEvent, type IDockviewPanelHeaderProps } from "dockview";

import "dockview/dist/styles/dockview.css";

function App() {
    const [editor] = useState(() => new EditorApplication());
    
    const components = {
        default: () => <></>,
        settings: () => <SettingsPanel />,
        viewport: () => <ViewPort />
    };

    const tabComponents = {
        default: (props: IDockviewPanelHeaderProps<{ title: string }>) => {
            return (
                <div className="panel-header">
                    <span>{props.params.title}</span>
                </div>
            );
        }
    };

    const onReady = (event: DockviewReadyEvent) => {
        event.api.addPanel({
            id: "viewport",
            component: "viewport",
            tabComponent: "default",
            params: { title: "ViewPort" }
        });

        event.api.addPanel({
            id: "settings",
            component: "settings",
            tabComponent: "default",
            params: { title: "Settings" },
            position: {
                referencePanel: "viewport",
                direction: "right"
            }
        });

        event.api.addPanel({
            id: "files",
            component: "default",
            tabComponent: "default",
            params: { title: "Files" },
            position: {
                referencePanel: "viewport",
                direction: "left"
            }
        });

        const canvas_panel = event.api.getPanel("viewport");
        canvas_panel!.group.locked = true;

        const files_panel = event.api.getPanel("files");
        files_panel!.group.locked = true;
        files_panel!.api.setSize({ width: 300 });

        const settings_panel = event.api.getPanel("settings");
        settings_panel!.group.locked = true;
        settings_panel!.api.setSize({ width: 300 });
    };

    return (
        <div className="app">
            <EditorProvider editor={editor}>
                <DockviewReact
                    className="dockview-theme-abyss"
                    onReady={onReady}
                    components={components}
                    tabComponents={tabComponents}
                    singleTabMode="fullwidth"
                />
            </EditorProvider>
        </div>
    );
}

export default App;