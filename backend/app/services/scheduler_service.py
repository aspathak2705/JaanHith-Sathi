from datetime import datetime, timedelta

class SchedulerService:
    def __init__(self):
        pass
        
    def schedule_reminder(self, user_id: int, message: str, delay_minutes: int):
        """
        Schedule a reminder to be sent in the future.
        """
        execute_at = datetime.utcnow() + timedelta(minutes=delay_minutes)
        print(f"Scheduled reminder for user {user_id} at {execute_at}: {message}")
        # In a real app, push this task to a Celery queue
        try:
            from app.workers.reminder_worker import send_reminder_task
            if hasattr(send_reminder_task, 'apply_async'):
                send_reminder_task.apply_async(args=[user_id, message], countdown=delay_minutes * 60)
            else:
                send_reminder_task(user_id, message)
        except ImportError:
            print("Failed to import reminder worker.")
