# Google Play Data Safety Declaration

This document outlines the data collection and usage practices for the Health & BMI Tracker app to comply with Google Play's Data Safety requirements.

## Data Collection Overview

### Personal Information
- **Email Address**: Collected for user authentication and account management
- **Name** (Optional): Collected for personalized experience
- **Purpose**: Account creation, authentication, app personalization
- **Sharing**: Not shared with third parties
- **Encryption**: Encrypted in transit and at rest

### Health and Fitness Data
- **BMI Measurements**: Weight, height, body fat percentage, BMI calculations
- **Nutrition Logs**: Food intake, calories, macronutrients (protein, carbs, fat)
- **Health Goals**: Fitness objectives, activity levels, dietary preferences
- **Health Milestones**: Achievement tracking and progress data
- **Purpose**: Health tracking, progress monitoring, personalized recommendations
- **Sharing**: Not shared with third parties
- **Encryption**: Encrypted in transit and at rest

### App Activity Data
- **User Preferences**: Language settings, notification preferences, theme choices
- **App Usage Analytics**: Feature usage patterns (anonymous)
- **Purpose**: App improvement, personalized experience
- **Sharing**: Aggregated anonymous data only
- **Encryption**: Encrypted in transit and at rest

## Data Security Measures

### Encryption
- **In Transit**: All data transmitted using HTTPS/TLS encryption
- **At Rest**: All data stored with industry-standard encryption via Supabase

### Access Controls
- **User Data Isolation**: Row Level Security (RLS) policies ensure users can only access their own data
- **Authentication**: Multi-factor authentication (MFA) support available
- **Session Management**: Secure session handling with automatic token refresh

### Data Retention
- **User Control**: Users can delete their account and all associated data at any time
- **Complete Deletion**: Account deletion removes all personal data from our servers
- **No Backup Retention**: Deleted data is not retained in backups after deletion

## Third-Party Services

### Supabase (Database & Authentication)
- **Data Processed**: All user data for storage and authentication
- **Security**: SOC 2 Type II certified, GDPR compliant
- **Location**: Data stored in secure cloud infrastructure
- **Purpose**: Backend infrastructure and data storage

### Resend (Optional Email Service)
- **Data Processed**: Email addresses for transactional emails only
- **Purpose**: Account verification, password resets, important notifications
- **Retention**: Minimal retention, used only for delivery

## User Rights and Controls

### Data Access
- Users can view all their data within the app
- Export functionality available for personal data portability

### Data Deletion
- Complete account deletion available in app settings
- All user data permanently deleted within 30 days
- No data retention after account deletion

### Data Correction
- Users can modify all personal information and health data
- Real-time updates reflected immediately

## Compliance

This app complies with:
- Google Play Developer Policy
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Health Insurance Portability and Accountability Act (HIPAA) privacy principles

## Contact

For data privacy questions or to exercise your rights:
- In-app account deletion feature
- Data export available through app interface

## Last Updated
This data safety declaration was last updated on [DATE] and reflects the current version of the Health & BMI Tracker app.