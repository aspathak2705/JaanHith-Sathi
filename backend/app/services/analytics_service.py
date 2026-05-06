from sqlalchemy.orm import Session
from app.models.analytics import AnalyticsLog
from datetime import datetime

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        
    def log_action(self, user_id: int, action: str, metadata: dict = None):
        """
        Log a user action for analytics.
        """
        log = AnalyticsLog(
            user_id=user_id,
            action=action,
            metadata_data=metadata,
            timestamp=datetime.utcnow()
        )
        self.db.add(log)
        self.db.commit()
        
    def get_user_insights(self, user_id: int):
        """
        Aggregate user interactions to generate insights.
        """
        logs = self.db.query(AnalyticsLog).filter(AnalyticsLog.user_id == user_id).all()
        
        try:
            import pandas as pd
            df = pd.DataFrame([{"action": log.action, "time": log.timestamp} for log in logs])
            if not df.empty:
                action_counts = df['action'].value_counts().to_dict()
                return {"total_actions": len(df), "action_counts": action_counts}
        except ImportError:
            pass
            
        return {"total_actions": len(logs), "logs_count": len(logs)}
