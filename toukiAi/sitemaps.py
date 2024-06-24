from datetime import datetime
from django.conf import settings
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

import os

from toukiApp.toukiAi_commons import *

class StaticViewSitemap(Sitemap):

    # URLごとの優先順位を定義
    priorities = {
        'toukiApp:index': 1.0,
        'toukiApp:administrator': 0.5,
        'toukiApp:commerce_law': 0.5,
        'toukiApp:privacy': 0.5,
        'toukiApp:terms': 0.5,
        'toukiApp:useful_info_links': 0.7,
        # 'toukiApp:condition': 0.6,
        'accounts:signup': 0.6,
        'accounts:account_reset_password': 0.5,
        'account_login': 0.6,
    }
    
    # URLごとの更新頻度を定義
    changefreqs = {
        'toukiApp:index': 'weekly',
        'toukiApp:administrator': 'monthly',
        'toukiApp:commerce_law': 'monthly',
        'toukiApp:privacy': 'monthly',
        'toukiApp:terms': 'monthly',
        'toukiApp:useful_info_links': 'weekly',
        # 'toukiApp:condition': 'monthly',
        'accounts:signup': 'monthly',
        'accounts:account_reset_password': 'monthly',
        'account_login': 'monthly',
    }
    
    # URLとテンプレートファイルパスのマッピング
    templates = {
        'toukiApp:index': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'index.html'),
        'toukiApp:administrator': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'administrator.html'),
        'toukiApp:commerce_law': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'commerce_law.html'),
        'toukiApp:privacy': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'privacy.html'),
        'toukiApp:terms': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'terms.html'),
        'toukiApp:useful_info_links': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'useful_info', 'useful_info_links.html'),
        # 'toukiApp:condition': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'toukiApp', 'condition.html'),
        'accounts:signup': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'account', 'signup.html'),
        'accounts:account_reset_password': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'account', 'password_reset.html'),
        'account_login': os.path.join(settings.BASE_DIR, 'toukiAi', 'templates', 'account', 'login.html'),
    }
    
    def items(self):
        return [
            'toukiApp:index',
            'toukiApp:administrator',
            'toukiApp:commerce_law',
            'toukiApp:privacy',
            'toukiApp:terms',
            'toukiApp:useful_info_links',
            # 'toukiApp:condition',
            'accounts:signup',
            'accounts:account_reset_password',
            'account_login',  # allauth のログインページ
        ]

    def location(self, item):
        return reverse(item)
    
    def priority(self, item):
        return self.priorities.get(item, 0.5)  # デフォルトの優先順位0.5を指定
    
    def changefreq(self, item):
        return self.changefreqs.get(item, 'weekly')
    
    def lastmod(self, item):
        
        path = self.templates.get(item)
        if path and os.path.exists(path):
            return datetime.fromtimestamp(os.path.getmtime(path))
        
        basic_log(get_current_function_name, None, None, f"サイトマップにテンプレートが存在しないパスがあります\nitem={item}\npath={path}")    
        raise Exception(f"テンプレートファイルが見つかりません: path={path}")
    
class UsefulInfoSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.8

    def items(self):
        return [
            'about_inheritance', 
            'check_legal_heirs', 
            'refuse_inheritance', 
            'about_inheritance_touki',
            'if_late',
            'postpone_inheritance_touki',
            'about_family_card',
            'is_match_decedent_and_owner',
        ]  # 動的URL用のパラメータ

    def location(self, item):
        return reverse('toukiApp:useful_info', args=[item])  # 動的URLの生成