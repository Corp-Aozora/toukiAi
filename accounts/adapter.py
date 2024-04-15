
from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        from toukiApp.company_data import CompanyData
        context["email"] = email
        context['company_data'] = CompanyData
        return super(CustomAccountAdapter, self).send_mail(template_prefix, email, context)