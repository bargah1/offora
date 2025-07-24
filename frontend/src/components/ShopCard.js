import React from 'react';
import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  const logoUrl = shop.logo || `https://placehold.co/100x100/e2e8f0/475569?text=${shop.name.charAt(0)}`;

  return (
    <Link to={`/shop/${shop.id}`} style={styles.cardLink}>
        <div style={styles.card}>
            <img 
                src={logoUrl} 
                alt={`${shop.name} logo`} 
                style={styles.logo} 
            />
            <div style={styles.info}>
                <h3 style={styles.name}>{shop.name}</h3>
                <p style={styles.category}>{shop.category}</p>
                <div style={styles.rating}>
                    <span>⭐</span>
                    <strong>{typeof shop.rating === 'number' ? parseFloat(shop.rating).toFixed(1) : 'N/A'}</strong>
                    <span style={styles.reviewCount}>({shop.review_count} reviews)</span>
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
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #f1f5f9',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  category: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0.25rem 0',
    textTransform: 'capitalize',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#475569',
  },
  reviewCount: {
    color: '#94a3b8',
  }
};
