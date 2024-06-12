class NewUser:
    BASIC = "new_basic_user"
    OPTION1 = "new_option1_user"
    OPTION2 = "new_option2_user"

class Account:
    LOGIN_TRY_COUNT = "login_try_count"
    LAST_LOGIN_TRY_TIME = "last_login_try_time"

class Step1:
    
    class Form:
        DECEDENT = "step_one_decedent_form_data"
        DECEDENT_SPOUSE = "step_one_decedent_spouse_form_data"
        CHILD_COMMON = "step_one_child_common_form_data"
        COLLATERAL_COMMON = "step_one_collateral_common_form_data"
        LIST = [
            DECEDENT, 
            DECEDENT_SPOUSE,
            CHILD_COMMON,
            COLLATERAL_COMMON
        ]
        
    class Formset:
        CHILD = "step_one_child_form_set_data"
        CHILD_SPOUSE = "step_one_child_spouse_form_set_data"
        GRAND_CHILD = "step_one_grand_child_form_set_data"
        ASCENDANT = "step_one_ascendant_form_set_data"
        COLLATERAL = "step_one_collateral_form_set_data"
        LIST = [
            CHILD,
            CHILD_SPOUSE,
            GRAND_CHILD,
            ASCENDANT,
            COLLATERAL
        ]