# In api/serializers.py

from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # Add this import

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token
        token['username'] = user.username
        token['is_vendor'] = user.is_vendor
        
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(    
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class OfferSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_address = serializers.CharField(source='store.address', read_only=True)
    store_logo = serializers.ImageField(source='store.logo', read_only=True)
    store_rating = serializers.FloatField(source='store.rating', read_only=True)
    store_review_count = serializers.IntegerField(source='store.review_count', read_only=True)
    latitude = serializers.FloatField(source='store.latitude', read_only=True)
    longitude = serializers.FloatField(source='store.longitude', read_only=True)
    store_phone_number = serializers.CharField(source='store.phone_number', read_only=True)
    is_favorited = serializers.SerializerMethodField()
    class Meta:
        model = Offer
        fields = [
            'id',
            'title',
            'description',
            'original_price',
            'discounted_price',
            'discount_percentage',
            'image',
            'start_time',
            'end_time',
            'store',  # FK
            'store_name',
            'store_address',
            'store_logo',
            'store_rating',
            'store_review_count',
            'latitude',
            'longitude',
            'is_approved',
            'store_phone_number',
            'is_favorited'
        ]
        read_only_fields = ['store']
    def get_is_favorited(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return Favorite.objects.filter(offer=obj, user=user).exists()
        return False
class ReviewShopSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ReviewShop
        fields = ['id', 'user_username', 'rating', 'comment', 'created_at']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['is_active', 'start_date', 'end_date']
        
class MyStoreSerializer(serializers.ModelSerializer):
    offers = OfferSerializer(many=True, read_only=True)
    # --- THE FIX IS HERE ---
    # We need to tell the serializer to get the subscription from the store's owner.
    subscription = SubscriptionSerializer(source='owner.subscription', read_only=True)

    class Meta:
        model = StoreProfile
        fields = [
            'id', 'name', 'category', 'address', 'latitude', 'longitude', 
            'phone_number', 'is_approved', 'offers', 'logo', 'rating', 
            'review_count', 'subscription' # <-- Add subscription
        ]



class StoreProfileSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = StoreProfile
        fields = [
            'id', 
            'name', 
            'category', 
            'get_category_display',
            'rating', 
            'review_count',
            'logo',
            'address',
            'phone_number',
            'is_favorited',
        ]

    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return FavoriteShop.objects.filter(shop=obj, user=user).exists()
        return False

    
class VendorRegistrationSerializer(serializers.ModelSerializer):
    store = StoreProfileSerializer(required=True, write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'store']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        store_data = validated_data.pop('store')
        
        # Create User with is_vendor=True
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_vendor=True # Set user as a vendor automatically
        )

        # Create the ShopOwner profile
        shop_owner = ShopOwner.objects.create(user=user)

        # Create the StoreProfile, leaving is_approved=False by default for admin review
        StoreProfile.objects.create(
            owner=shop_owner,
            **store_data
        )
        
        return user
class StoreListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreProfile
        fields = [
            'id', 'name', 'category', 'address', 'logo', 
            'rating', 'review_count','phone_number','latitude',
            'longitude'
        ]


class ReviewOfferSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True) # <-- Add this

    class Meta:
        model = ReviewOffer
        fields = ['id', 'user_username', 'rating', 'comment', 'created_at', 'offer_title'] # <-- Add offer_title

class OfferDetailSerializer(serializers.ModelSerializer):
    """
    This serializer provides all the detailed information for a single offer,
    including related data from its store.
    """
    # --- Fields from the related StoreProfile model ---
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_address = serializers.CharField(source='store.address', read_only=True)
    store_logo = serializers.ImageField(source='store.logo', read_only=True)
    # --- THE FIX IS HERE: Changed DecimalField to FloatField ---
    store_rating = serializers.FloatField(source='store.rating', read_only=True)
    store_review_count = serializers.IntegerField(source='store.review_count', read_only=True)
    latitude = serializers.FloatField(source='store.latitude', read_only=True)
    longitude = serializers.FloatField(source='store.longitude', read_only=True)
    store_phone_number = serializers.CharField(source='store.phone_number', read_only=True)

    # --- Custom field to check favorite status ---
    # This field will be a boolean (true/false) indicating if the current user
    # has favorited this specific offer.
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id',
            'title',
            'description',
            'original_price',
            'discounted_price',
            'discount_percentage',
            'image',
            'start_time',
            'end_time',
            'store',  # The foreign key ID to the store
            'store_name',
            'store_address',
            'store_logo',
            'store_rating',
            'store_review_count',
            'latitude',
            'longitude',
            'store_phone_number',
            'is_approved',
            'is_favorited', # The custom boolean field
        ]
        read_only_fields = ['store']

    def get_is_favorited(self, obj):
        """
        This method is called automatically by the SerializerMethodField.
        It checks if a Favorite object exists for the current offer and user.
        """
        # Get the user from the request context, which is passed from the view.
        user = self.context['request'].user
        if user.is_authenticated:
            return Favorite.objects.filter(offer=obj, user=user).exists()
        return False