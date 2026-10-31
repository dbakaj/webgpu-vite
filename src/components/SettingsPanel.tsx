import useEditor from "../editor/useEditor.ts";

function SettingsPanel() {
    const editor = useEditor();
    const entity = editor.getSelectedEntity();
    const entities = editor.getEntities();

    if (!entity) {
        return (
            <div className="settings-panel">
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        Select Entity
                    </h3>

                    <select
                        value=""
                        onChange={(e) => {
                            const index = Number(e.target.value);
                            const selected = entities[index];

                            if (selected) {
                                editor.selectEntity(selected);
                            }
                        }}>
                        
                        <option value="">Select an entity</option>

                        {entities.map((_, index) => (
                            <option key={index} value={index}>
                                Cube {index + 1}
                            </option>                    
                        ))}
                    </select>

                    <h3 className="settings-section-title">
                        No Entity Selected
                    </h3>
                </div>
            </div>
        );
    }

    const selectedIndex = entities.indexOf(entity);

    const colour = "#" + entity.meshColour.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
    
    const groups = [
        {
            label: "Position",
            values: entity.position,
            min: -10,
            max: 10,
            step: 0.1,
            isRotation: false,
        },
        
        {
            label: "Rotation",
            values: entity.rotation,
            min: -Math.PI,
            max: Math.PI,
            step: Math.PI / 180,
            isRotation: true,
        },

        {
            label: "Scale",
            values: entity.scale,
            min: 0.1,
            max: 5,
            step: 0.1,
            isRotation: false,
        }
    ];

    return (
        <div className="settings-panel">
            <div className="settings-section">
                <h3 className="settings-section-title">
                    Select Entity
                </h3>

                <select
                    value={selectedIndex.toString()}
                    onChange={(e) => {
                        const index = Number(e.target.value);
                        const selected = entities[index];

                        if (selected) {
                            editor.selectEntity(selected);
                        }
                    }}>

                    {entities.map((_, index) => (
                        <option key={index} value={index}>
                            Cube {index + 1}
                        </option>
                    ))}
                </select>
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">
                    Mesh Colour
                </h3>

                <div className="colour-row">
                    <input
                        className="colour-input"
                        type="color"
                        value={colour}
                        onChange={(e) => {
                            const hex = e.target.value;

                            editor.setMeshColour(entity, [
                                parseInt(hex.slice(1, 3), 16) / 255,
                                parseInt(hex.slice(3, 5), 16) / 255,
                                parseInt(hex.slice(5, 7), 16) / 255
                            ]);
                        }}/>

                    <span className="colour-value">
                        {colour.toUpperCase()}
                    </span>
                </div>
            </div>

            {groups.map((group) => (
                <div className="settings-section" key={group.label}>
                    <h3 className="settings-section-title">
                        {group.label}
                    </h3>

                    {["X", "Y", "Z"].map((axis, i) => {
                        const displayValue = group.isRotation ? group.values[i] * (100/Math.PI) : group.values[i];

                        return (
                            <div className="vector-row" key={axis}>
                                <div className="vector-label">
                                    <span>{axis}</span>

                                    <span className="vector-value">
                                        {displayValue.toFixed(1)}
                                        {group.isRotation ? "°" : ""}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min={group.isRotation ? -180 : group.min}
                                    max={group.isRotation ? 180 : group.max}
                                    step={group.isRotation ? 1 : group.step}
                                    value={group.isRotation ? displayValue : group.values[i]}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);

                                        if (group.label === "Position") {
                                            editor.setPosition(entity, i, value);
                                        }
                                        
                                        else if (group.label === "Rotation") {
                                            editor.setRotation(entity, i, value * (Math.PI/180));
                                        }

                                        else if (group.label === "Scale") {
                                            editor.setScale(entity, i, value);
                                        }
                                    }}/>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default SettingsPanel;