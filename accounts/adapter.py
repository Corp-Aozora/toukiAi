
from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        from toukiApp.company_data import CompanyData
        context["email"] = email
        context['company_data'] = CompanyData
        return super(CustomAccountAdapter, self).send_mail(template_prefix, email, context)
    
    def add_message(self, request, level, message_template,
                message_context=None, extra_tags=''):
        # allauthのデフォルトのメッセージを追加しないようにする
        pass