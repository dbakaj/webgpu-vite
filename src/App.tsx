import "./App.css";
import Canvas from "./components/Canvas.tsx";

import {DockviewReact, type DockviewReadyEvent, type IDockviewPanelHeaderProps} from "dockview";
import "dockview/dist/styles/dockview.css";

function App() {
    const components = {
        default: () => {
            return (
                <></>
            );
        },

        canvas: () => {
            return (
                <Canvas />
            );
        }
    };

    const tabComponents = {
        default: (props: IDockviewPanelHeaderProps<{title: string}>) => {
            return (
                <div className="panel-header">
                    <span>{props.params.title}</span>
                </div>
            );
        }
    };

    const onReady = (event: DockviewReadyEvent) => {
        event.api.addPanel({
            id: "canvas",
            component: "canvas",
            tabComponent: "default",
            params: {
                title: "Canvas"
            }
        });

        event.api.addPanel({
            id: "settings",
            component: "default",
            tabComponent: "default",
            params: {
                title: "Settings"
            },

            position: {
                referencePanel: "canvas",
                direction: "right"
            }
        });

        event.api.addPanel({
            id: "files",
            component: "default",
            tabComponent: "default",
            params: {
                title: "Files"
            },

            position: {
                referencePanel: "canvas",
                direction: "left"
            }
        });

        const canvas_panel = event.api.getPanel("canvas");
        canvas_panel!.group.locked = true;

        const files_panel = event.api.getPanel("files");
        files_panel!.group.locked = true;
        files_panel!.api.setSize({width:300});

        const settings_panel = event.api.getPanel("settings");
        settings_panel!.group.locked = true;
        settings_panel!.api.setSize({width:300});
    };

    return (
        <div className="app">
            <DockviewReact 
                className="dockview-theme-abyss"
                onReady={onReady} 
                components={components}
                tabComponents={tabComponents}
                singleTabMode="fullwidth"
            />
        </div>
    );
}

export default App;
