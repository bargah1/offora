import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ShopCard from '../components/ShopCard';
import OfferCard from '../components/OfferCard';
import API_URL from '../apiConfig';
// Helper components for icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SlidersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>;
const HeartIcon = ({ fill = 'none', stroke = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;


export default function HomePage() {
    const { user, authTokens, logoutUser } = useContext(AuthContext);
    const [offers, setOffers] = useState([]);
    const [shops, setShops] = useState([]);
    const [favoriteShops, setFavoriteShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("offers");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [favoriteOfferIds, setFavoriteOfferIds] = useState(new Set());

    const categories = [
        { value: 'All', label: 'All' },
        { value: 'FOOD', label: 'Food & Dining' },
        { value: 'GROCERY', label: 'Grocery' },
        { value: 'FASHION', label: 'Fashion & Apparel' },
        { value: 'SALON', label: 'Salon & Spa' },
        { value: 'OTHER', label: 'Other' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (!authTokens) return;
            setLoading(true);
            setOffers([]);
            setShops([]);
            setFavoriteShops([]);

            const headers = { Authorization: `Bearer ${authTokens.access}` };

            if (activeTab === 'favorites') {
                try {
                    const [favOffersRes, favShopsRes] = await Promise.all([
                        axios.get(`${API_URL}/api/favorites/`, { headers }),
                        axios.get(`${API_URL}/api/favorite-shops/`, { headers })
                    ]);
                    setOffers(favOffersRes.data.results || favOffersRes.data || []);
                    setFavoriteShops(favShopsRes.data.results || favShopsRes.data || []);
                } catch (err) {
                    console.error("Failed to fetch favorites", err);
                } finally {
                    setLoading(false);
                }
            } else {
                let url = activeTab === 'shops' ? `${API_URL}/api/stores/`: `${API_URL}/api/offers/`;
                const params = { search: searchQuery };
                if (selectedCategory !== "All") {
                    if (activeTab === 'shops') {
                        params.category = selectedCategory;
                    } else {
                        params.store__category = selectedCategory;
                    }
                }
                if (isLocationEnabled && navigator.geolocation) {
                    try {
                        const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
                        params.lat = position.coords.latitude;
                        params.lon = position.coords.longitude;
                    } catch (error) {
                        console.error("Could not get location");
                        setIsLocationEnabled(false);
                    }
                }

                try {
                    const response = await axios.get(url, { headers, params });
                    const results = response.data.results || response.data;
                    if (activeTab === 'shops') {
                        setShops(results);
                    } else {
                        setOffers(results);
                        const favIds = new Set(results.filter(o => o.is_favorited).map(o => o.id));
                        setFavoriteOfferIds(favIds);
                    }
                } catch (err) {
                    console.error(`Failed to fetch ${activeTab}`, err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [activeTab, searchQuery, isLocationEnabled, selectedCategory, authTokens]);

    const handleFavoriteToggle = async (offerId, shouldFavorite) => {
        try {
            await axios.post(`${API_URL}/api/offers/${offerId}/favorite/`, {}, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setFavoriteOfferIds(prev => {
                const newFavs = new Set(prev);
                if (shouldFavorite) newFavs.add(offerId);
                else newFavs.delete(offerId);
                return newFavs;
            });
            if (activeTab === 'favorites' && !shouldFavorite) {
                setOffers(prev => prev.filter(o => o.id !== offerId));
            }
        } catch (err) {
            console.error("Failed to update favorite status", err);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;
        }

        if (activeTab === 'offers') {
            if (!offers || offers.length === 0) return <p style={{ textAlign: 'center', padding: '2rem' }}>No offers found.</p>;
            return <div style={styles.contentGrid}>{offers.map((offer) => <OfferCard key={offer.id} offer={offer} onFavoriteToggle={handleFavoriteToggle} isFavorited={favoriteOfferIds.has(offer.id)} />)}</div>;
        }
        
        if (activeTab === 'shops') {
            if (!shops || shops.length === 0) return <p style={{ textAlign: 'center', padding: '2rem' }}>No shops found.</p>;
            return <div style={styles.contentGrid}>{shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}</div>;
        }
        
        if (activeTab === 'favorites') {
            const favoriteOffers = offers;
            if (favoriteOffers.length === 0 && favoriteShops.length === 0) {
                return <p style={{ textAlign: 'center', padding: '2rem' }}>You have no favorite items yet.</p>;
            }
            return (
                <div style={{width: '100%'}}>
                    {favoriteShops.length > 0 && (
                        <>
                            <h2 style={styles.sectionTitle}>Favorite Shops</h2>
                            <div style={styles.contentGrid}>
                                {favoriteShops.map(shop => <ShopCard key={`fav-shop-${shop.id}`} shop={shop} />)}
                            </div>
                        </>
                    )}
                    {favoriteOffers.length > 0 && (
                         <>
                            <h2 style={{...styles.sectionTitle, marginTop: favoriteShops.length > 0 ? '2.5rem' : '0' }}>Favorite Offers</h2>
                             <div style={styles.contentGrid}>
                                {favoriteOffers.map(offer => <OfferCard key={`fav-offer-${offer.id}`} offer={offer} onFavoriteToggle={handleFavoriteToggle} isFavorited={true} />)}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div style={styles.pageWrapper}>
          <header style={styles.header}>
              <div style={styles.headerContent}>
                  <h1 style={styles.logoText}>Offora</h1>
                  <div>
                      <button onClick={logoutUser} style={styles.logoutButton}>Logout</button>
                  </div>
              </div>
          </header>

          <section style={styles.searchSection}>
              <div style={{...styles.container, padding: '1.5rem 1rem'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                      <h2 style={styles.heroTitle}>Discover Amazing Deals Near You</h2>
                      <div style={{position: 'relative', maxWidth: '48rem', margin: '0 auto', width: '100%'}}>
                          <div style={{position: 'relative'}}>
                              <span style={styles.searchIcon}><SearchIcon /></span>
                              <input
                                  type="text"
                                  placeholder="Search for offers, shops, or categories..."
                                  style={styles.searchInput}
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              <button onClick={() => setShowFilters(!showFilters)} style={styles.filterIcon}>
                                  <SlidersIcon />
                              </button>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.75rem', padding: '0 0.5rem'}}>
                              <button onClick={() => setIsLocationEnabled(!isLocationEnabled)} style={isLocationEnabled ? styles.locationButtonActive : styles.locationButton}>
                                  <MapPinIcon />
                                  {isLocationEnabled ? "Near Me Enabled" : "Enable Location"}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {showFilters && (
              <div style={styles.filterBar}>
                <div style={{...styles.container, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto'}}>
                    {categories.map((category) => (
                        <button 
                            key={category.value} 
                            onClick={() => setSelectedCategory(category.value)}
                            style={selectedCategory === category.value ? styles.activeCategoryButton : styles.categoryButton}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
              </div>
          )}

          <main style={styles.container}>
              <div style={styles.tabsContainer}>
                  <button onClick={() => setActiveTab('offers')} style={activeTab === 'offers' ? styles.activeTab : styles.tab}>Offers</button>
                  <button onClick={() => setActiveTab('shops')} style={activeTab === 'shops' ? styles.activeTab : styles.tab}>Shops</button>
                  <button onClick={() => setActiveTab('favorites')} style={activeTab === 'favorites' ? styles.activeTab : styles.tab}>
                      <HeartIcon fill={activeTab === 'favorites' ? '#A0C878' : 'none'} /> Favorites
                  </button>
              </div>

              <div style={{display: 'flex', justifyContent: 'center'}}>
                  {renderContent()}
              </div>
          </main>
        </div>
    );
}

const styles = {
    pageWrapper: { minHeight: '100vh', backgroundColor: '#FFFDF6' },
    header: { position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255, 253, 246, 0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logoText: { fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', color: '#A0C878' },
    logoutButton: { backgroundColor: '#A0C878', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: '600' },
    searchSection: { backgroundColor: '#FAF6E9', padding: '1.5rem 0' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' },
    heroTitle: { fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Poppins, sans-serif', textAlign: 'center', color: '#374151' },
    searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
    filterIcon: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' },
    searchInput: { width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '9999px', border: '1px solid #DDEB9D', backgroundColor: 'white', fontSize: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    locationButton: { display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #A0C878', color: '#A0C878', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.2s' },
    locationButtonActive: { display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #A0C878', color: 'white', backgroundColor: '#A0C878', cursor: 'pointer', transition: 'all 0.2s' },
    filterBar: { backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' },
    categoryButton: { padding: '0.5rem 1rem', border: '1px solid #DDEB9D', borderRadius: '9999px', backgroundColor: 'white', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' },
    activeCategoryButton: { padding: '0.5rem 1rem', border: '1px solid #A0C878', borderRadius: '9999px', backgroundColor: '#DDEB9D', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', color: '#374151', transition: 'all 0.2s' },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        fontFamily: 'Poppins, sans-serif',
        color: '#374151',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #f3f4f6'
    },
    tabsContainer: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' },
    tab: { padding: '0.5rem 1rem', border: 'none', backgroundColor: '#FAF6E9', borderRadius: '9999px', cursor: 'pointer', fontSize: '1rem', color: '#374151', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' },
    activeTab: { padding: '0.5rem 1rem', border: 'none', backgroundColor: '#DDEB9D', borderRadius: '9999px', cursor: 'pointer', fontSize: '1rem', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s' },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', width: '100%' },
};
