import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig'; 

function OfferForm({ onComplete, existingOffer, onCancel }) {
    const { authTokens } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        original_price: '',
        discounted_price: '',
        discount_percentage: '',
        start_time: '',
        end_time: '',
    });
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastChanged, setLastChanged] = useState(null);

    const isEditMode = Boolean(existingOffer);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                title: existingOffer.title || '',
                description: existingOffer.description || '',
                original_price: existingOffer.original_price || '',
                discounted_price: existingOffer.discounted_price || '',
                discount_percentage: existingOffer.discount_percentage || '',
                start_time: existingOffer.start_time ? new Date(existingOffer.start_time).toISOString().slice(0, 16) : '',
                end_time: existingOffer.end_time ? new Date(existingOffer.end_time).toISOString().slice(0, 16) : '',
            });
        }
    }, [existingOffer, isEditMode]);

    // Effect to calculate percentage when prices change
    useEffect(() => {
        if (lastChanged !== 'price') return;
        const orig = parseFloat(formData.original_price);
        const disc = parseFloat(formData.discounted_price);

        if (orig > 0 && disc > 0 && orig > disc) {
            const percentage = Math.round(((orig - disc) / orig) * 100);
            setFormData(prev => ({ ...prev, discount_percentage: percentage.toString() }));
        }
    }, [formData.original_price, formData.discounted_price, lastChanged]);

    // Effect to calculate discounted price when percentage changes
    useEffect(() => {
        if (lastChanged !== 'percentage') return;
        const orig = parseFloat(formData.original_price);
        const perc = parseFloat(formData.discount_percentage);

        if (orig > 0 && perc >= 0 && perc <= 100) {
            const discounted = (orig - (orig * perc / 100)).toFixed(2);
            setFormData(prev => ({ ...prev, discounted_price: discounted.toString() }));
        }
    }, [formData.original_price, formData.discount_percentage, lastChanged]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'original_price' || name === 'discounted_price') {
            setLastChanged('price');
        } else if (name === 'discount_percentage') {
            setLastChanged('percentage');
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });
        
        // Ensure dates are in ISO format for the backend
        if (formData.start_time) data.set('start_time', new Date(formData.start_time).toISOString());
        if (formData.end_time) data.set('end_time', new Date(formData.end_time).toISOString());

        if (image) data.append('image', image);
        
        const url = isEditMode
    ? `${API_URL}/api/vendor/offers/${existingOffer.id}/update/`
    : `${API_URL}/api/vendor/offers/create/`;
        
        const method = isEditMode ? 'patch' : 'post';

        try {
            const response = await axios[method](url, data, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            onComplete(response.data);
        } catch (err) {
            setError('Operation failed. Please check all fields.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.editFormOverlay}>
            <div style={styles.editFormContainer}>
                <div style={styles.editFormHeader}>
                    <h3 style={styles.editFormTitle}>{isEditMode ? 'Edit Offer' : 'Create a New Offer'}</h3>
                    <button onClick={onCancel} style={styles.closeButton}>✕</button>
                </div>
                <form onSubmit={handleSubmit} style={styles.editForm}>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Offer Title</label>
                        <input style={styles.formInput} name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Description</label>
                        <textarea style={styles.formTextarea} name="description" value={formData.description} onChange={handleChange} placeholder="Tell customers about this deal" rows="3" />
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Original Price (₹)</label>
                            <input style={styles.formInput} type="number" step="0.01" name="original_price" value={formData.original_price} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Discounted Price (₹)</label>
                            <input style={styles.formInput} type="number" step="0.01" name="discounted_price" value={formData.discounted_price} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Discount Percentage (%)</label>
                        <input style={styles.formInput} type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} placeholder="e.g., 50" />
                    </div>
                     <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Start Date</label>
                            <input style={styles.formInput} type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>End Date</label>
                            <input style={styles.formInput} type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Offer Image (leave blank to keep existing)</label>
                        <input style={styles.formInput} type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    {error && <p style={{ color: '#dc2626', textAlign: 'center' }}>{error}</p>}
                    <div style={styles.formActions}>
                        <button type="button" onClick={onCancel} style={styles.cancelButton}>Cancel</button>
                        <button type="submit" style={styles.saveButton} disabled={saving}>{saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Offer')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    editFormOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    editFormContainer: { backgroundColor: '#ffffff', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    editFormHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0' },
    editFormTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    closeButton: { padding: '0.5rem', backgroundColor: 'transparent', border: 'none', fontSize: '1.25rem', color: '#64748b', cursor: 'pointer', borderRadius: '0.25rem' },
    editForm: { padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    formLabel: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
    formInput: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#ffffff' },
    formTextarea: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' },
    formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
    cancelButton: { padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    saveButton: { padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }
};

export default OfferForm;
