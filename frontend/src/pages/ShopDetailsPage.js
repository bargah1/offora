import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Phone, Star, ChevronLeft, Heart, Share2 } from 'lucide-react';

// Custom hook to get window size for responsive design in JS
const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => {
            setSize([window.innerWidth, window.innerHeight]);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

// Simplified OfferCard for demonstration
const OfferCard = ({ offer }) => {
    // Styles are defined inside for component encapsulation
    const offerCardStyles = {
        offerCardLink: { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' },
        offerCard: { height: '100%', overflow: 'hidden', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' },
        offerCardImageContainer: { position: 'relative', height: '12rem', overflow: 'hidden' },
        offerCardImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
        offerCardDiscountBadge: { position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#A0C878', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontWeight: 500, fontSize: '0.875rem' },
        offerCardContent: { padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' },
        offerCardTitle: { fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem', color: '#1f2937' },
        offerCardPriceContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' },
        offerCardOriginalPrice: { color: '#6b7280', textDecoration: 'line-through' },
        offerCardDiscountedPrice: { color: '#A0C878', fontWeight: 700, fontSize: '1.125rem' },
        offerCardAddressContainer: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginTop: 'auto' },
        offerCardAddressIcon: { height: '1rem', width: '1rem', flexShrink: 0, marginTop: '0.125rem' },
    };

    return (
        <Link to={`/offers/${offer.id}`} key={offer.id} style={offerCardStyles.offerCardLink}>
            <div style={offerCardStyles.offerCard}>
                <div style={offerCardStyles.offerCardImageContainer}>
                    <img src={offer.image || `https://placehold.co/400x300/DDEB9D/333?text=Offer`} alt={offer.title} style={offerCardStyles.offerCardImage} />
                    {offer.discount_percentage && <div style={offerCardStyles.offerCardDiscountBadge}>{offer.discount_percentage}% OFF</div>}
                </div>
                <div style={offerCardStyles.offerCardContent}>
                    <h3 style={offerCardStyles.offerCardTitle}>{offer.title}</h3>
                    <div style={offerCardStyles.offerCardPriceContainer}>
                        <span style={offerCardStyles.offerCardOriginalPrice}>₹{parseFloat(offer.original_price).toFixed(2)}</span>
                        <span style={offerCardStyles.offerCardDiscountedPrice}>₹{parseFloat(offer.discounted_price).toFixed(2)}</span>
                    </div>
                    <div style={offerCardStyles.offerCardAddressContainer}>
                        <MapPin style={offerCardStyles.offerCardAddressIcon} />
                        <span>{offer.store?.address || 'Address not available'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default function ShopDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, authTokens } = useContext(AuthContext);
    const [width] = useWindowSize(); // Get window width for responsive styles

    const [shop, setShop] = useState(null);
    const [offers, setOffers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('offers');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!id || !authTokens) return;
            setLoading(true);
            try {
                const [shopRes, offersRes, reviewsRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/stores/${id}/`, { headers: { Authorization: `Bearer ${authTokens.access}` } }),
                    axios.get(`http://127.0.0.1:8000/api/offers/?store=${id}`, { headers: { Authorization: `Bearer ${authTokens.access}` } }),
                    axios.get(`http://127.0.0.1:8000/api/stores/${id}/reviews/`, { headers: { Authorization: `Bearer ${authTokens.access}` } })
                ]);
                setShop(shopRes.data);
                setOffers(offersRes.data.results || []);
                setReviews(reviewsRes.data.results || []);
                setIsFavorite(shopRes.data.is_favorited || false);
            } catch (err) {
                console.error("Failed to fetch shop data:", err);
                setError("Could not load shop details.");
            } finally {
                setLoading(false);
            }
        };
        fetchShopData();
    }, [id, authTokens]);

    const handleFavoriteToggle = async () => {
        setIsFavorite(!isFavorite);
        try {
            await axios.post(`http://127.0.0.1:8000/api/stores/${id}/favorite/`, {}, { headers: { Authorization: `Bearer ${authTokens.access}` } });
        } catch (err) {
            console.error("Failed to toggle favorite", err);
            setIsFavorite(isFavorite => !isFavorite); // Revert on error
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: shop.name, text: `Check out the great deals at ${shop.name}!`, url: window.location.href, })
            .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    // Responsive styles based on window width
    const isDesktop = width >= 768;
    const styles = getStyles(isDesktop);

    if (loading) return <p style={styles.message}>Loading shop...</p>;
    if (error) return <p style={{ ...styles.message, color: '#dc2626' }}>{error}</p>;
    if (!shop) return <p style={styles.message}>Shop not found.</p>;

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <ChevronLeft size={18} />
                    Back
                </button>
            </div>

            <header style={styles.header}>
                <div style={styles.container}>
                    <div style={styles.headerContent}>
                        <img src={shop.logo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`} alt={`${shop.name} logo`} style={styles.shopLogo} />
                        <div style={styles.headerInfo}>
                            <div style={styles.headerInfoTop}>
                                <div style={{ minWidth: 0 }}>
                                    <h1 style={styles.shopName}>{shop.name}</h1>
                                    <div style={styles.shopMeta}>
                                        <span style={styles.categoryBadge}>{shop.get_category_display || shop.category}</span>
                                        <div style={styles.ratingWrapper}>
                                            <Star style={styles.starIcon} />
                                            <span style={styles.ratingText}>{parseFloat(shop.rating).toFixed(1)}</span>
                                            <span style={styles.reviewCount}>({shop.review_count} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={styles.actionButtons}>
                                    <button onClick={handleShare} style={styles.iconButton} aria-label="Share shop"><Share2 size={20} /></button>
                                    <button onClick={handleFavoriteToggle} style={{ ...styles.iconButton, ...(isFavorite ? styles.iconButtonFavorite : {}) }} aria-label="Favorite shop">
                                        <Heart size={20} style={{ ...(isFavorite ? styles.heartIconFavorite : styles.heartIcon) }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ ...styles.container, marginTop: '2rem' }}>
                <div style={styles.infoCard}>
                    <div style={styles.contactGrid}>
                        <div style={styles.contactItem}>
                            <MapPin style={styles.contactIcon} />
                            <div>
                                <p style={styles.contactLabel}>Address</p>
                                <p style={styles.contactValue}>{shop.address}</p>
                                <a href={`https://maps.google.com/?q=${encodeURIComponent(shop.address)}`} target="_blank" rel="noopener noreferrer" style={styles.contactLink}>View on Map</a>
                            </div>
                        </div>
                        <div style={styles.contactItem}>
                            <Phone style={styles.contactIcon} />
                            <div>
                                <p style={styles.contactLabel}>Phone</p>
                                <p style={styles.contactValue}>{shop.phone_number || 'Not available'}</p>
                                {shop.phone_number && <a href={`tel:${shop.phone_number.replace(/\s+/g, "")}`} style={styles.contactLink}>Call Now</a>}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%' }}>
                    <div style={styles.tabsContainer}>
                        <button onClick={() => setActiveTab('offers')} style={{ ...styles.tabButton, ...(activeTab === 'offers' ? styles.activeTab : {}) }}>Available Offers ({offers.length})</button>
                        <button onClick={() => setActiveTab('reviews')} style={{ ...styles.tabButton, ...(activeTab === 'reviews' ? styles.activeTab : {}) }}>Reviews ({reviews.length})</button>
                    </div>

                    {activeTab === 'offers' && (
                        <div style={styles.grid}>
                            {offers.length > 0 ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} />) : <p style={{ ...styles.message, gridColumn: '1 / -1' }}>No offers currently available.</p>}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={styles.reviewsHeader}>
                                <h2 style={styles.sectionTitle}>Customer Reviews</h2>
                                <button style={styles.writeReviewButton}>Write a Review</button>
                            </div>
                            {reviews.length > 0 ? reviews.map((review) => (
                                <div key={review.id} style={styles.reviewCard}>
                                    <div style={styles.reviewAuthor}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_username}`} alt={review.user_username} style={styles.reviewAvatar} />
                                        <div>
                                            <p style={styles.reviewUsername}>{review.user_username}</p>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} style={{ ...styles.starIconSmall, ...(i < review.rating ? styles.starIconFilled : styles.starIconEmpty) }} />)}
                                            </div>
                                        </div>
                                    </div>
                                    <p style={styles.reviewComment}>{review.comment}</p>
                                </div>
                            )) : <p style={{ ...styles.message, padding: '3rem 0' }}>No reviews yet. Be the first!</p>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Styles function to handle responsiveness
const getStyles = (isDesktop) => ({
    pageWrapper: { backgroundColor: '#FFFDF6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' },
    message: { textAlign: 'center', padding: '2rem', color: '#6b7280' },
    backButton: { display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '1rem 0', color: '#4b5563', fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer' },
    header: { backgroundColor: '#FAF6E9', padding: '1.5rem 0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    headerContent: { display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'flex-start', gap: '1.5rem' },
    shopLogo: { width: '6rem', height: '6rem', borderRadius: '9999px', objectFit: 'cover', flexShrink: 0, border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
    headerInfo: { flexGrow: 1, minWidth: 0, width: '100%' },
    headerInfoTop: { display: 'flex', flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: '1rem', alignItems: isDesktop ? 'flex-start' : 'stretch' },
    shopName: { fontSize: '1.875rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    shopMeta: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' },
    categoryBadge: { display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#DDEB9D', color: '#374151' },
    ratingWrapper: { display: 'flex', alignItems: 'center', gap: '0.375rem' },
    starIcon: { height: '1.25rem', width: '1.25rem', color: '#f59e0b' },
    ratingText: { fontWeight: 700, color: '#374151', fontSize: '1.125rem' },
    reviewCount: { color: '#6b7280', fontSize: '0.875rem' },
    actionButtons: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, alignSelf: isDesktop ? 'center' : 'flex-start', paddingTop: isDesktop ? '0' : '0.5rem' },
    iconButton: { height: '2.5rem', width: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#4b5563', transition: 'background-color 0.2s', cursor: 'pointer' },
    iconButtonFavorite: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    heartIcon: { transition: 'all 0.2s', color: '#6b7280' },
    heartIconFavorite: { color: '#ef4444' },
    infoCard: { backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem' },
    description: { color: '#374151', marginBottom: '1.5rem', lineHeight: 1.6 },
    contactGrid: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)', gap: '1.5rem 2rem' },
    contactItem: { display: 'flex', alignItems: 'flex-start', gap: '1rem' },
    contactIcon: { height: '1.5rem', width: '1.5rem', color: '#A0C878', marginTop: '0.25rem', flexShrink: 0 },
    contactLabel: { fontWeight: 600, color: '#1f2937' },
    contactValue: { color: '#4b5563' },
    contactLink: { fontSize: '0.875rem', fontWeight: 500, color: '#8ab368', textDecoration: 'none' },
    tabsContainer: { width: '100%', maxWidth: '28rem', marginBottom: '2rem', backgroundColor: '#FAF6E9', borderRadius: '0.5rem', padding: '0.25rem', display: 'flex' },
    tabButton: { flex: 1, fontWeight: 600, padding: '0.5rem', borderRadius: '0.375rem', transition: 'all 0.2s', color: '#4b5563', border: 'none', background: 'transparent', cursor: 'pointer' },
    activeTab: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    reviewsHeader: { display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', width: '100%' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#1f2937' },
    writeReviewButton: { padding: '0.5rem 1rem', backgroundColor: '#A0C878', color: 'white', fontWeight: 600, borderRadius: '0.5rem', transition: 'background-color 0.2s', border: 'none', flexShrink: 0, cursor: 'pointer' },
    reviewCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' },
    reviewAuthor: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
    reviewAvatar: { width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#f3f4f6' },
    reviewUsername: { fontWeight: 600, color: '#111827' },
    starIconSmall: { height: '1rem', width: '1rem' },
    starIconFilled: { color: '#f59e0b' },
    starIconEmpty: { color: '#d1d5db' },
    reviewComment: { color: '#374151', lineHeight: 1.6 },
});
