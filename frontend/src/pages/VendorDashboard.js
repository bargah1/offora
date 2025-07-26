import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import VendorOfferCard from "../components/VendorOfferCard";
import OfferForm from "../components/OfferForm";
import API_URL from '../apiConfig';
// --- Sub-component for displaying the profile ---
const StoreProfileDisplay = ({ storeData, onEditClick }) => {
    const mapLink =
        storeData.latitude && storeData.longitude
            ? `https://www.google.com/maps?q=${storeData.latitude},${storeData.longitude}`
            : null;

    return (
        <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
                <img 
                    src={storeData.logo || `https://placehold.co/100x100/e2e8f0/475569?text=${storeData.name.charAt(0)}`} 
                    alt={`${storeData.name} logo`} 
                    style={styles.profileLogo} 
                />
                <div style={styles.profileInfo}>
                    <h2 style={styles.storeName}>{storeData.name}</h2>
                    <span style={styles.categoryBadge}>{storeData.get_category_display || storeData.category}</span>
                </div>
                <button onClick={onEditClick} style={styles.editButton}>
                    <span style={styles.editIcon}>✏️</span>
                    Edit Profile
                </button>
            </div>
            <div style={styles.profileDetails}>
                <div style={styles.detailItem}>
                    <span style={styles.detailIcon}>📍</span>
                    <div>
                        <label style={styles.detailLabel}>Address</label>
                        <p style={styles.detailValue}>{storeData.address}</p>
                    </div>
                </div>
                <div style={styles.detailItem}>
                    <span style={styles.detailIcon}>📞</span>
                    <div>
                        <label style={styles.detailLabel}>Phone</label>
                        <p style={styles.detailValue}>{storeData.phone_number || 'Not provided'}</p>
                    </div>
                </div>
                <div style={styles.detailItem}>
                    <span style={styles.detailIcon}>🌍</span>
                    <div>
                        <label style={styles.detailLabel}>Location</label>
                        <p style={styles.detailValue}>
                            {mapLink ? 
                                <a href={mapLink} target="_blank" rel="noopener noreferrer" style={styles.mapLink}>View on Map</a> : 
                                'Not set'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-component for the profile editing form ---
const StoreProfileEditForm = ({ initialData, onSave, onCancel }) => {
    const { authTokens } = useContext(AuthContext);
    const [formData, setFormData] = useState(initialData);
    const [logoFile, setLogoFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            const fieldsToUpdate = ['name', 'category', 'address', 'phone_number', 'latitude', 'longitude'];
            fieldsToUpdate.forEach(field => {
                if (formData[field] !== null && formData[field] !== undefined) {
                    data.append(field, formData[field]);
                }
            });
            if (logoFile) data.append("logo", logoFile);

            const response = await axios.patch(`${API_URL}/api/vendor/my-store/update/`, data, {
                headers: { 
                    Authorization: `Bearer ${authTokens.access}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            onSave(response.data);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Could not update store profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.editFormOverlay}>
            <div style={styles.editFormContainer}>
                <div style={styles.editFormHeader}>
                    <h3 style={styles.editFormTitle}>Edit Store Profile</h3>
                    <button onClick={onCancel} style={styles.closeButton}>✕</button>
                </div>
                <form onSubmit={handleSave} style={styles.editForm}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Store Name</label>
                            <input style={styles.formInput} name="name" value={formData.name} onChange={handleChange} placeholder="Enter store name" />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Phone Number</label>
                            <input style={styles.formInput} name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Contact number" />
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Address</label>
                        <textarea style={styles.formTextarea} name="address" value={formData.address} onChange={handleChange} placeholder="Store address" rows="3" />
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Latitude</label>
                            <input style={styles.formInput} type="number" step="any" name="latitude" value={formData.latitude || ''} onChange={handleChange} placeholder="e.g., 10.8505" />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Longitude</label>
                            <input style={styles.formInput} type="number" step="any" name="longitude" value={formData.longitude || ''} onChange={handleChange} placeholder="e.g., 76.2712" />
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Store Logo</label>
                        <input style={styles.formInput} type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div style={styles.formActions}>
                        <button type="button" onClick={onCancel} style={styles.cancelButton}>Cancel</button>
                        <button type="submit" style={styles.saveButton} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Reviews Section Component ---
const ReviewsSection = ({ shopReviews, offerReviews }) => {
    const [activeTab, setActiveTab] = useState('shop');

    const renderReview = (review, type) => (
        <div key={`${type}-${review.id}`} style={styles.reviewItem}>
            <div style={styles.reviewHeader}>
                <strong>{review.user_username}</strong>
                <span style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</span>
            </div>
            {type === 'offer' && <p style={styles.reviewOfferTitle}>on: {review.offer_title}</p>}
            <p style={styles.reviewComment}>{review.comment}</p>
            <small style={styles.reviewDate}>{new Date(review.created_at).toLocaleString()}</small>
        </div>
    );

    return (
        <div style={styles.reviewsContainer}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Customer Feedback</h2>
            </div>
            <div style={styles.tabs}>
                <button 
                    style={activeTab === 'shop' ? styles.activeTab : styles.tab} 
                    onClick={() => setActiveTab('shop')}>
                    Shop Reviews ({shopReviews.length})
                </button>
                <button 
                    style={activeTab === 'offer' ? styles.activeTab : styles.tab} 
                    onClick={() => setActiveTab('offer')}>
                    Offer Reviews ({offerReviews.length})
                </button>
            </div>
            <div style={styles.reviewList}>
                {activeTab === 'shop' && (
                    shopReviews.length > 0 ? 
                    shopReviews.map(r => renderReview(r, 'shop')) : 
                    <p>No reviews for your shop yet.</p>
                )}
                {activeTab === 'offer' && (
                    offerReviews.length > 0 ? 
                    offerReviews.map(r => renderReview(r, 'offer')) : 
                    <p>No reviews for your offers yet.</p>
                )}
            </div>
        </div>
    );
};


// --- Main Dashboard Page Component ---
export default function VendorDashboard() {
    const { user, authTokens, logoutUser } = useContext(AuthContext);
    const [storeData, setStoreData] = useState(null);
    const [shopReviews, setShopReviews] = useState([]);
    const [offerReviews, setOfferReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
    const [showSubInfo, setShowSubInfo] = useState(false);
    
    // State for the offer form, including discount calculation
    const [offerForm, setOfferForm] = useState({
        title: '', description: '', original_price: '', discounted_price: '',
        discount_percentage: '', image: null, start_time: '', end_time: ''
    });
    const [lastChanged, setLastChanged] = useState(null);

    useEffect(() => {
        const { original_price, discounted_price, discount_percentage } = offerForm;

        if (lastChanged === 'price') {
            const orig = parseFloat(original_price);
            const disc = parseFloat(discounted_price);
            if (orig > 0 && disc >= 0 && orig > disc) {
                const percentage = Math.round(((orig - disc) / orig) * 100);
                setOfferForm(prev => ({ ...prev, discount_percentage: percentage.toString() }));
            } else {
                 setOfferForm(prev => ({ ...prev, discount_percentage: '' }));
            }
        } else if (lastChanged === 'percentage') {
            const orig = parseFloat(original_price);
            const perc = parseFloat(discount_percentage);
            if (orig > 0 && perc >= 0 && perc <= 100) {
                const discounted = (orig - (orig * perc / 100)).toFixed(2);
                setOfferForm(prev => ({ ...prev, discounted_price: discounted.toString() }));
            } else {
                setOfferForm(prev => ({ ...prev, discounted_price: '' }));
            }
        }
    }, [offerForm.original_price, offerForm.discounted_price, offerForm.discount_percentage, lastChanged]);

    const handleOfferFormChange = (e) => {
        const { name, value } = e.target;
        let changeSource = null;
        if (name === 'original_price' || name === 'discounted_price') {
            changeSource = 'price';
        } else if (name === 'discount_percentage') {
            changeSource = 'percentage';
        }
        setOfferForm(prev => ({ ...prev, [name]: value, lastChanged: changeSource }));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!authTokens?.access || !user?.is_vendor) {
                setLoading(false);
                return;
            }
            try {
                const [storeRes, shopReviewsRes, offerReviewsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/vendor/my-store/`, { headers: { Authorization: `Bearer ${authTokens.access}` } }),
                    axios.get(`${API_URL}/api/vendor/shop-reviews/`, { headers: { Authorization: `Bearer ${authTokens.access}` } }),
                    axios.get(`${API_URL}/api/vendor/offer-reviews/`, { headers: { Authorization: `Bearer ${authTokens.access}` } })
                ]);
                setStoreData(storeRes.data);
                setShopReviews(shopReviewsRes.data.results || []);
                setOfferReviews(offerReviewsRes.data.results || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Could not fetch dashboard data. Please ensure your profile is complete.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [authTokens?.access, user?.is_vendor]);

    if (!user?.is_vendor) return <Navigate to="/home" />;

    const handleSubscribe = async () => {
        try {
            const orderResponse = await axios.post(`${API_URL}/api/vendor/subscription/create/`, {}, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            const orderData = orderResponse.data;
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: orderData.name,
                description: orderData.description,
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        const verificationResponse = await axios.post(`${API_URL}/api/vendor/subscription/verify/`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${authTokens.access}` } });
                        setStoreData(verificationResponse.data);
                        setFeedbackMessage({ type: 'success', text: 'Subscription successful!' });
                    } catch (err) {
                        console.error("Payment verification failed:", err);
                        setFeedbackMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
                    }
                },
                prefill: { name: orderData.prefill.name, email: orderData.prefill.email },
                theme: { color: "#A0C878" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Subscription failed:", err);
            setFeedbackMessage({ type: 'error', text: 'Could not initiate payment.' });
            throw err; 
        }
    };

    const handleCreate = () => {
        setEditingOffer(null);
        setOfferForm({ title: '', description: '', original_price: '', discounted_price: '', discount_percentage: '', image: null, start_time: '', end_time: '' });
        setShowOfferForm(true);
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setOfferForm(offer);
        setShowOfferForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this offer?")) {
            try {
                await axios.delete(`${API_URL}/api/vendor/offers/${id}/delete/`, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setStoreData(prev => ({
                    ...prev,
                    offers: prev.offers.filter(o => o.id !== id),
                }));
            } catch (err) {
                console.error("Failed to delete offer:", err);
                alert("Could not delete the offer.");
            }
        }
    };

    const handleSave = (updatedOffer) => {
        setStoreData(prev => {
            const offers = editingOffer
                ? prev.offers.map(o => (o.id === updatedOffer.id ? updatedOffer : o))
                : [updatedOffer, ...prev.offers];
            return { ...prev, offers };
        });
        setShowOfferForm(false);
        setEditingOffer(null);
    };

    const handleProfileSave = (data) => {
        setStoreData(data);
        setIsEditingProfile(false);
    };

    const renderContent = () => {
        if (loading) return <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div><p style={styles.loadingText}>Loading Dashboard...</p></div>;
        if (error) return <div style={styles.errorContainer}><div style={styles.errorIcon}>⚠️</div><p style={styles.errorMessage}>{error}</p></div>;
        if (!storeData) return <div style={styles.welcomeContainer}><h2>Welcome!</h2><p>There was an issue loading your store data.</p></div>;

        const profileSection = <StoreProfileDisplay storeData={storeData} onEditClick={() => setIsEditingProfile(true)} />;

        if (!storeData.is_approved) {
            return (
                <div style={styles.container}>
                    <div style={styles.pendingContainer}>
                        <div style={styles.pendingIcon}>⏳</div>
                        <h2 style={styles.pendingTitle}>Store Under Review</h2>
                        <p style={styles.pendingMessage}>Your store profile is currently being reviewed. You can edit your details while you wait.</p>
                    </div>
                    {profileSection}
                </div>
            );
        }

        return (
            <div style={styles.container}>
                {profileSection}
                {!storeData.subscription?.is_active && 
                    <div style={styles.inactiveSubscription}>
                        <p><strong>Status:</strong> Inactive</p>
                        <p>Subscribe to get your offers approved instantly by our AI agent and reach more customers!</p>
                        <button onClick={handleSubscribe} style={styles.createFirstButton}>
                            Subscribe Now (₹99/month)
                        </button>
                    </div>
                }
                <div style={styles.offersSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Your Offers</h2>
                        <div style={styles.offerStats}>
                            <span style={styles.statItem}>{storeData.offers?.length || 0} Total</span>
                            <span style={styles.statItem}>{storeData.offers?.filter(o => o.is_approved).length || 0} Approved</span>
                        </div>
                    </div>
                    <div style={styles.offerGrid}>
                        {storeData.offers?.length > 0 ? (
                            storeData.offers.map(offer => {
                                const specificOfferReviews = offerReviews.filter(r => r.offer_title === offer.title);
                                return (
                                    <VendorOfferCard
                                        key={offer.id}
                                        offer={offer}
                                        onDelete={() => handleDelete(offer.id)}
                                        onEdit={() => handleEdit(offer)}
                                        reviews={specificOfferReviews}
                                    />
                                );
                            })
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>📦</div>
                                <h3>No offers yet</h3>
                                <p>Create your first offer to start attracting customers!</p>
                                <button onClick={handleCreate} style={styles.createFirstButton}>
                                    Create Your First Offer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <ReviewsSection shopReviews={shopReviews} offerReviews={offerReviews} />
            </div>
        );
    };

    return (
        <div style={styles.dashboardWrapper}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <h1 style={styles.headerTitle}>
                            {storeData?.name || 'Vendor Dashboard'}
                            {storeData?.subscription?.is_active && (
                                <div style={{ position: 'relative' }}>
                                    <button 
                                        onClick={() => setShowSubInfo(prev => !prev)}
                                        onBlur={() => setTimeout(() => setShowSubInfo(false), 100)}
                                        style={styles.proBadge}
                                    >
                                        PRO
                                    </button>
                                    {showSubInfo && (
                                        <div style={styles.subInfoPopover}>
                                            <p style={{margin: 0, fontWeight: 'bold'}}>Active Subscription</p>
                                            <p style={{margin: '0.25rem 0 0 0', fontSize: '0.875rem'}}>Expires on: {new Date(storeData.subscription.end_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </h1>
                        <p style={styles.headerSubtitle}>Welcome back, {user.username}</p>
                    </div>
                    <div style={styles.headerActions}>
                        {storeData?.is_approved && (
                            <button onClick={handleCreate} style={styles.createButton}>
                                <span style={styles.buttonIcon}>+</span> Create New Offer
                            </button>
                        )}
                        <button onClick={logoutUser} style={styles.logoutButton}>
                            <span style={styles.buttonIcon}>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </div>
            <div style={styles.content}>
                {renderContent()}
            </div>
            {showOfferForm &&
                <OfferForm
                    onComplete={handleSave}
                    existingOffer={editingOffer}
                    onCancel={() => setShowOfferForm(false)}
                    offerForm={offerForm}
                    handleOfferFormChange={handleOfferFormChange}
                />
            }
            {isEditingProfile &&
                <StoreProfileEditForm
                    initialData={storeData}
                    onSave={handleProfileSave}
                    onCancel={() => setIsEditingProfile(false)}
                />
            }
            {feedbackMessage.text && (
                <div style={{...styles.feedbackBox, backgroundColor: feedbackMessage.type === 'success' ? '#dcfce7' : '#fee2e2'}}>
                    <p style={{color: feedbackMessage.type === 'success' ? '#166534' : '#991b1b', margin: 0}}>{feedbackMessage.text}</p>
                    <button onClick={() => setFeedbackMessage({ type: '', text: '' })} style={styles.closeButton}>✕</button>
                </div>
            )}
        </div>
    );
}

const styles = {
    dashboardWrapper: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 100 },
    headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    headerTitle: { fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' },
    headerSubtitle: { fontSize: '0.875rem', color: '#64748b', margin: 0 },
    headerActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
    createButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    logoutButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    buttonIcon: { fontSize: '1rem' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
    container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    profileCard: { backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' },
    profileHeader: { display: 'flex', alignItems: 'center', marginBottom: '2rem' },
    profileLogo: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', marginRight: '1rem'},
    profileInfo: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 },
    storeName: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    categoryBadge: { display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', width: 'fit-content' },
    editButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    editIcon: { fontSize: '0.875rem' },
    profileDetails: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
    detailItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
    detailIcon: { fontSize: '1.25rem', marginTop: '0.125rem' },
    detailLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.25rem', display: 'block' },
    detailValue: { fontSize: '0.875rem', color: '#1e293b', margin: 0, lineHeight: '1.5' },
    mapLink: { color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
    editFormOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    editFormContainer: { backgroundColor: '#ffffff', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    editFormHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0' },
    editFormTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    closeButton: { padding: '0.5rem', backgroundColor: 'transparent', border: 'none', fontSize: '1.25rem', color: '#64748b', cursor: 'pointer', borderRadius: '0.25rem' },
    editForm: { padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    formLabel: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
    formInput: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#ffffff' },
    formTextarea: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' },
    formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
    cancelButton: { padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    saveButton: { padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    offersSection: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 },
    offerStats: { display: 'flex', gap: '1rem' },
    statItem: { fontSize: '0.875rem', color: '#64748b', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', fontWeight: '600' },
    offerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' },
    loadingSpinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    loadingText: { fontSize: '1rem', color: '#64748b' },
    errorContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1rem' },
    errorIcon: { fontSize: '3rem' },
    errorMessage: { fontSize: '1.125rem', color: '#dc2626', textAlign: 'center', maxWidth: '600px' },
    pendingContainer: { backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '1rem', padding: '2rem', textAlign: 'center', marginBottom: '2rem' },
    pendingIcon: { fontSize: '3rem', marginBottom: '1rem' },
    pendingTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#92400e', margin: '0 0 1rem 0' },
    pendingMessage: { fontSize: '1rem', color: '#a16207', lineHeight: '1.5', margin: 0 },
    emptyState: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '2px dashed #cbd5e1' },
    emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
    createFirstButton: { marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
    welcomeContainer: { textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0' },
    reviewsContainer: { backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' },
    tabs: { display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' },
    tab: { padding: '0.75rem 1.5rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#64748b', fontWeight: '600' },
    activeTab: { padding: '0.75rem 1.5rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#1e293b', fontWeight: '700', borderBottom: '3px solid #10b981' },
    reviewList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    reviewItem: { border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    reviewRating: { fontSize: '0.875rem' },
    reviewOfferTitle: { fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', margin: '0 0 0.5rem 0' },
    reviewComment: { margin: 0, color: '#374151' },
    reviewDate: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' },
    activeSubscription: { fontSize: '1rem', color: '#374151', lineHeight: 1.6 },
    inactiveSubscription: { fontSize: '1rem', color: '#374151', lineHeight: 1.6, textAlign: 'center', padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem' },
    proBadge: { fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#facc15', color: '#713f12', padding: '0.25rem 0.6rem', borderRadius: '9999px', letterSpacing: '0.05em', cursor: 'pointer', border: 'none' },
    subInfoPopover: { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '0.5rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1100, width: '250px', border: '1px solid #e2e8f0' },
    feedbackBox: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1100, display: 'flex', alignItems: 'center', gap: '1rem' },
};
