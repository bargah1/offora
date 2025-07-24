import React from 'react';

export default function Modal({ title, children, onConfirm, onCancel, confirmText = "Confirm" }) {
    return (
        <div style={styles.modalBackground}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button onClick={onCancel} style={styles.close}>✖</button>
                </div>
                <div style={styles.modalContent}>
                    {children}
                </div>
                <div style={styles.formActions}>
                    <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={onConfirm} style={{...styles.saveBtn, backgroundColor: '#ef4444'}}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    modalBackground: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", justifyContent: "center", alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1000,
    },
    modal: {
        background: "#fff", padding: 24, borderRadius: 8, maxWidth: 500, width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    },
    modalHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
        borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem'
    },
    modalContent: {
        padding: '1rem 0',
        color: '#374151',
        lineHeight: 1.6,
    },
    close: {
        background: "transparent", border: "none", fontSize: 22, cursor: "pointer",
    },
    cancelBtn: {
        padding: "0.5rem 1.25rem", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.5rem", cursor: "pointer", fontWeight: '600'
    },
    saveBtn: {
        padding: "0.5rem 1.25rem", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: '600'
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '1.5rem'
    },
};
