const Notification = require('../models/Notification');

/**
 * Decoupled Notification Service Layer
 * Dispatches notifications across multiple channels (In-App, Email, SMS) without coupling controllers.
 */
class NotificationService {
  /**
   * Send notification to a specific user
   */
  async sendNotification({ userId, type, title, message, link, metadata = {} }) {
    try {
      // 1. Create In-App Notification record
      const inAppNotif = await Notification.create({
        user: userId,
        type,
        title,
        message,
        link,
        metadata,
      });

      // 2. Email Notification Dispatch (Placeholder / Nodemailer integration point)
      this.sendEmailNotification({ userId, title, message, metadata }).catch((err) =>
        console.error('Email dispatch error:', err.message)
      );

      // 3. SMS / Push Notification Dispatch Placeholder
      this.sendSMSNotification({ userId, message }).catch((err) =>
        console.error('SMS dispatch error:', err.message)
      );

      return inAppNotif;
    } catch (error) {
      console.error('NotificationService error:', error.message);
    }
  }

  /**
   * Send notification to all registered users (Broadcast)
   */
  async broadcastNotification({ type, title, message, link }) {
    try {
      const User = require('../models/User');
      const users = await User.find({}).select('_id');

      const notifDocs = users.map((u) => ({
        user: u._id,
        type,
        title,
        message,
        link,
      }));

      await Notification.insertMany(notifDocs);
    } catch (error) {
      console.error('NotificationService broadcast error:', error.message);
    }
  }

  // Placeholder for Email Service
  async sendEmailNotification({ userId, title, message, metadata }) {
    // In production, integrate Nodemailer or SendGrid here
    console.log(`[EMAIL DISPATCH LOG] To User: ${userId} | Subject: ${title} | Body: ${message}`);
  }

  // Placeholder for SMS / Push Service
  async sendSMSNotification({ userId, message }) {
    // In production, integrate Twilio or Fast2SMS here
    console.log(`[SMS DISPATCH LOG] To User: ${userId} | Message: ${message}`);
  }
}

module.exports = new NotificationService();
