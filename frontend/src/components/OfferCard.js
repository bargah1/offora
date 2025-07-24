import React from 'react';
import { Link } from 'react-router-dom';

// Helper components for icons to avoid extra libraries
const MapPinIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '2px' }}
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

const HeartIcon = ({ isFavorited }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={isFavorited ? '#ef4444' : 'white'} 
        stroke={isFavorited ? '#ef4444' : 'black'} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
);


export default function OfferCard({ offer, onFavoriteToggle, isFavorited }) {
  // Helper function to calculate discount percentage if not provided
  const getDiscountPercentage = () => {
    if (offer.discount_percentage) {
      return offer.discount_percentage;
    }
    if (offer.original_price && offer.discounted_price) {
      const discount = ((offer.original_price - offer.discounted_price) / offer.original_price) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const discountPercentage = getDiscountPercentage();
  const imageUrl = offer.image || `https://placehold.co/400x300/e2e8f0/475569?text=${offer.title}`;
  const mapUrl = offer.latitude && offer.longitude ? `https://www.google.com/maps?q=${offer.latitude},${offer.longitude}` : null;

  // Handler for the favorite button click
  const handleFavoriteClick = (e) => {
    // These two lines are crucial to prevent the card's main link from firing
    e.stopPropagation();
    e.preventDefault();
    onFavoriteToggle(offer.id, !isFavorited);
  };

  return (
    <Link to={`/offer/${offer.id}`} style={styles.cardLink}>
        <div style={styles.card}>
            <div style={styles.imageContainer}>
                <img 
                    src={imageUrl} 
                    alt={offer.title} 
                    style={styles.image} 
                />
                {discountPercentage && (
                    <div style={styles.discountBadge}>
                        {discountPercentage}% OFF
                    </div>
                )}
                {/* --- THE FIX IS HERE: Added the favorite button --- */}
                <button onClick={handleFavoriteClick} style={styles.favoriteButton}>
                    <HeartIcon isFavorited={isFavorited} />
                </button>
            </div>
            <div style={styles.content}>
                <h3 style={styles.title}>{offer.title}</h3>
                <p style={styles.storeName}>{offer.store_name}</p>
                
                <div style={styles.priceContainer}>
                    {offer.discounted_price && <p style={styles.discountedPrice}>₹{parseFloat(offer.discounted_price).toFixed(2)}</p>}
                    {offer.original_price && <p style={styles.originalPrice}>₹{parseFloat(offer.original_price).toFixed(2)}</p>}
                </div>
                
                <div style={styles.locationContainer}>
                    <MapPinIcon />
                    <div>
                        <p style={styles.address}>{offer.store_address}</p>
                        {mapUrl && (
                            <a 
                                href={mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={styles.mapLink} 
                                onClick={(e) => e.stopPropagation()}
                            >
                                View on Map
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </Link>
  );
}

const styles = {
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        display: 'block'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        height: '100%',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: '75%', // 4:3 Aspect Ratio
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        backgroundColor: '#A0C878',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        background: 'rgba(255,255,255,0.8)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
    },
    content: {
        padding: '1rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: '1.125rem',
        fontWeight: 'bold',
        lineHeight: 1.4,
        maxHeight: '2.8em', // Limit to 2 lines
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: '0 0 0.25rem 0',
    },
    storeName: {
        fontSize: '0.875rem',
        color: '#64748b',
        margin: '0 0 0.5rem 0',
    },
    priceContainer: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.5rem',
        margin: '0 0 0.75rem 0',
    },
    discountedPrice: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#A0C878',
        margin: 0,
    },
    originalPrice: {
        fontSize: '1rem',
        color: '#94a3b8',
        textDecoration: 'line-through',
        margin: 0,
    },
    locationContainer: {
        marginTop: 'auto',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        color: '#64748b',
    },
    address: {
        fontSize: '0.875rem',
        margin: 0,
        lineHeight: 1.5,
        maxHeight: '3em', // Limit to 2 lines
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    mapLink: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#A0C878',
        textDecoration: 'none',
        marginTop: '0.25rem',
        display: 'inline-block',
    }
};
