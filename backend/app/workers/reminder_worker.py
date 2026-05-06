try:
    from celery import Celery
    
    # Configure Celery
    celery_app = Celery(
        "reminders",
        broker="redis://localhost:6379/0",
        backend="redis://localhost:6379/0"
    )

    @celery_app.task
    def send_reminder_task(user_id: int, message: str):
        from app.services.notification_service import NotificationService
        
        notifier = NotificationService()
        notifier.send_push_notification(user_id, message)
        return f"Reminder sent to {user_id}"
        
except ImportError:
    # Dummy implementation if Celery is not installed
    def send_reminder_task(user_id: int, message: str):
        from app.services.notification_service import NotificationService
        print(f"Reminder (Dummy Worker): {message} to {user_id}")
        notifier = NotificationService()
        notifier.send_push_notification(user_id, message)
