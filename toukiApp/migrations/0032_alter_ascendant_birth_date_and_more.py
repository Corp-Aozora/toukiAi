# Generated by Django 4.2.5 on 2024-02-08 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toukiApp', '0031_remove_decedent_type_of_division_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ascendant',
            name='birth_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='誕生日'),
        ),
        migrations.AlterField(
            model_name='ascendant',
            name='death_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='死亡日'),
        ),
        migrations.AlterField(
            model_name='collateral',
            name='birth_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='誕生日'),
        ),
        migrations.AlterField(
            model_name='collateral',
            name='death_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='死亡日'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='birth_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='誕生日'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='birth_month',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12')], default=None, max_length=2, null=True, verbose_name='誕生月'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='birth_year',
            field=models.CharField(blank=True, choices=[('2024(令和6年)', '2024(令和6年)'), ('2023(令和5年)', '2023(令和5年)'), ('2022(令和4年)', '2022(令和4年)'), ('2021(令和3年)', '2021(令和3年)'), ('2020(令和2年)', '2020(令和2年)'), ('2019(平成31年/令和元年)', '2019(平成31年/令和元年)'), ('2018(平成30年)', '2018(平成30年)'), ('2017(平成29年)', '2017(平成29年)'), ('2016(平成28年)', '2016(平成28年)'), ('2015(平成27年)', '2015(平成27年)'), ('2014(平成26年)', '2014(平成26年)'), ('2013(平成25年)', '2013(平成25年)'), ('2012(平成24年)', '2012(平成24年)'), ('2011(平成23年)', '2011(平成23年)'), ('2010(平成22年)', '2010(平成22年)'), ('2009(平成21年)', '2009(平成21年)'), ('2008(平成20年)', '2008(平成20年)'), ('2007(平成19年)', '2007(平成19年)'), ('2006(平成18年)', '2006(平成18年)'), ('2005(平成17年)', '2005(平成17年)'), ('2004(平成16年)', '2004(平成16年)'), ('2003(平成15年)', '2003(平成15年)'), ('2002(平成14年)', '2002(平成14年)'), ('2001(平成13年)', '2001(平成13年)'), ('2000(平成12年)', '2000(平成12年)'), ('1999(平成11年)', '1999(平成11年)'), ('1998(平成10年)', '1998(平成10年)'), ('1997(平成9年)', '1997(平成9年)'), ('1996(平成8年)', '1996(平成8年)'), ('1995(平成7年)', '1995(平成7年)'), ('1994(平成6年)', '1994(平成6年)'), ('1993(平成5年)', '1993(平成5年)'), ('1992(平成4年)', '1992(平成4年)'), ('1991(平成3年)', '1991(平成3年)'), ('1990(平成2年)', '1990(平成2年)'), ('1989(昭和64年/平成元年)', '1989(昭和64年/平成元年)'), ('1988(昭和63年)', '1988(昭和63年)'), ('1987(昭和62年)', '1987(昭和62年)'), ('1986(昭和61年)', '1986(昭和61年)'), ('1985(昭和60年)', '1985(昭和60年)'), ('1984(昭和59年)', '1984(昭和59年)'), ('1983(昭和58年)', '1983(昭和58年)'), ('1982(昭和57年)', '1982(昭和57年)'), ('1981(昭和56年)', '1981(昭和56年)'), ('1980(昭和55年)', '1980(昭和55年)'), ('1979(昭和54年)', '1979(昭和54年)'), ('1978(昭和53年)', '1978(昭和53年)'), ('1977(昭和52年)', '1977(昭和52年)'), ('1976(昭和51年)', '1976(昭和51年)'), ('1975(昭和50年)', '1975(昭和50年)'), ('1974(昭和49年)', '1974(昭和49年)'), ('1973(昭和48年)', '1973(昭和48年)'), ('1972(昭和47年)', '1972(昭和47年)'), ('1971(昭和46年)', '1971(昭和46年)'), ('1970(昭和45年)', '1970(昭和45年)'), ('1969(昭和44年)', '1969(昭和44年)'), ('1968(昭和43年)', '1968(昭和43年)'), ('1967(昭和42年)', '1967(昭和42年)'), ('1966(昭和41年)', '1966(昭和41年)'), ('1965(昭和40年)', '1965(昭和40年)'), ('1964(昭和39年)', '1964(昭和39年)'), ('1963(昭和38年)', '1963(昭和38年)'), ('1962(昭和37年)', '1962(昭和37年)'), ('1961(昭和36年)', '1961(昭和36年)'), ('1960(昭和35年)', '1960(昭和35年)'), ('1959(昭和34年)', '1959(昭和34年)'), ('1958(昭和33年)', '1958(昭和33年)'), ('1957(昭和32年)', '1957(昭和32年)'), ('1956(昭和31年)', '1956(昭和31年)'), ('1955(昭和30年)', '1955(昭和30年)'), ('1954(昭和29年)', '1954(昭和29年)'), ('1953(昭和28年)', '1953(昭和28年)'), ('1952(昭和27年)', '1952(昭和27年)'), ('1951(昭和26年)', '1951(昭和26年)'), ('1950(昭和25年)', '1950(昭和25年)'), ('1949(昭和24年)', '1949(昭和24年)'), ('1948(昭和23年)', '1948(昭和23年)'), ('1947(昭和22年)', '1947(昭和22年)'), ('1946(昭和21年)', '1946(昭和21年)'), ('1945(昭和20年)', '1945(昭和20年)'), ('1944(昭和19年)', '1944(昭和19年)'), ('1943(昭和18年)', '1943(昭和18年)'), ('1942(昭和17年)', '1942(昭和17年)'), ('1941(昭和16年)', '1941(昭和16年)'), ('1940(昭和15年)', '1940(昭和15年)'), ('1939(昭和14年)', '1939(昭和14年)'), ('1938(昭和13年)', '1938(昭和13年)'), ('1937(昭和12年)', '1937(昭和12年)'), ('1936(昭和11年)', '1936(昭和11年)'), ('1935(昭和10年)', '1935(昭和10年)'), ('1934(昭和9年)', '1934(昭和9年)'), ('1933(昭和8年)', '1933(昭和8年)'), ('1932(昭和7年)', '1932(昭和7年)'), ('1931(昭和6年)', '1931(昭和6年)'), ('1930(昭和5年)', '1930(昭和5年)'), ('1929(昭和4年)', '1929(昭和4年)'), ('1928(昭和3年)', '1928(昭和3年)'), ('1927(昭和2年)', '1927(昭和2年)'), ('1926(大正15年/昭和元年)', '1926(大正15年/昭和元年)'), ('1925(大正14年)', '1925(大正14年)'), ('1924(大正13年)', '1924(大正13年)'), ('1923(大正12年)', '1923(大正12年)'), ('1922(大正11年)', '1922(大正11年)'), ('1921(大正10年)', '1921(大正10年)'), ('1920(大正9年)', '1920(大正9年)'), ('1919(大正8年)', '1919(大正8年)'), ('1918(大正7年)', '1918(大正7年)'), ('1917(大正6年)', '1917(大正6年)'), ('1916(大正5年)', '1916(大正5年)'), ('1915(大正4年)', '1915(大正4年)'), ('1914(大正3年)', '1914(大正3年)'), ('1913(大正2年)', '1913(大正2年)'), ('1912(明治45年/大正元年)', '1912(明治45年/大正元年)'), ('1911(明治44年)', '1911(明治44年)'), ('1910(明治43年)', '1910(明治43年)'), ('1909(明治42年)', '1909(明治42年)'), ('1908(明治41年)', '1908(明治41年)'), ('1907(明治40年)', '1907(明治40年)'), ('1906(明治39年)', '1906(明治39年)'), ('1905(明治38年)', '1905(明治38年)'), ('1904(明治37年)', '1904(明治37年)'), ('1903(明治36年)', '1903(明治36年)'), ('1902(明治35年)', '1902(明治35年)'), ('1901(明治34年)', '1901(明治34年)'), ('1900(明治33年)', '1900(明治33年)')], default=None, max_length=20, null=True, verbose_name='誕生年'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='death_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='死亡日'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='death_month',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12')], default=None, max_length=2, null=True, verbose_name='死亡月'),
        ),
        migrations.AlterField(
            model_name='decedent',
            name='death_year',
            field=models.CharField(blank=True, choices=[('2024(令和6年)', '2024(令和6年)'), ('2023(令和5年)', '2023(令和5年)'), ('2022(令和4年)', '2022(令和4年)'), ('2021(令和3年)', '2021(令和3年)'), ('2020(令和2年)', '2020(令和2年)'), ('2019(平成31年/令和元年)', '2019(平成31年/令和元年)'), ('2018(平成30年)', '2018(平成30年)'), ('2017(平成29年)', '2017(平成29年)'), ('2016(平成28年)', '2016(平成28年)'), ('2015(平成27年)', '2015(平成27年)'), ('2014(平成26年)', '2014(平成26年)'), ('2013(平成25年)', '2013(平成25年)'), ('2012(平成24年)', '2012(平成24年)'), ('2011(平成23年)', '2011(平成23年)'), ('2010(平成22年)', '2010(平成22年)'), ('2009(平成21年)', '2009(平成21年)'), ('2008(平成20年)', '2008(平成20年)'), ('2007(平成19年)', '2007(平成19年)'), ('2006(平成18年)', '2006(平成18年)'), ('2005(平成17年)', '2005(平成17年)'), ('2004(平成16年)', '2004(平成16年)'), ('2003(平成15年)', '2003(平成15年)'), ('2002(平成14年)', '2002(平成14年)'), ('2001(平成13年)', '2001(平成13年)'), ('2000(平成12年)', '2000(平成12年)'), ('1999(平成11年)', '1999(平成11年)'), ('1998(平成10年)', '1998(平成10年)'), ('1997(平成9年)', '1997(平成9年)'), ('1996(平成8年)', '1996(平成8年)'), ('1995(平成7年)', '1995(平成7年)'), ('1994(平成6年)', '1994(平成6年)'), ('1993(平成5年)', '1993(平成5年)'), ('1992(平成4年)', '1992(平成4年)'), ('1991(平成3年)', '1991(平成3年)'), ('1990(平成2年)', '1990(平成2年)'), ('1989(昭和64年/平成元年)', '1989(昭和64年/平成元年)'), ('1988(昭和63年)', '1988(昭和63年)'), ('1987(昭和62年)', '1987(昭和62年)'), ('1986(昭和61年)', '1986(昭和61年)'), ('1985(昭和60年)', '1985(昭和60年)'), ('1984(昭和59年)', '1984(昭和59年)'), ('1983(昭和58年)', '1983(昭和58年)'), ('1982(昭和57年)', '1982(昭和57年)'), ('1981(昭和56年)', '1981(昭和56年)'), ('1980(昭和55年)', '1980(昭和55年)'), ('1979(昭和54年)', '1979(昭和54年)'), ('1978(昭和53年)', '1978(昭和53年)'), ('1977(昭和52年)', '1977(昭和52年)'), ('1976(昭和51年)', '1976(昭和51年)'), ('1975(昭和50年)', '1975(昭和50年)'), ('1974(昭和49年)', '1974(昭和49年)'), ('1973(昭和48年)', '1973(昭和48年)'), ('1972(昭和47年)', '1972(昭和47年)'), ('1971(昭和46年)', '1971(昭和46年)'), ('1970(昭和45年)', '1970(昭和45年)'), ('1969(昭和44年)', '1969(昭和44年)'), ('1968(昭和43年)', '1968(昭和43年)'), ('1967(昭和42年)', '1967(昭和42年)'), ('1966(昭和41年)', '1966(昭和41年)'), ('1965(昭和40年)', '1965(昭和40年)'), ('1964(昭和39年)', '1964(昭和39年)'), ('1963(昭和38年)', '1963(昭和38年)'), ('1962(昭和37年)', '1962(昭和37年)'), ('1961(昭和36年)', '1961(昭和36年)'), ('1960(昭和35年)', '1960(昭和35年)'), ('1959(昭和34年)', '1959(昭和34年)'), ('1958(昭和33年)', '1958(昭和33年)'), ('1957(昭和32年)', '1957(昭和32年)'), ('1956(昭和31年)', '1956(昭和31年)'), ('1955(昭和30年)', '1955(昭和30年)'), ('1954(昭和29年)', '1954(昭和29年)'), ('1953(昭和28年)', '1953(昭和28年)'), ('1952(昭和27年)', '1952(昭和27年)'), ('1951(昭和26年)', '1951(昭和26年)'), ('1950(昭和25年)', '1950(昭和25年)'), ('1949(昭和24年)', '1949(昭和24年)'), ('1948(昭和23年)', '1948(昭和23年)'), ('1947(昭和22年)', '1947(昭和22年)'), ('1946(昭和21年)', '1946(昭和21年)'), ('1945(昭和20年)', '1945(昭和20年)'), ('1944(昭和19年)', '1944(昭和19年)'), ('1943(昭和18年)', '1943(昭和18年)'), ('1942(昭和17年)', '1942(昭和17年)'), ('1941(昭和16年)', '1941(昭和16年)'), ('1940(昭和15年)', '1940(昭和15年)'), ('1939(昭和14年)', '1939(昭和14年)'), ('1938(昭和13年)', '1938(昭和13年)'), ('1937(昭和12年)', '1937(昭和12年)'), ('1936(昭和11年)', '1936(昭和11年)'), ('1935(昭和10年)', '1935(昭和10年)'), ('1934(昭和9年)', '1934(昭和9年)'), ('1933(昭和8年)', '1933(昭和8年)'), ('1932(昭和7年)', '1932(昭和7年)'), ('1931(昭和6年)', '1931(昭和6年)'), ('1930(昭和5年)', '1930(昭和5年)'), ('1929(昭和4年)', '1929(昭和4年)'), ('1928(昭和3年)', '1928(昭和3年)'), ('1927(昭和2年)', '1927(昭和2年)'), ('1926(大正15年/昭和元年)', '1926(大正15年/昭和元年)'), ('1925(大正14年)', '1925(大正14年)'), ('1924(大正13年)', '1924(大正13年)'), ('1923(大正12年)', '1923(大正12年)'), ('1922(大正11年)', '1922(大正11年)'), ('1921(大正10年)', '1921(大正10年)'), ('1920(大正9年)', '1920(大正9年)'), ('1919(大正8年)', '1919(大正8年)'), ('1918(大正7年)', '1918(大正7年)'), ('1917(大正6年)', '1917(大正6年)'), ('1916(大正5年)', '1916(大正5年)'), ('1915(大正4年)', '1915(大正4年)'), ('1914(大正3年)', '1914(大正3年)'), ('1913(大正2年)', '1913(大正2年)'), ('1912(明治45年/大正元年)', '1912(明治45年/大正元年)'), ('1911(明治44年)', '1911(明治44年)'), ('1910(明治43年)', '1910(明治43年)'), ('1909(明治42年)', '1909(明治42年)'), ('1908(明治41年)', '1908(明治41年)'), ('1907(明治40年)', '1907(明治40年)'), ('1906(明治39年)', '1906(明治39年)'), ('1905(明治38年)', '1905(明治38年)'), ('1904(明治37年)', '1904(明治37年)'), ('1903(明治36年)', '1903(明治36年)'), ('1902(明治35年)', '1902(明治35年)'), ('1901(明治34年)', '1901(明治34年)'), ('1900(明治33年)', '1900(明治33年)')], default=None, max_length=20, null=True, verbose_name='死亡年'),
        ),
        migrations.AlterField(
            model_name='descendant',
            name='birth_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='誕生日'),
        ),
        migrations.AlterField(
            model_name='descendant',
            name='death_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='死亡日'),
        ),
        migrations.AlterField(
            model_name='spouse',
            name='birth_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='誕生日'),
        ),
        migrations.AlterField(
            model_name='spouse',
            name='death_date',
            field=models.CharField(blank=True, choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('13', '13'), ('14', '14'), ('15', '15'), ('16', '16'), ('17', '17'), ('18', '18'), ('19', '19'), ('20', '20'), ('21', '21'), ('22', '22'), ('23', '23'), ('24', '24'), ('25', '25'), ('26', '26'), ('27', '27'), ('28', '28'), ('29', '29'), ('30', '30'), ('31', '31')], default=None, max_length=2, null=True, verbose_name='死亡日'),
        ),
    ]
