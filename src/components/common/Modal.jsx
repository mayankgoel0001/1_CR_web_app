import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-xl"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-[16px] w-full max-w-[500px] max-h-[90vh] flex flex-col shadow-modal overflow-hidden animate-modal-slide">
                {/* Header */}
                <div className="bg-primary text-white px-xl py-lg flex justify-between items-center rounded-t-[16px]">
                    <h3 className="text-[1.15rem] font-semibold m-0">{title}</h3>
                    <button
                        className="bg-transparent text-white border-none text-2xl cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-white/15"
                        onClick={onClose}
                        aria-label="Close Modal"
                    >
                        <MdClose />
                    </button>
                </div>
                {/* Body */}
                <div className="p-xl overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
