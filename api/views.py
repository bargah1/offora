# In api/views.py

from rest_framework import generics
from .models import User
from .serializers import *
from rest_framework import generics, permissions, filters # Add permissions
from .models import Offer # Add Offer
from .permissions import IsVendor
from rest_framework_simplejwt.views import TokenObtainPairView # Add this import
from .serializers import MyTokenObtainPairSerializer # Add this import
from geopy.distance import geodesic
from rest_framework.filters import SearchFilter
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny 
from django.utils import timezone 
from rest_framework.views import APIView
from datetime import timedelta
from rest_framework.response import Response
from rest_framework import status
import razorpay
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    An API endpoint for creating a new user.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [] # Allow any user (even unauthenticated) to access this endpoint.



class OfferListView(generics.ListAPIView):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination

    # --- CORRECT CONFIGURATION ---
    # 1. Ensure both DjangoFilterBackend and SearchFilter are present.
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # 2. Define the fields available for searching.
    search_fields = ['title', 'description', 'store__name']

    # 3. Define the exact fields available for filtering.
    #    This tells Django to allow filtering on the related store's category field.
    #    It will correctly handle requests like /api/offers/?store__category=SALON
    filterset_fields = {
        'store__category': ['exact'],
    }
    # --- END CORRECTION ---

    def get_queryset(self):
        # Your existing queryset logic is fine.
        queryset = Offer.objects.filter(
            is_approved=True, 
            is_active=True, 
            store__is_approved=True
        ).select_related('store')

        store_id = self.request.query_params.get('store')
        if store_id:
            return queryset.filter(store__id=store_id)

        lat_param = self.request.query_params.get('lat')
        lon_param = self.request.query_params.get('lon')

        if lat_param and lon_param:
            try:
                user_location = (float(lat_param), float(lon_param))
                
                nearby_offers_pks = []
                for offer in queryset:
                    if offer.store.latitude and offer.store.longitude:
                        store_location = (offer.store.latitude, offer.store.longitude)
                        if geodesic(user_location, store_location).km <= 10:
                            nearby_offers_pks.append(offer.pk)
                
                return queryset.filter(pk__in=nearby_offers_pks)

            except (ValueError, TypeError):
                return queryset.none()

        return queryset.order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}

class VendorRegistrationView(generics.CreateAPIView):
    """
    An API endpoint for new vendors to register themselves and their store.
    """
    queryset = User.objects.all()
    serializer_class = VendorRegistrationSerializer
    permission_classes = [] # Open to the public

class MyStoreView(generics.RetrieveAPIView):
    """
    An API endpoint for a logged-in vendor to see their own store and offers.
    """
    serializer_class = MyStoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor] # Re-enable permissions

    def get_object(self):
        """
        Override the default method to return the store profile
        linked to the currently authenticated user.
        """
        try:
            return self.request.user.shopowner.storeprofile
        except StoreProfile.DoesNotExist:
            return None
        
class OfferCreateView(generics.CreateAPIView):
    """
    An API endpoint for a logged-in vendor to create a new offer.
    If the vendor has an active subscription, an AI agent will review the offer.
    Otherwise, it will be marked as pending for manual admin approval.
    """
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def perform_create(self, serializer):
        shop_owner = self.request.user.shopowner
        store_profile = shop_owner.storeprofile
        
        # Check for an active subscription
        try:
            subscription = shop_owner.subscription
            is_subscribed = subscription.is_active and subscription.end_date >= timezone.now()
        except Subscription.DoesNotExist:
            is_subscribed = False

        # --- AI AGENT LOGIC ---
        if is_subscribed:
            # If subscribed, the offer is initially marked as pending but with a special status
            # In a real app, you would trigger a background task (like Celery) here.
            # For our simulation, we will call the AI directly.
            # NOTE: This is a simplified simulation. A real implementation would be asynchronous.
            offer_instance = serializer.save(store=store_profile, is_approved=False)
            
            # Here you would call a function to run the AI review
            # self.run_ai_review(offer_instance) 
            # For now, we'll just approve it to simulate the AI working
            offer_instance.is_approved = True 
            offer_instance.save()

        else:
            # If not subscribed, the offer is saved as pending for manual admin review
            serializer.save(store=store_profile, is_approved=False)

