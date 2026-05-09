from app.models.notification_event import NotificationEvent


def create_notification_event(
    db,
    *,
    user_id: int,
    event_key: str,
    type: str,
    title: str,
    message: str,
    action_text: str | None = None,
    target_path: str = "/notifications",
    icon: str = "notifications",
    color: str = "primary",
    is_urgent: bool = False,
    replace_existing: bool = False,
):
    if replace_existing:
        (
            db.query(NotificationEvent)
            .filter(
                NotificationEvent.user_id == user_id,
                NotificationEvent.event_key == event_key,
            )
            .delete()
        )

    notification = NotificationEvent(
        user_id=user_id,
        event_key=event_key,
        type=type,
        title=title,
        message=message,
        action_text=action_text,
        target_path=target_path,
        icon=icon,
        color=color,
        is_urgent=is_urgent,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
