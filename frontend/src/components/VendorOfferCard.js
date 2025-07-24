import React, { useState } from 'react';
import Modal from './Modal'; // Assumes Modal.js is in the same components folder

// The card now receives its specific reviews as a prop
export default function VendorOfferCard({ offer, onEdit, onDelete, reviews }) {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false); // New state to toggle review visibility

  const imageUrl = offer.image;

  const handleDeleteConfirm = () => {
    onDelete();
    setDeleteModalOpen(false);
  };

  return (
    <>
      {isDeleteModalOpen && (
        <Modal
          title="Confirm Deletion"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
          confirmText="Delete"
        >
          <p>Are you sure you want to permanently delete the offer: "<strong>{offer.title}</strong>"?</p>
        </Modal>
      )}

      <div style={styles.card}>
        <div style={styles.imageContainer}>
            <img src={imageUrl || `https://placehold.co/400x250/e2e8f0/475569?text=${offer.title}`} alt={offer.title} style={styles.image} />
            <div style={{...styles.statusBadge, backgroundColor: offer.is_approved ? '#10b981' : '#f59e0b'}}>
                {offer.is_approved ? '✓ Approved' : '⏳ Pending'}
            </div>
        </div>
        <div style={styles.content}>
          <h3 style={styles.title}>{offer.title}</h3>
          <p style={styles.desc}>{offer.description}</p>
          <p style={styles.price}>
            {offer.original_price && <s>₹{offer.original_price}</s>}{' '}
            {offer.discounted_price && <b>₹{offer.discounted_price}</b>}
            {offer.discount_percentage && ` (${offer.discount_percentage}% off)`}
          </p>
          <div style={styles.actions}>
            <button onClick={onEdit} style={styles.btnEdit}>Edit</button>
            <button onClick={() => setDeleteModalOpen(true)} style={styles.btnDelete}>Delete</button>
            {/* New button to show reviews */}
            <button onClick={() => setShowReviews(!showReviews)} style={styles.btnReviews}>
              {showReviews ? 'Hide' : 'Show'} Reviews ({reviews.length})
            </button>
          </div>

          {/* Conditionally rendered review list */}
          {showReviews && (
            <div style={styles.reviewSection}>
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} style={styles.reviewItem}>
                    <strong>{review.user_username}</strong> - {'⭐'.repeat(review.rating)}
                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p style={{textAlign: 'center', color: '#64748b'}}>No reviews for this offer yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '1rem',
    background: '#fff',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  imageContainer: { position: 'relative', paddingTop: '62.5%' },
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  statusBadge: { position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: 'white', fontSize: '0.75rem', fontWeight: '700' },
  content: { padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '700' },
  desc: { fontSize: '0.875rem', color: '#475569', flexGrow: 1, marginBottom: '1rem' },
  price: { color: '#16a34a', fontSize: '1rem', margin: '0 0 1rem 0' },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9'
  },
  btn: {
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  btnEdit: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  btnDelete: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  btnReviews: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    marginLeft: 'auto'
  },
  reviewSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  reviewItem: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    marginBottom: '0.5rem'
  },
  reviewComment: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#374151'
  }
};