class OfferDeleteView(generics.DestroyAPIView):
    """
    An API endpoint for a vendor to delete one of their own offers.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    queryset = Offer.objects.all() # The view finds the object by its ID from this queryset

    def get_queryset(self):
        """
        This is a crucial security step. It ensures that a user can only
        see and delete offers that belong to their own store.
        """
        return Offer.objects.filter(store__owner=self.request.user.shopowner)
class OfferUpdateView(generics.UpdateAPIView):
    """
    An API endpoint for a vendor to update one of their own offers.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OfferSerializer

    def get_queryset(self):
        """
        Ensure a vendor can only update offers that belong to their own store.
        """
        return Offer.objects.filter(store__owner=self.request.user.shopowner)
    
class StoreProfileUpdateView(generics.UpdateAPIView):
    """
    An API endpoint for a vendor to update their own store profile.
    """
    serializer_class = MyStoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get_object(self):
        """ Ensures a vendor can only update their own profile. """
        return self.request.user.shopowner.storeprofile
    
class StoreListView(generics.ListAPIView):
    """
    API endpoint for customers to view and search approved stores.
    Now only shows stores with an active subscription.
    Supports filtering by location and category.
    """
    serializer_class = StoreListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'category']
    
    def get_queryset(self):
        """
        This queryset is now filtered to only include stores that are:
        1. Approved by an admin.
        2. Have an active subscription.
        """
        # --- THIS IS THE FIX ---
        # We filter by the related subscription model's 'is_active' field
        # The field name has been corrected from 'shop_owner' to 'owner'
        queryset = StoreProfile.objects.filter(
            is_approved=True, 
            owner__subscription__is_active=True
        )
        # --- END FIX ---

        lat_param = self.request.query_params.get('lat')
        lon_param = self.request.query_params.get('lon')

        if lat_param and lon_param:
            try:
                user_location = (float(lat_param), float(lon_param))
                
                nearby_shops_pks = []
                for shop in queryset:
                    if shop.latitude and shop.longitude:
                        shop_location = (shop.latitude, shop.longitude)
                        distance = geodesic(user_location, shop_location).km
                        if distance <= 10:
                            nearby_shops_pks.append(shop.pk)
                
                queryset = queryset.filter(pk__in=nearby_shops_pks)
                
            except (ValueError, TypeError):
                return queryset.none()

        return queryset.order_by('name')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class OfferDetailView(generics.RetrieveAPIView):
    queryset = Offer.objects.filter(is_approved=True, is_active=True)
    serializer_class = OfferDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    # This function passes the request object to the serializer,
    # so it knows who the current user is.
    def get_serializer_context(self):
        return {'request': self.request}

class OfferReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewOfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return ReviewOffer.objects.filter(offer_id=self.kwargs['offer_id']).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, offer_id=self.kwargs['offer_id'])


class ShopReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewShopSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return ReviewShop.objects.filter(shop_id=self.kwargs['shop_id']).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, shop_id=self.kwargs['shop_id'])

# class ReviewShopListView(generics.ListCreateAPIView):
#     """
#     API endpoint to list reviews for a specific shop, or to create a new review.
#     """
#     serializer_class = ReviewShopSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         # Filter reviews based on the shop's ID from the URL
#         shop_id = self.kwargs['shop_pk']
#         return ReviewShop.objects.filter(shop_id=shop_id).order_by('-created_at')

#     def perform_create(self, serializer):
#         # When a new review is created, automatically assign it to the correct shop and user
#         shop_id = self.kwargs['shop_pk']
#         shop = StoreProfile.objects.get(pk=shop_id)
        
