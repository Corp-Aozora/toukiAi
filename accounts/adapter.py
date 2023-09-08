# from allauth.account.adapter import DefaultAccountAdapter

# class AccountAdapter(DefaultAccountAdapter):
#     def save_user(self, request, user, form, commit):
#         user = super().save_user(request, user, form, commit=False)
#         user.agreement = form.cleaned_data.get("agreement")
#         user.username = form.cleaned_data.get("username")
#         user.phone_number = form.cleaned_data.get("phone_number")
#         user.save()
