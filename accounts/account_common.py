from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from toukiApp.company_data import *
    
class EmailSender:
    
    @staticmethod
    def send_email(user, subject_template, message_template, context=None):
        """メッセージテンプレートとコンテキストを基にメールを送信する"""
        
        if context is None:
            context = {}
            
        context.update({
            "user_email": user.email,
            "company_data": CompanyData,
        })
        
        subject = render_to_string(subject_template, context).strip()
        message = render_to_string(message_template, context).strip()
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )