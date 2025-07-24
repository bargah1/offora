# In api/urls.py

from django.urls import path
from .views import *

# Import the SimpleJWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('offers/', OfferListView.as_view(), name='offer-list'),
    path('vendor/register/', VendorRegistrationView.as_view(), name='vendor-registration'),
    path('vendor/my-store/', MyStoreView.as_view(), name='my-store'),
    path('vendor/offers/create/',OfferCreateView.as_view(), name='offer-create'),
    path('vendor/offers/<int:pk>/delete/', OfferDeleteView.as_view(), name='offer-delete'),
    path('vendor/offers/<int:pk>/update/', OfferUpdateView.as_view(), name='offer-update'),
    path('vendor/my-store/update/', StoreProfileUpdateView.as_view(), name='my-store-update'),
    path('stores/', StoreListView.as_view(), name='store-list'),
    path('offers/<int:pk>/', OfferDetailView.as_view(), name='offer-detail'),
    path('offers/<int:offer_id>/reviews/', OfferReviewListCreateView.as_view(), name='offer-review-list'),
    path('stores/<int:shop_pk>/reviews/', ReviewShopListView.as_view(), name='shop-review-list'),
    path('stores/<int:pk>/', StoreDetailView.as_view(), name='store-detail'),
    path('offers/<int:offer_pk>/reviews/', ReviewOfferListView.as_view(), name='offer-review-list'),
    path('vendor/shop-reviews/', MyShopReviewsListView.as_view(), name='vendor-shop-reviews'),
    path('vendor/offer-reviews/', MyOfferReviewsListView.as_view(), name='vendor-offer-reviews'),
    path('vendor/subscription/create/', CreateSubscriptionView.as_view(), name='create-subscription'),
    path('vendor/subscription/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('offers/<int:offer_pk>/favorite/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('favorites/', FavoriteOffersListView.as_view(), name='favorite-offer-list'),
    path('stores/<int:shop_pk>/favorite/', FavoriteShopToggleView.as_view(), name='favorite-shop-toggle'),
    path('favorite-shops/', FavoriteShopsListView.as_view(), name='favorite-shops-list'),
]   