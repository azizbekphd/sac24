interface FocusItem {
    objectId: string;
    setObjectId: () => void;
}

interface Focus {
    selected: FocusItem;
    hovered: FocusItem;
}

export default Focus;
