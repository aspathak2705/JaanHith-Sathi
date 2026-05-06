class NotificationService:
    def __init__(self):
        pass
        
    def send_email(self, to_email: str, subject: str, body: str):
        """
        Send an email notification.
        """
        print(f"Sending email to {to_email}: {subject}")
        # In a real app, integrate with SendGrid, SES, etc.
        
    def send_push_notification(self, user_id: int, message: str):
        """
        Send a push notification to a user.
        """
        print(f"Sending push notification to user {user_id}: {message}")
        # In a real app, integrate with Firebase Cloud Messaging (FCM)
