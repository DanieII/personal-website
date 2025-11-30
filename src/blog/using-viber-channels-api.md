---
title: "Using Viber Channels API"
publicationDate: 2025-11-30
description: "Viber Channels provide a powerful way to send messages to your audience. In this post, we'll integrate the Viber Channels API with Django to automatically post content to your channel."
tags: ["python", "django"]
---

## Get Your Viber Authentication Token

To get your authentication token, follow the official Viber documentation: [Viber Channels Post API Prerequisites](https://developers.viber.com/docs/tools/channels-post-api/#prerequisites)

## Store the Token

Add a field to store the Viber token in a model of your choice:

```python
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    viber_token = models.CharField(max_length=255, blank=True, null=True)
```

## Set Up Webhook

Send a request to set up the webhook with a valid URL when the token is updated:

```python
import requests
from rest_framework import serializers

class UserProfileSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        viber_token = validated_data.get("viber_token")
        if viber_token:
            webhook_url = "https://example.com/viber/webhook/"
            response = requests.post(
                "https://chatapi.viber.com/pa/set_webhook",
                headers={"Content-Type": "application/json"},
                json={"url": webhook_url, "auth_token": viber_token},
            )
            
            if response.status_code != 200 or response.json().get("status") != 0:
                raise serializers.ValidationError("Invalid Viber token")
        
        return super().update(instance, validated_data)
```

## Send Messages

Now that we have the token stored and webhook configured, we can send messages to the channel. Here's a complete implementation:

```python
import requests
from rest_framework.response import Response

def share_to_viber(user, message):
    viber_token = getattr(user.profile, "viber_token", None)
    if not viber_token:
        return Response({"error": "Viber token not set."}, status=400)
    
    try:
        account_response = requests.post(
            "https://chatapi.viber.com/pa/get_account_info",
            headers={"Content-Type": "application/json"},
            json={"auth_token": viber_token},
        )
        account_response.raise_for_status()
        account_data = account_response.json()
        
        if account_data.get("status") != 0:
            return Response(
                {"error": "Failed to retrieve account information"}, status=400
            )

        member_id = account_data.get("members")[0].get("id")
        chat_name = account_data.get("name")

        message_response = requests.post(
            "https://chatapi.viber.com/pa/post",
            headers={"Content-Type": "application/json"},
            json={
                "auth_token": viber_token,
                "from": member_id,
                "type": "text",
                "text": message,
            },
        )
        message_response.raise_for_status()
        message_data = message_response.json()

        if message_data.get("status") != 0:
            return Response(
                {"error": "Failed to send message to Viber"}, status=400
            )

        return Response({"message": f"Message sent successfully to: {chat_name}"})
    
    except requests.RequestException:
        return Response({"error": "Failed to connect to Viber"}, status=400)
```

## Conclusion

Integrating Viber Channels API with Django is straightforward once you understand the basic flow: store the auth token securely, validate it by setting up a webhook, and use it to post messages through the API. This setup allows you to automate your messaging.