#         # Prevent a user from reviewing the same shop twice
#         if ReviewShop.objects.filter(shop=shop, user=self.request.user).exists():
#             raise serializers.ValidationError({'detail': 'You have already reviewed this shop.'})

#         serializer.save(user=self.request.user, shop=shop)

class ReviewShopListView(generics.ListCreateAPIView):
    """
    API endpoint to list reviews for a specific shop, or to create a new review.
    """
    serializer_class = ReviewShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
         # Filter reviews based on the shop's ID from the URL
        shop_id = self.kwargs['shop_pk']
        return ReviewShop.objects.filter(shop_id=shop_id).order_by('-created_at')

    def perform_create(self, serializer):
            # When a new review is created, automatically assign it to the correct shop and user
        shop_id = self.kwargs['shop_pk']
        shop = StoreProfile.objects.get(pk=shop_id)
            
            # Prevent a user from reviewing the same shop twice
        if ReviewShop.objects.filter(shop=shop, user=self.request.user).exists():
            raise serializers.ValidationError({'detail': 'You have already reviewed this shop.'})

        serializer.save(user=self.request.user, shop=shop)
class StoreDetailView(generics.RetrieveAPIView):
    queryset = StoreProfile.objects.all()
    serializer_class = StoreProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context



class ReviewShopListView(generics.ListCreateAPIView):
    """
    API endpoint to list reviews for a specific shop, or to create a new review.
    """
    serializer_class = ReviewShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
            # Filter reviews based on the shop's ID from the URL
        shop_id = self.kwargs['shop_pk']
        return ReviewShop.objects.filter(shop_id=shop_id).order_by('-created_at')

    def perform_create(self, serializer):
            # When a new review is created, automatically assign it to the correct shop and user
        shop_id = self.kwargs['shop_pk']
        shop = StoreProfile.objects.get(pk=shop_id)
            
            # Prevent a user from reviewing the same shop twice
        if ReviewShop.objects.filter(shop=shop, user=self.request.user).exists():
            raise serializers.ValidationError({'detail': 'You have already reviewed this shop.'})

        serializer.save(user=self.request.user, shop=shop)


class ReviewOfferListView(generics.ListCreateAPIView):
    """
    API endpoint to list reviews for a specific offer, or to create a new review.
    """
    serializer_class = ReviewOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter reviews based on the offer's ID from the URL
        offer_id = self.kwargs['offer_pk']
        return ReviewOffer.objects.filter(offer_id=offer_id).order_by('-created_at')

    def perform_create(self, serializer):
        # When a new review is created, automatically assign it to the correct offer and user
        offer_id = self.kwargs['offer_pk']
        offer = Offer.objects.get(pk=offer_id)
        
        # Prevent a user from reviewing the same offer twice
        if ReviewOffer.objects.filter(offer=offer, user=self.request.user).exists():
            raise serializers.ValidationError({'detail': 'You have already reviewed this offer.'})

        serializer.save(user=self.request.user, offer=offer)    

class MyShopReviewsListView(generics.ListAPIView):
    """
    API endpoint for a vendor to see all reviews for their own shop.
    """
    serializer_class = ReviewShopSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get_queryset(self):
        # Get the logged-in user's shop and filter reviews for it
        user_shop = self.request.user.shopowner.storeprofile
        return ReviewShop.objects.filter(shop=user_shop).order_by('-created_at')

class MyOfferReviewsListView(generics.ListAPIView):
    """
    API endpoint for a vendor to see all reviews for all of their offers.
    """
    serializer_class = ReviewOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get_queryset(self):
        # Get the logged-in user's shop
        user_shop = self.request.user.shopowner.storeprofile
        # Filter offers that belong to that shop, then filter reviews for those offers
        return ReviewOffer.objects.filter(offer__store=user_shop).order_by('-created_at')

class CreateSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def post(self, request, *args, **kwargs):
        shop_owner = request.user.shopowner
        
        # Initialize Razorpay client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Subscription amount in the smallest currency unit (e.g., 9900 paise = ₹99.00)
        amount = 9900 
        currency = 'INR'
        
        try:
            # Create a Razorpay Order
            razorpay_order = client.order.create(dict(
                amount=amount,
                currency=currency,
                payment_capture='0'
            ))

            # Return the order ID and other necessary details to the frontend
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount,
                'currency': currency,
                'key': settings.RAZORPAY_KEY_ID,
                'name': 'Offora Subscription',
                'description': 'Monthly Subscription for AI-powered offer approvals.',
                'prefill': {
                    'name': request.user.username,
                    'email': request.user.email,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def post(self, request, *args, **kwargs):
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            # Verify the payment signature
            client.utility.verify_payment_signature({
                'razorpay_order_id': request.data['razorpay_order_id'],
                'razorpay_payment_id': request.data['razorpay_payment_id'],
                'razorpay_signature': request.data['razorpay_signature']
            })

            # If verification is successful, activate the subscription
            shop_owner = request.user.shopowner
            subscription, created = Subscription.objects.get_or_create(shop_owner=shop_owner)
            subscription.is_active = True
            subscription.start_date = timezone.now()
            subscription.end_date = timezone.now() + timedelta(days=30)
            subscription.save()

            # --- THIS IS THE FIX ---
            # After activating the subscription, find and approve all pending offers for this shop.
            Offer.objects.filter(store=shop_owner.storeprofile, is_approved=False).update(is_approved=True)
            # --- END FIX ---

            # Return the full, updated store data to the frontend
            # The serializer will now reflect the newly approved offers
            serializer = MyStoreSerializer(shop_owner.storeprofile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': 'Payment verification failed'}, status=status.HTTP_400_BAD_REQUEST)
        
class FavoriteToggleView(APIView):
    """
    Toggles an offer as a favorite for the current user.
    If it's already a favorite, it will be removed. If not, it will be added.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, offer_pk, *args, **kwargs):
        try:
            offer = Offer.objects.get(pk=offer_pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found.'}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=request.user, offer=offer)

        if not created:
            # If the favorite already existed, we delete it (unfavorite)
            favorite.delete()
            return Response({'status': 'unfavorited'}, status=status.HTTP_200_OK)
        
        # If it was just created, it's now a favorite
        return Response({'status': 'favorited'}, status=status.HTTP_201_CREATED)
class FavoriteOffersListView(generics.ListAPIView):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    def get_queryset(self):
        return Offer.objects.filter(favorited_by__user=self.request.user)


class FavoriteShopToggleView(APIView):
    """
    Toggles a shop as a favorite for the current user.
    If it's already a favorite, it will be removed. If not, it will be added.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, shop_pk, *args, **kwargs):
        try:
            shop = StoreProfile.objects.get(pk=shop_pk)
        except StoreProfile.DoesNotExist:
            return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Try to get or create the favorite relationship
        favorite, created = FavoriteShop.objects.get_or_create(user=request.user, shop=shop)

        if not created:
            # If the favorite already existed, delete it (unfavorite)
            favorite.delete()
            return Response({'status': 'unfavorited'}, status=status.HTTP_200_OK)
        
        # If it was just created, it's now a favorite
        return Response({'status': 'favorited'}, status=status.HTTP_201_CREATED)
    
class FavoriteShopsListView(generics.ListAPIView):
    serializer_class = StoreProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    # You might want to add pagination here as well
    # pagination_class = YourPaginationClass

    def get_queryset(self):
        """
        This view returns a list of all the shops
        that the currently authenticated user has favorited.
        """
        user = self.request.user
        # Get the primary keys of the shops the user has favorited
        favorite_shop_pks = FavoriteShop.objects.filter(user=user).values_list('shop__pk', flat=True)
        return StoreProfile.objects.filter(pk__in=favorite_shop_pks)