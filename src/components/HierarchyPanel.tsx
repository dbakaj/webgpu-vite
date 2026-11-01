import useEditor from "../editor/useEditor.ts";

function HierarchyPanel() {
    const editor = useEditor();

    const entities = editor.getEntities();
    const selectedEntity = editor.getSelectedEntity();

    return (
        <div className="hierarchy-panel">
            <div className="hierarchy-section">
                <h3 className="hierarchy-section-title">
                    Scene
                </h3>

                <div className="hierarchy-list">
                    {entities.map((entity) => {
                        const selected = entity === selectedEntity;

                        return (
                            <div
                                key={entity.id}
                                className={`hierarchy-item ${selected ? "selected" : ""}`}
                                onClick={() => editor.selectEntity(entity)}>

                                <span className="hierarchy-icon">
                                    •
                                </span>

                                <span>
                                    {entity.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default HierarchyPanel;