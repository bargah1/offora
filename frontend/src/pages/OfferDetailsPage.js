import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Helper components for icons
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const Heart = ({ isFavorited }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? '#ef4444' : 'none'} stroke={isFavorited ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const Share2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const Star = ({ filled, size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MapPin = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const REVIEWS_PER_PAGE = 3;

export default function OfferDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authTokens, user } = useContext(AuthContext);

    const [offer, setOffer] = useState(null);
    const [shopOffers, setShopOffers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PER_PAGE);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('reviews');

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id || !authTokens?.access) return;
            setLoading(true);
            try {
                const offerRes = await axios.get(`http://127.0.0.1:8000/api/offers/${id}/`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                const currentOffer = offerRes.data;
                setOffer(currentOffer);
                setIsFavorited(currentOffer.is_favorited);

                if (currentOffer.store) {
                    const shopOffersRes = await axios.get(`http://127.0.0.1:8000/api/offers/`, {
                        headers: { Authorization: `Bearer ${authTokens.access}` },
                        params: { store: currentOffer.store }
                    });
                    setShopOffers(shopOffersRes.data.results.filter(o => o.id !== parseInt(id)).slice(0, 2));
                }

                const reviewsRes = await axios.get(`http://127.0.0.1:8000/api/offers/${id}/reviews/`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                setReviews(Array.isArray(reviewsRes.data.results) ? reviewsRes.data.results : (Array.isArray(reviewsRes.data) ? reviewsRes.data : []));

            } catch (err) {
                setError("Offer not found or an error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, authTokens?.access]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/offers/${id}/reviews/`, {
                rating: reviewRating,
                comment: reviewText
            }, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setReviews(prevReviews => [response.data, ...(Array.isArray(prevReviews) ? prevReviews : [])]);
            setReviewText('');
            setReviewRating(5);
            setActiveTab('reviews');
        } catch (err) {
            alert("Failed to submit review. You may have already reviewed this offer.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFavorite = async () => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/offers/${id}/favorite/`, {}, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setIsFavorited(prev => !prev);
        } catch (err) {
            alert("Could not update favorites.");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: offer.title,
            text: `Check out this amazing offer from ${offer.store_name}: ${offer.title}`,
            url: window.location.href
        };
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) return <div style={styles.status}>Loading...</div>;
    if (error) return <div style={styles.status}>❌ {error}</div>;
    if (!offer) return null;

    const {
        title, image, description, original_price, discounted_price, discount_percentage,
        store, store_name, store_logo, store_rating, store_review_count, store_address, store_category_display, end_time
    } = offer;

    const userHasReviewed = reviews.some(r => r.user_username === user.username);

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.content}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <ChevronLeft /> Back to offers
                </button>

                {/* --- NEW REORDERED LAYOUT --- */}

                {/* 1. OFFER IMAGE AND DETAILS */}
                <div style={styles.section}>
                    <div style={styles.imageContainer}>
                        <img src={image} alt={title} style={styles.mainImage} />
                    </div>
                    <div style={styles.detailsSection}>
                        <div style={styles.titleContainer}>
                            <h1 style={styles.title}>{title}</h1>
                            <div style={styles.actionButtons}>
                                <button onClick={handleFavorite} style={styles.iconButton}><Heart isFavorited={isFavorited} /></button>
                                <button onClick={handleShare} style={styles.iconButton}><Share2 /></button>
                            </div>
                        </div>
                        <div style={styles.priceContainer}>
                            <span style={styles.discountedPrice}>₹{parseFloat(discounted_price).toFixed(2)}</span>
                            <span style={styles.originalPrice}>₹{parseFloat(original_price).toFixed(2)}</span>
                            {discount_percentage && <span style={styles.discountBadge}>{discount_percentage}% OFF</span>}
                        </div>
                        <p style={styles.expiry}>Valid until: {new Date(end_time).toLocaleDateString()}</p>
                        <h2 style={styles.sectionTitle}>Description</h2>
                        <p style={styles.description}>{description}</p>
                    </div>
                </div>

                {/* 2. SHOP DETAILS */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Shop Information</h2>
                    <div style={styles.shopCard}>
                        <div style={styles.shopInfo}>
                            <img src={store_logo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${store_name}`} alt={store_name} style={styles.shopLogo} />
                            <div>
                                <h4 style={styles.shopName}>{store_name}</h4>
                                <p style={styles.shopSubtext}>{store_category_display}</p>
                                <p style={styles.shopSubtext}>⭐ {store_rating?.toFixed(1)} ({store_review_count || 0} reviews)</p>
                            </div>
                        </div>
                        <div style={styles.addressContainer}>
                            <MapPin size={18} />
                            <span>{store_address}</span>
                        </div>
                        <Link to={`/shop/${store}`} style={styles.primaryButton}>View Shop</Link>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(store_address)}`} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>
                            <MapPin size={16}/> View on Map
                        </a>
                    </div>
                </div>

                {/* 3. MORE OFFERS */}
                {shopOffers.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>More Offers From This Shop</h2>
                        <div style={{...styles.shopCard, backgroundColor: 'white'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {shopOffers.map(o => (
                                    <Link to={`/offer/${o.id}`} key={o.id} style={{display: 'flex', gap: '0.75rem', textDecoration: 'none', color: 'inherit'}}>
                                        <img src={o.image} alt={o.title} style={{width: '64px', height: '64px', borderRadius: '0.5rem', objectFit: 'cover'}} />
                                        <div>
                                            <p style={{fontWeight: '600'}}>{o.title}</p>
                                            <p style={{fontSize: '0.875rem', color: '#64748b'}}>Valid until {new Date(o.end_time).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. REVIEWS */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Reviews</h2>
                    <div style={styles.tabs}>
                        <button onClick={() => setActiveTab('reviews')} style={activeTab === 'reviews' ? styles.activeTab : styles.tab}>All Reviews ({reviews.length})</button>
                        {!userHasReviewed && <button onClick={() => setActiveTab('add')} style={activeTab === 'add' ? styles.activeTab : styles.tab}>Add Review</button>}
                    </div>

                    {activeTab === 'reviews' && (
                        <div style={styles.reviewList}>
                            {reviews.length > 0 ? reviews.slice(0, visibleReviews).map(review => (
                                <div key={review.id} style={styles.reviewCard}>
                                    <div style={styles.reviewHeader}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_username}`} alt={review.user_username} style={styles.avatar} />
                                        <div>
                                            <p style={{fontWeight: '600'}}>{review.user_username}</p>
                                            <div style={{display: 'flex', gap: '0.25rem'}}>{[...Array(5)].map((_, i) => <Star key={i} filled={i < review.rating} />)}</div>
                                        </div>
                                    </div>
                                    <p style={styles.reviewComment}>{review.comment}</p>
                                </div>
                            )) : <p style={styles.noReviews}>No reviews for this offer yet.</p>}
                            {reviews.length > visibleReviews && (
                                <button onClick={() => setVisibleReviews(v => v + REVIEWS_PER_PAGE)} style={{...styles.secondaryButton, alignSelf: 'center'}}>Show More Reviews</button>
                            )}
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div style={styles.reviewCard}>
                            <h3 style={{fontWeight: '600', marginBottom: '0.75rem'}}>Rate this offer</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{display: 'flex', gap: '0.25rem', marginBottom: '1rem', cursor: 'pointer'}}>
                                    {[5,4,3,2,1].map(star => (
                                        <span key={star} onClick={() => setReviewRating(star)}>
                                            <Star size={24} filled={star <= reviewRating} />
                                        </span>
                                    ))}
                                </div>
                                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." required style={styles.textarea} />
                                <button type="submit" disabled={submitting} style={{...styles.primaryButton, width: 'auto'}}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


const styles = {
    pageWrapper: { minHeight: '100vh', backgroundColor: '#FFFDF6', fontFamily: 'system-ui, sans-serif' },
    content: { maxWidth: '900px', margin: '0 auto', padding: '1rem 2rem 2rem 2rem' },
    backBtn: { display: 'inline-flex', alignItems: 'center', fontWeight: '500', marginBottom: '1.5rem', color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer' },
    imageContainer: { borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', marginBottom: '2rem' },
    mainImage: { width: '100%', display: 'block' },
    detailsSection: { marginBottom: '2.5rem' },
    titleContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#1e293b', lineHeight: 1.2 },
    actionButtons: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
    iconButton: { padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '50%', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    priceContainer: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', gap: '0.75rem' },
    discountedPrice: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' },
    originalPrice: { fontSize: '1.25rem', color: '#94a3b8', textDecoration: 'line-through' },
    discountBadge: { backgroundColor: '#DDEB9D', color: '#3f6212', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' },
    expiry: { fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' },
    section: { marginBottom: '2.5rem' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', color: '#1e293b' },
    description: { color: '#475569', lineHeight: 1.6 },
    tabs: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' },
    tab: { padding: '0.5rem 1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#64748b', fontWeight: '600', borderBottom: '3px solid transparent' },
    activeTab: { padding: '0.5rem 1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#1e293b', fontWeight: '600', borderBottom: '3px solid #A0C878' },
    reviewList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    reviewCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' },
    reviewHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' },
    reviewComment: { marginTop: '0.75rem', color: '#475569', lineHeight: 1.6 },
    noReviews: { color: '#64748b', textAlign: 'center', padding: '2rem 0' },
    textarea: { width: '100%', minHeight: '80px', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', margin: '0.75rem 0', fontSize: '1rem' },
    primaryButton: { width: '100%', backgroundColor: '#A0C878', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center', transition: 'background-color 0.2s' },
    secondaryButton: { width: '100%', backgroundColor: 'white', color: '#374151', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background-color 0.2s' },
    shopCard: { backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    shopInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' },
    shopLogo: { height: '48px', width: '48px', borderRadius: '50%', objectFit: 'cover' },
    shopName: { fontWeight: 'bold', margin: 0 },
    shopSubtext: { fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' },
    addressContainer: { borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#374151' },
    status: { padding: 30, textAlign: 'center', fontWeight: 'bold' },
};
