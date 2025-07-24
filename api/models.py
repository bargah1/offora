# In api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission # Import Group and Permission

class User(AbstractUser):
    # Add related_name to resolve the clash
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="api_user_groups",  # <--- ADD THIS
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="api_user_permissions", # <--- AND THIS
        related_query_name="user",
    )

    # Your custom fields
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_vendor = models.BooleanField(default=False) 
class ShopOwner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    # Additional owner-specific details can go here

class StoreProfile(models.Model):
    class StoreCategory(models.TextChoices):
        FOOD = 'FOOD', 'Food & Dining'
        GROCERY = 'GROCERY', 'Grocery'
        FASHION = 'FASHION', 'Fashion & Apparel'
        SALON = 'SALON', 'Salon & Spa'
        OTHER = 'OTHER', 'Other'

    owner = models.OneToOneField(ShopOwner, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=StoreCategory.choices, default=StoreCategory.OTHER)
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True) # For Admin Approval
    logo = models.ImageField(upload_to='shop_logos/', null=True, blank=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    def __str__(self):
        return self.name

class Offer(models.Model):
    store = models.ForeignKey(StoreProfile, on_delete=models.CASCADE, related_name='offers')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # --- NEW FIELDS ---
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Renamed from 'price'
    discount_percentage = models.IntegerField(null=True, blank=True)
    image = models.ImageField(upload_to='offers_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_premium_listing = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
class ReviewOffer(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='offer_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review for Offer {self.offer_id} by {self.user.username}'
    
class ReviewShop(models.Model):
    shop = models.ForeignKey(StoreProfile, on_delete=models.CASCADE, related_name='shop_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review for Shop {self.shop_id} by {self.user.username}'

class Subscription(models.Model):
    shop_owner = models.OneToOneField(ShopOwner, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Subscription for {self.shop_owner.user.username}"
    
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A user can only favorite a specific offer once
        unique_together = ('user', 'offer')

    def __str__(self):
        return f'{self.user.username} favorited {self.offer.title}'
    
class FavoriteShop(models.Model):
    """ Model to represent a user's favorite shop. """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_shops')
    shop = models.ForeignKey(StoreProfile, on_delete=models.CASCADE, related_name='favorited_by_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only favorite a specific shop once
        unique_together = ('user', 'shop')

    def __str__(self):
        return f'{self.user.username} favorited {self.shop.name}'