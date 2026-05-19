import { useState } from "react";
import "./App.css";
import Canvas from "./components/Canvas.tsx";
import renderState from "./engine/RenderState.ts";

import {
    DockviewReact,
    type DockviewReadyEvent,
    type IDockviewPanelHeaderProps
} from "dockview";

import "dockview/dist/styles/dockview.css";

function SettingsPanel() {
    const [, force] = useState(0);

    const colour = "#" + renderState.meshColour.map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

    return (
        <div style={{ color: "white", padding: "16px", fontFamily: "Inter, sans-serif" }}>
            <div style={{ background: "#1e1e1e", border: "1px solid #2d2d2d", borderRadius: "12px", padding: "16px", marginBottom: 16 }}>
                <h3>Mesh Colour</h3>

                <input type="color"
                    value={colour}
                    onChange={(e) => {
                        const hex = e.target.value;

                        renderState.meshColour = [
                            parseInt(hex.slice(1, 3), 16) / 255,
                            parseInt(hex.slice(3, 5), 16) / 255,
                            parseInt(hex.slice(5, 7), 16) / 255
                        ];

                        force(t => t + 1);
                    }}
                />
            </div>

            {[
                { label: "Position", values: renderState.position, min: -10, max: 10, step: 0.1 },
                { label: "Rotation", values: renderState.rotation, min: -Math.PI, max: Math.PI, step: 0.01 },
                { label: "Scale", values: renderState.scale, min: 0.1, max: 5, step: 0.1 }
            ].map((group) => (
                <div key={group.label} style={{ background: "#1e1e1e", border: "1px solid #2d2d2d", borderRadius: "12px", padding: "16px", marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 12 }}>{group.label}</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                        {["X", "Y", "Z"].map((axis, i) => (
                            <div key={axis} style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: "#888" }}>
                                    {axis}: {group.values[i].toFixed(2)}
                                </div>

                                <input
                                    type="range"
                                    min={group.min}
                                    max={group.max}
                                    step={group.step}
                                    value={group.values[i]}
                                    onChange={(e) => {
                                        group.values[i] = parseFloat(e.target.value);
                                        force(t => t + 1);
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function App() {
    const components = {
        default: () => <></>,
        settings: SettingsPanel,
        canvas: () => <Canvas />
    };

    const tabComponents = {
        default: (props: IDockviewPanelHeaderProps<{ title: string }>) => (
            <div className="panel-header">
                <span>{props.params.title}</span>
            </div>
        )
    };

    const onReady = (event: DockviewReadyEvent) => {
        event.api.addPanel({
            id: "canvas",
            component: "canvas",
            tabComponent: "default",
            params: { title: "Canvas" }
        });

        event.api.addPanel({
            id: "settings",
            component: "settings",
            tabComponent: "default",
            params: { title: "Settings" },
            position: {
                referencePanel: "canvas",
                direction: "right"
            }
        });

        event.api.addPanel({
            id: "files",
            component: "default",
            tabComponent: "default",
            params: { title: "Files" },
            position: {
                referencePanel: "canvas",
                direction: "left"
            }
        });

        const canvas_panel = event.api.getPanel("canvas");
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