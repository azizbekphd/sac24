import './index.css'
import React, { useState } from 'react';

interface MenuSectionProps {
    title: string;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    children: React.ReactNode;
}

const MenuSection: React.FC<MenuSectionProps> = ({
    title,
    children,
    isOpen,
    onToggle,
}) => {
    const [isOpenState, setIsOpenState] = useState(isOpen);

    const toggle = () => {
        setIsOpenState(!isOpenState);
        onToggle && onToggle(!isOpenState);
    };

    return (
        <div className={`menu-section ${isOpenState ? 'open' : ''}`}>
            <div className="menu-section-title row" onClick={toggle}>
                <h4>{title}</h4>
                <span>{isOpenState ? '-' : '+'}</span>
            </div>
            <div className={`menu-section-content ${isOpenState ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default MenuSection;
