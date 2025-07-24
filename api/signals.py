from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ReviewShop, StoreProfile
from django.db.models import Avg, Count

@receiver([post_save, post_delete], sender=ReviewShop)
def update_shop_rating(sender, instance, **kwargs):
    shop = instance.shop
    stats = ReviewShop.objects.filter(shop=shop).aggregate(
        average=Avg('rating'),
        total=Count('id')
    )
    shop.rating = round(stats['average'] or 0, 2)
    shop.review_count = stats['total'] or 0
    shop.save()
