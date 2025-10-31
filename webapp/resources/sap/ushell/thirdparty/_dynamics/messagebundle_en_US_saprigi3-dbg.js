sap.ui.define(['exports'], (function (exports) { 'use strict';

	var ARIA_LABEL_CARD_CONTENT = "⁪⁪⁪‍‍‌‌‍​‌‌‌‍‌‍​‍‍‍​​‌​‌‍‌‌​‌​‌‍‌​‌‌‍​​​‍‍​⁪Card Content⁪⁪";
	var ARIA_ROLEDESCRIPTION_CARD = "⁪⁪⁪‌​‌‍​‌‌‌​‍‌​‌‍‌‌‌‌‌‍​‍‍‍​​‍‌‌‌‍​‌‌‍‌‌‍​​‌⁪Card⁪⁪";
	var ARIA_ROLEDESCRIPTION_CARD_HEADER = "⁪⁪⁪‌​​​​‍‍‍​‌‌​‌‌​‍‌‍‌‌‍‌‌‌​‌​‍​‌‌‍​​‌‍‌‍‌‍​⁪Card Header⁪⁪";
	var ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER = "⁪⁪⁪‍‌​​‌‌‍‌‍​‌‍​‌‍‌‍‌​‍‍​‍​​‌​​​‌​​‌‍‌​‌​‍⁪Interactive Card Header⁪⁪";
	var AVATAR_TOOLTIP = "⁪⁪⁪‌​‍‍‌‍‍‍‍‍‍​‍‌​‌‍​‍‌‍‌​‌‌‌​‌‌​​‌‍‍‍‌​‍‍‍⁪Avatar⁪⁪";
	var AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL = "⁪⁪⁪‌​‍​‍‍‌​​​‍‍​‌‌‌‌‍‌‌‌‌‍​‌‌‍‌‌‌​​‍‍​‍‌‍‍‍‌⁪​​​{0}‌‌‌ displayed, ​​​{1}‌‌‌ hidden.⁪⁪";
	var AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL = "⁪⁪⁪‌​‍‌‌​‌​‍​‌‍‍‍​‌‌​‍‌​​​‌​​‍​​​‍‌‍‌‌‌‌⁪Activate for complete list.⁪⁪";
	var AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL = "⁪⁪⁪‌​‌​‌‌‍‍‌​​‍‌​‌‍‍​‌‍‍‌​​‌​‌​‍​‌‍‌‍‌‍‌‍‍‌‌⁪Individual avatars.⁪⁪";
	var AVATAR_GROUP_ARIA_LABEL_GROUP = "⁪⁪⁪‌‌‌​‍​‌​‍‌​​‌‍​‍‌‌​​‍‍‌​‍‌‍​‌‍‌​‍​‍‌‍‍​‍‌⁪Conjoined avatars.⁪⁪";
	var AVATAR_GROUP_MOVE = "⁪⁪⁪‌‌​‌‌‍​‌​‍​‍‍‌​‍‍‌‌​‌‌​‌‌‌‍​‌‌‍‍‍​​‌​‍​​‌⁪Press ARROW keys to move.⁪⁪";
	var TAG_DESCRIPTION_TAG = "⁪⁪⁪‌‍​‍​‌‍​‌‍‌‍‌​​​​‍‍‌​​‌‍​‍​‌‍‍‍​​‍​‌​‍‍‌⁪Tag⁪⁪";
	var TAG_ROLE_DESCRIPTION = "⁪⁪⁪‍‌‌‌‌‌‌​​‌‌‌​‌‍‌​​​‌‍‌​​‌‌‌‌‌‍‌‌​‍‍‌‍‍​⁪Tag button⁪⁪";
	var TAG_ERROR = "⁪⁪⁪‍​‍​‍‌​​​​‌‍​​‍‌​‌​​​​​‍‌‍​​‍‌​‍‌‌​​​‍‍‌⁪Error⁪⁪";
	var TAG_WARNING = "⁪⁪⁪‌‌​‍‌‍​​​‌​‍‌‍‍‌‌‌​‍​‍​‍‌‍​​‍‌‌​‌‍‌‌‍‍​​⁪Warning⁪⁪";
	var TAG_SUCCESS = "⁪⁪⁪‍​​‍‌​‌‍​‍​​​‌‍​‍‌​​‍‌​​​‌‌​‍‌‌‌‌​‍‍‌‌‌‌⁪Success⁪⁪";
	var TAG_INFORMATION = "⁪⁪⁪‍​‍‌​​‌‌​‌‍‌​​​‌‌​‌‌​​‍‍‍​​‍‌​​‌‌‍​‍‌​‌‌⁪Information⁪⁪";
	var BREADCRUMB_ITEM_POS = "⁪⁪⁪‌‌‌‍‌​‍‍‍‍‌‍‌‌‍‌‌‌‍‍‌‍‌‍​​​‌‍​‍​‌‍​​‌​‍⁪​​​{0}‌‌‌ of ​​​{1}‌‌‌⁪⁪";
	var BREADCRUMBS_ARIA_LABEL = "⁪⁪⁪‌​‌‌​‍​‌‌‍‌‍‍‌‍‍‍‍‍‌‍​​​​​‌‍​‍‍‍‍‌​‍‌‍‌‌​⁪Breadcrumb Trail⁪⁪";
	var BREADCRUMBS_OVERFLOW_ARIA_LABEL = "⁪⁪⁪‌​‍​​‌​‍​​‍‌​‍‌‌‌‌‍​‌‌​‌‌‍‌‍​‌‌‌‌‌‍‌‍​‌‌‍⁪More⁪⁪";
	var BREADCRUMBS_CANCEL_BUTTON = "⁪⁪⁪‌‍‌​‌‍​​‌‍‌‍‌​​‌‍‌‍​​‌‍‍‍‌‌‌​​​​​​‌‌​​‌​⁪Cancel⁪⁪";
	var FORM_SELECTABLE_AVALIABLE_VALUES = "⁪⁪⁪‍‌‌‍‌‍‌‍​‍‍‍‍‌‌​‍​​‍​‌‌‌‍‌‌​​‍‍​‌​​‌​‍‌​⁪Available Values⁪⁪";
	var BUSY_INDICATOR_TITLE = "⁪⁪⁪‌‍​​​‍​‌‍‍​‍​​‍​‌‍‌‍​‌‌‌​‌‍‍​‍‌‌​‍‍‍​‌​‍⁪Please wait⁪⁪";
	var BUTTON_ARIA_TYPE_ACCEPT = "⁪⁪⁪‌​‌‌​​​‌‌‌​​‍‍​‌‌​​‍‍‍​‌​‍​‍‍​‌‍‍‌‌​‍‍​​​⁪Positive Action⁪⁪";
	var BUTTON_ARIA_TYPE_REJECT = "⁪⁪⁪‌‌‌​​‍‌‌‍‍​‌​​​‌‌​‌​‍​‌​‌​‌‍‍‌​​‍‍‌‍‌​​‍​⁪Negative Action⁪⁪";
	var BUTTON_ARIA_TYPE_EMPHASIZED = "⁪⁪⁪‌‍‍​​‌‍‌‍‌​‍‌‍‌​​‌‌‍​‌​‍​‍​​‍‌​‌‌‍‌‍‍‍‍​⁪Emphasized⁪⁪";
	var BUTTON_ARIA_TYPE_ATTENTION = "⁪⁪⁪‍‍‍‍​​‌​‌​​‌​‍​‍‌‍‌‌​​‍‍‍​​‌‍‌​‌‌‍‍‌‍​​​⁪Warning⁪⁪";
	var BUTTON_BADGE_ONE_ITEM = "⁪⁪⁪‌​​‌‍‍​‍‌‌​​‌‌‌​‍​​‍‍‍​‍​‍‍​​​‍​‌‌‍‍‌​​‍​⁪​​​{0}‌‌‌ item⁪⁪";
	var BUTTON_BADGE_MANY_ITEMS = "⁪⁪⁪‌​‍‌​​‌‍‍​‍‌​‍​‍‍‌‍‍‍‌‍‍‌‍‍​‌‌​​‌‌‌​‍‌​‌​⁪​​​{0}‌‌‌ items⁪⁪";
	var CAL_LEGEND_TODAY_TEXT = "⁪⁪⁪‌​‌‍​‌‍​​‌‌‍​‍‌​‌‍‌​‍​‌‌​‌‌‌‍‌‍‍‌‌‌‌‌‍​‍‍⁪Today⁪⁪";
	var CAL_LEGEND_SELECTED_TEXT = "⁪⁪⁪‌‌‌​​‍‌​‌​‌​‍‌​‍​‍‌​​‌‌​‌‍​​‌‍‌‍​‌​‌​‌‍‍⁪Selected Day⁪⁪";
	var CAL_LEGEND_WORKING_DAY_TEXT = "⁪⁪⁪‌​‍‍‌‌‌​​‌​​​‍​‌‍‌‍‍‍​‌‍‌‌‌‌‍‍‌​‍‌​​‌‍​‌‍⁪Working Day⁪⁪";
	var CAL_LEGEND_NON_WORKING_DAY_TEXT = "⁪⁪⁪‍‌​‌‌​‍‌‌‍​‍‌‌​​​‍‌‌‍‌​‌‍‌‍​​​​‍​​​​‍‌​​⁪Non-Working Day⁪⁪";
	var CAL_LEGEND_ROLE_DESCRIPTION = "⁪⁪⁪‍‍‌‍​‌​‌​‌‍​‌‍‌‍‌​‍‍‌‌‌‍​‌‌‌‌​‌​‌‍‌​​‌‍​⁪Calendar Legend⁪⁪";
	var CAROUSEL_OF_TEXT = "⁪⁪⁪‌‍​‍‌‌‍​​‍​​​‍​‍​​​‍‌‌‍‍​​‌‌‍‍‍‌‍‍‌​​‍‍‌⁪of⁪⁪";
	var CAROUSEL_DOT_TEXT = "⁪⁪⁪‌‍‍‍‌​​‍‌‌‌‌‌‍‌‍‍​​‍‍​​‍‌‌‍​‌‌‌​‍‍​​‌‌‍‌⁪Item ​​​{0}‌‌‌ of ​​​{1}‌‌‌ displayed⁪⁪";
	var CAROUSEL_PREVIOUS_ARROW_TEXT = "⁪⁪⁪‌​‌‌‍‍‍‍‌​​‍‌‍‌​‌​​‌‌​​​‌‌‌‍‌​​‍‍‌‍‍‌‍‍‍‌⁪Previous Page⁪⁪";
	var CAROUSEL_NEXT_ARROW_TEXT = "⁪⁪⁪‌​‌‌​​​​‌​‍​‌‍​‌‌​‍‍​‍‌‌‍​​​‍‌​‍​‍​⁪Next Page⁪⁪";
	var CAROUSEL_ARIA_ROLE_DESCRIPTION = "⁪⁪⁪‌‌‌​‌‍‌​‌‌​‌‌‍‍‌​​‌‍​​​​‍‍​‌​‍‌​‌‌​‍​‌‌‍​⁪Carousel⁪⁪";
	var COLORPALETTE_CONTAINER_LABEL = "⁪⁪⁪‌‍‍​‍‍‍​‍‍‍​‍‌​‍‍‍‍​​‍‍‍‍‍‌‍‌‌​​​​​​‌​​⁪Color Palette - Predefined Colors⁪⁪";
	var COLORPALETTE_POPOVER_TITLE = "⁪⁪⁪‌​‌‍‍‌‍‍‍‍‍‍‍​‍​​‌​​‌‌‍‌‍​‍‍​​‍​‍​‍‌​​​‌⁪Color Palette⁪⁪";
	var COLORPALETTE_COLOR_LABEL = "⁪⁪⁪‌‌‌‌‍‌‌​‍​‍‌‍‌‍‍‍‌‍‌‍‌‍‌​‍​‍​​‍​‍‌‌​​​‍​‌⁪Color⁪⁪";
	var COLOR_PALETTE_DIALOG_CANCEL_BUTTON = "⁪⁪⁪‌​​‍‌​‍​‍​‌‌‌‌‍‌‌​‍‌‌​‍‍‍‌​‍‍‌‍‍‌‌‍‍‌‌‌‌‍⁪Cancel⁪⁪";
	var COLOR_PALETTE_DIALOG_OK_BUTTON = "⁪⁪⁪‌‌​‍​‍‌‍‍‍‌‌‌​‌‍​​​​‌​​​‌‍‍‌‍‍​‌‌​‌‍‍‌‌‍​⁪OK⁪⁪";
	var COLOR_PALETTE_DIALOG_TITLE = "⁪⁪⁪‌​​​‌‍​‌‍‍‌‌‌​​‍‍‌‌‌‍‍​‌‌‌‌​​​‍​‍‌‍​‍​‌‍⁪Change Color⁪⁪";
	var COLOR_PALETTE_MORE_COLORS_TEXT = "⁪⁪⁪‍​‌​​‍‌‍​‍​‍​‍‍‍‍​​​​​‍​​​‌​‌​​‌​​‌​‌​‍​⁪More Colors...⁪⁪";
	var COLOR_PALETTE_DEFAULT_COLOR_TEXT = "⁪⁪⁪‌​‍‌‍​‍​‌‍‌‍‍​‍‌‌​​​‌​‍‍‌‌‍‌​​‍​‍​‌‍​‌​‍‍⁪Default Color⁪⁪";
	var COLORPICKER_ALPHA_SLIDER = "⁪⁪⁪‌​‌​‌‌‌‌​‍‌‌​‌‌​​​‌‍‌​‍‌‍​‍‍‍‌‌‌‌‌‍​‍‍‍⁪Alpha control⁪⁪";
	var COLORPICKER_HUE_SLIDER = "⁪⁪⁪‌​​‍​‍‌‍‍‍‍‍​​‍​‌​‌​‌‍‍​‌‍​‌​‌​‌​‍‍‍‍‌‍‍⁪Hue control⁪⁪";
	var COLORPICKER_HEX = "⁪⁪⁪‍‍‍​‍​‍‌‌​​‌​​​​‍‌​‍​‌‍‍‌‍​​‍​‌‍‍‌‌‍‍‌‌‌⁪Hexadecimal⁪⁪";
	var COLORPICKER_RED = "⁪⁪⁪‌​‌‌​‍‍‌​‍‌​‍‍‍​‌‌‍‌‌‌‌‍‍‌‍‌‌‍‍​‌‌‌‌​‌​​⁪Red⁪⁪";
	var COLORPICKER_GREEN = "⁪⁪⁪‍‌‍‍​‌‌‌​​‌​‌‍​‌​​‌‍​‌‌‌​‍‌‍​‌‌‌‌‍​‌‍‍‌‌⁪Green⁪⁪";
	var COLORPICKER_BLUE = "⁪⁪⁪‌‍‌​‍‌‌​​​​​​‌‌‌‌​‍‌‍‍‍‍‍​‌‌‍​‌‌​‍​‍‌‍​⁪Blue⁪⁪";
	var COLORPICKER_HUE = "⁪⁪⁪‌‌​‌​​‍‌‌‍‌‌‌‌‌‌​‍‌‍‍​‌​‌‌​‌‌‌‌‍‌‍​‍‍‌​​‌⁪Hue⁪⁪";
	var COLORPICKER_SATURATION = "⁪⁪⁪‌‌‌​​‌​‍‌‌‌​‍​​​‌‌‌‍‌‍​‌​‍​‌‍​‍‌‌​‌​​‍​‌‌⁪Saturation⁪⁪";
	var COLORPICKER_LIGHT = "⁪⁪⁪‌​​‌‌​​‍​‌‌‍‌​​‌‍​‍‍‍‍​‌‌​​​​​​​​‌‍​‍​‍​⁪Light⁪⁪";
	var COLORPICKER_TOGGLE_MODE_TOOLTIP = "⁪⁪⁪‌​‍‍‍‍‌‌​‍‍‍‍​​‌‌‌‌‍​‍‌‍​​​‌‍​‍​‌‍‍‍​‍‌‌‍⁪Change Color Mode⁪⁪";
	var COLORPICKER_ALPHA = "⁪⁪⁪‌‍‍‌‌‍‍‍‌‌​‌‌‍‍​​‌‍‍‍‌​‌‌‌​‌‍‍‌‌​‌‍‍‌​‌⁪Alpha⁪⁪";
	var DATEPICKER_OPEN_ICON_TITLE = "⁪⁪⁪‍​​​‍‌‌‌‍‍​‍‌‍‌​‌‌​‍‌‌​‌‍​‌​‌‍‌​​​‌‍​​​⁪Open Picker⁪⁪";
	var DATEPICKER_DATE_DESCRIPTION = "⁪⁪⁪‌​‍‌‍‍​​‍‌‍​‍‍‍‍‍‍‍‌‌​‌‌‌​‌‍‌‌‍‍​​​‌‍‌‍‍‌⁪Date Input⁪⁪";
	var DATETIME_DESCRIPTION = "⁪⁪⁪‌​​‌‍‌​‍‌​‍‍​​‌​‌‍‍‍​‌​‍‍‍‌‍‌‍‍‌‌​‌​‌​‍​‍⁪Date Time Input⁪⁪";
	var DATERANGE_DESCRIPTION = "⁪⁪⁪‍‌​‌‍‍​‌‌​‍‍‌‌‌‌​‌​​‍‌‌‍​‌​‌‍‌​‍​​‌‌‍‌‍‌⁪Date Range Input⁪⁪";
	var DATEPICKER_POPOVER_ACCESSIBLE_NAME = "⁪⁪⁪‌‍‍‌‍​‌‌​‍​‌​​​‌‌​‌‍​​‍‍‌‌​‌​‍‌‍‌‍‌​‌‍​‌⁪Choose Date for ​​​{0}‌‌‌⁪⁪";
	var DATETIME_COMPONENTS_PLACEHOLDER_PREFIX = "⁪⁪⁪‌‍​‍​‍​‍​​​​‍​​‍‌‍​‍​​‌​‍‌‍‍‍‌‌‌‍‌​‌‍​​‌⁪e.g.⁪⁪";
	var DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME = "⁪⁪⁪‍‍​​‍‍‌‍‌‌‍‌‍​‌​‌​‌‍​‍​‍‍‌‌‌‍‍‍‌​​‍‍‍‌‌‌⁪Choose Date and Time for ​​​{0}‌‌‌⁪⁪";
	var DATERANGEPICKER_POPOVER_ACCESSIBLE_NAME = "⁪⁪⁪‍‌‌‌‍​​​‌‍‌​‌​‌‌‌‍​​​‌‌‌​‌‌‍​‌‌​​‍‌‍‍​‍​⁪Choose Date Range for ​​​{0}‌‌‌⁪⁪";
	var DELETE = "⁪⁪⁪‌​​‍‌‌‍​‍‍‌‌‌‌‌​‍‍‍​‍​​​​‌‍‌‌‌‌‌​​‌‍‍​​⁪Delete⁪⁪";
	var EMPTY_INDICATOR_SYMBOL = "⁪⁪⁪‌‍​‍‌‍​‌‍‌‍‍​​​‍‍‌​​​​‍‍‌‌‍​​‍​‌‍‍‍​​​‌​⁪–⁪⁪";
	var EMPTY_INDICATOR_ACCESSIBLE_TEXT = "⁪⁪⁪‌‌​‌​‌‌‌​​‍​‌​‍‍​‌‍‍‌‍​​​‍‍‍‍​​‌‍‌​​​‌‍​‍⁪Empty Value⁪⁪";
	var EXPANDABLE_TEXT_SHOW_MORE = "⁪⁪⁪‌​​‍‌‍‍‍‌​‌​​‍‍​​‍‍‍‌‍‌‌‌‌​​‍‌‍​‍‍​‍‌‌‌‌⁪Show More⁪⁪";
	var EXPANDABLE_TEXT_SHOW_LESS = "⁪⁪⁪‌​‍‍​​‌​‍‌‌‌‌‌‌‍​‍​‍‌​‌​‍‌​​‍​​‌​‍‌‌​‍​‍​⁪Show Less⁪⁪";
	var EXPANDABLE_TEXT_CLOSE = "⁪⁪⁪‌‌‌​​‌​​‌‍​​‍‌‍‌‍‍‍‌‌‍‍​​​‍​‌‍‌‍‍‍​​​‍‍‍⁪Close⁪⁪";
	var EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL = "⁪⁪⁪‍​​‍‌​​‍​​‌​‍‍​​‌‍‍‍‍​​​‌​​‍‍‍‌‍​‍​‍‍‍‍​⁪Show the full text⁪⁪";
	var EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL = "⁪⁪⁪‌‍‌‍​‌‍‍‍‌​‌‌‍​‌‌​​​​​​‌‍‍‍‍​‌‌​‌​‌‌‍​‌‍⁪Close the popover⁪⁪";
	var FILEUPLOADER_ROLE_DESCRIPTION = "⁪⁪⁪‌​​‍‌‍​‍‌​​​‍​​​​​‍‌​​‌‌‍‍‌‌‌‍‍​​​‌​‍‍‌‍⁪File Uploader⁪⁪";
	var FILEUPLOADER_DEFAULT_PLACEHOLDER = "⁪⁪⁪‌‍​‌​‍‍​‌‍‌‍‌‌‌​‌‍‍​‍‍‍‍‍​‌‍‍‌​​​‍‌​​‌‍​⁪Browse or drop a file⁪⁪";
	var FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER = "⁪⁪⁪‌​​‍‍​‍‌​‌‍​‍‌‍​​​​‌‍‍‍‍​‌‌​‌‌‍​​‌‌‌‍‌​​​⁪Browse or drop multiple files⁪⁪";
	var FILEUPLOADER_INPUT_TOOLTIP = "⁪⁪⁪‌​‍‍‌‍‌​​​‌‍‍‌‌‍​‍‍‍​‍‍‍​‌​‍‍‍‌​‍‍​‌‍‍‍‍‍⁪All files will be replaced on each upload⁪⁪";
	var FILEUPLOADER_VALUE_HELP_TOOLTIP = "⁪⁪⁪‍‌‌‌​‍​​‍‌‍‌​‌‌​‌‌‌​​‌​‌‌‌‍​‍‌‍​‍​​‍​‌​‍⁪Browse and replace all files⁪⁪";
	var FILEUPLOADER_CLEAR_ICON_TOOLTIP = "⁪⁪⁪‍‌‌‍‌‌‍‌‍‍​‍‌‌‌‍​‌‍‌‌‌‍‍‍‍​‍‌​‍‍‌‌‍‌‌‍⁪Remove all files⁪⁪";
	var GROUP_HEADER_TEXT = "⁪⁪⁪‍‍‌‍​‍​​‍‍​​‍​‍‍‍‍‍‍‌​‌‌‍‌​‌​‌​‌‌‌​‌​​‌‌⁪Group Header⁪⁪";
	var SELECT_ROLE_DESCRIPTION = "⁪⁪⁪‌​​‌‌‌‌‌‍‌‌‍‍​​‌​‌​​‍​‌‌​​​​‌‌‍‌‌‍‌​​‍‍‍‌⁪Listbox⁪⁪";
	var SELECT_OPTIONS = "⁪⁪⁪‍‌​​‍​​‌‍‌‌‍‍‌‌​​‌‌​‌​​‌‍‌‍​​​‍​‌‌‍​‍‍‍⁪Select Options⁪⁪";
	var SHOW_SELECTED_BUTTON = "⁪⁪⁪‌‌‌‌‍‍‍​‌‌​​​‌‌‍‍‌‍‌‌‌‌​‌​‍‍​‍​‌‌‍​‍​‍‌​⁪Show Selected Items Only⁪⁪";
	var INPUT_SUGGESTIONS = "⁪⁪⁪‌‌‌​​‌‍‍‍‌‌​‌​‍‌‌‍‌‍​‌​‍‌‌‌‌‍‍​‍‌​‍​​‌​‌⁪Suggestions Available⁪⁪";
	var MCB_SELECTED_ITEMS = "⁪⁪⁪‌​‌‍‍​‌‍‌‌‌​‍‌​‌​‌‍‌‍‌‍​‌‍‌‍‌‌‍‌‌‌​‍‍‌​‌‍⁪Select All (​​​{0}‌‌‌ of ​​​{1}‌‌‌)⁪⁪";
	var INPUT_SUGGESTIONS_TITLE = "⁪⁪⁪‌‍‍​‌‌‍‌‌‍‌‍‍‌​​‍‌‍‍​‍‍‍​​‌​‌‍‌‍​‍‍‍‌​‍‍⁪Select⁪⁪";
	var INPUT_SUGGESTIONS_ONE_HIT = "⁪⁪⁪‍‍‌‌‍​​‍‌​‍‍‍​‌‍​‍​​​‍‍‍‌‍‌​‍‌​‍‌‌‌‌‍‌‍⁪1 result available⁪⁪";
	var INPUT_SUGGESTIONS_MORE_HITS = "⁪⁪⁪‍​‍‌‌‌‍‍​‍‍‌​‍​‍​‌‌​‍‍‍‌‍‌‍​​‍‍‌​​‍‌​‍‍‍⁪​​​{0}‌‌‌ results are available⁪⁪";
	var INPUT_SUGGESTIONS_NO_HIT = "⁪⁪⁪‌‌​​‍‍‌​‌‍‍‌‍‌‌​‌‍‌​‍‍​​‌‍‍​​​‌​‍‌​‌‌‍​​‍⁪No results⁪⁪";
	var INPUT_CLEAR_ICON_ACC_NAME = "⁪⁪⁪‍​‍‍‌‍​‌​‍‌​​​‌​‌‍​‍​​‌‌​​‌‌‍​‌​‍​​‍‌‌‍‍⁪Clear⁪⁪";
	var INPUT_SUGGESTIONS_OK_BUTTON = "⁪⁪⁪‌‌​​‍‌‌‍‍‍‌​​​‌‌‍‌‌‌‌‍‌‌‍‍‌‌‍‍​‍​​‌​​‍‌‌‌⁪OK⁪⁪";
	var LINK_SUBTLE = "⁪⁪⁪‌​​‌‍‍​‌​‌‍‍​​‌​‌‍‍‌‌‍‌‌‌​‌‍‌‌‌​‍‍​​‍‍‌​‌⁪Subtle⁪⁪";
	var LINK_EMPHASIZED = "⁪⁪⁪‌​‌‌‍‍​​‌‍‌‍‌​‌‌​​‌‌‍‌‌​‍‌‌‍​‍​‌​‌‍​‍‍‌‌‌⁪Emphasized⁪⁪";
	var LIST_ITEM_ACTIVE = "⁪⁪⁪‌​‌‌‍‌‍‌‍‌‍‌‌‌‌‌‍​‍​​​​‍​‌‌​​​‌‌‍‌‌‍‍​​‌‍⁪Is Active⁪⁪";
	var LIST_ITEM_POSITION = "⁪⁪⁪‌‌‍‍​‌‌​​​​‍‌‌‍​‌‌​‍‌​‍‍‌​‍‍​‌​​‌‌​‌‍‍​‍⁪List item ​​​{0}‌‌‌ of ​​​{1}‌‌‌⁪⁪";
	var LIST_ITEM_SELECTED = "⁪⁪⁪‌​​‍‍‌‌‍​‍​‌‍​​‍‌‍‍‌‌​​‍‌‌‍​​‍‌​​‍‌​​‌‌‌​⁪Selected⁪⁪";
	var LIST_ITEM_NOT_SELECTED = "⁪⁪⁪‍‍‌‍‌‍​‍‌‍​‌‍‍‍‌‌​​‌​‍‍‍​‍‍​‍‌‌‌‌​​‍​‌‍‌⁪Not Selected⁪⁪";
	var LIST_ITEM_GROUP_HEADER = "⁪⁪⁪‌‌​​‍‌‍‍‍​‌​​‍‍​​‍​​‌‌​​‌‍‍‍​‌‍​‍‌‌‍‌‌‌​⁪Group Header⁪⁪";
	var LIST_ROLE_LIST_GROUP_DESCRIPTION = "⁪⁪⁪‌‍‌‌‍​‌‌‌‍‌‌‌​‍​​‌​‌​​‌​‌‍‌‍​‍‌​‌‌‌​‌​‌‌⁪contains ​​​{0}‌‌‌ sub groups with ​​​{1}‌‌‌ items⁪⁪";
	var LIST_ROLE_LISTBOX_GROUP_DESCRIPTION = "⁪⁪⁪‍​​‍‌‌‍‌‍​‍‍‌‌‍‍‌‌‍​​‌‍‌​​‍‍‍​‍‌​‌‌‌‍​‍⁪contains ​​​{0}‌‌‌ sub groups⁪⁪";
	var ARIA_LABEL_LIST_ITEM_CHECKBOX = "⁪⁪⁪‌​​‍​​‌‍‌​​​​‍‌‌‍‍‌‌​‌‌‌‍​‌​​‍‌‌‍‍‌​‌​‌‍​⁪Multiple Selection Mode⁪⁪";
	var ARIA_LABEL_LIST_ITEM_RADIO_BUTTON = "⁪⁪⁪‍‍‍‍​‍​‌‍​​‍​​‌‍​​‌‌‌​‌‍‍​‌​‍‌‌‍‍‌‌​​‍⁪Item Selection.⁪⁪";
	var ARIA_LABEL_LIST_SELECTABLE = "⁪⁪⁪‍‍​‌‌​‍‍‌‌‍‍​‍​‍‌‍‍‌‌‌‍‍​‌‍‌‍‍‌‌‍‌‍‌‍​​‍⁪Contains Selectable Items⁪⁪";
	var ARIA_LABEL_LIST_MULTISELECTABLE = "⁪⁪⁪‌‌‌‌‍​​​‍‌​​‌‌‍‍​​‍‌‍​‍​​​‍‌​‍‌​‌‌‍‍​​​‍​⁪Contains Multi-Selectable Items⁪⁪";
	var ARIA_LABEL_LIST_DELETABLE = "⁪⁪⁪‌​‌‍‍​‌​‍‌‍‌‌​​‍‍‌‍‌​‍‌‍‍‍‍​‍​‍​‍‌‌​​​‍‌‌⁪Contains Deletable Items⁪⁪";
	var MESSAGE_STRIP_CLOSE_BUTTON_INFORMATION = "⁪⁪⁪‌​‌​‍‍‌‌‌‌​‍​‍‍‍​‌‌‌‌​‍‌‌​‌‌‌‍‍‌‍‌‌‍‍‌‌‍‍⁪Close information message strip⁪⁪";
	var MESSAGE_STRIP_CLOSE_BUTTON_POSITIVE = "⁪⁪⁪‌‌‍‌‌‌‌​‍‍​​‍‍‍​‌‌​‍‌‌‍‌‍‍‍​‍‍‌‌​‍‌​​‍‌⁪Close positive message strip⁪⁪";
	var MESSAGE_STRIP_CLOSE_BUTTON_NEGATIVE = "⁪⁪⁪‌‌‍​‍‍‍​‌‍‌‌‌​‍‌‌‍​‌‌‌​‌‌‌​‍​‌​‌​‌​‌​‌​​⁪Close negative message strip⁪⁪";
	var MESSAGE_STRIP_CLOSE_BUTTON_CRITICAL = "⁪⁪⁪‌‌​‍‍‍‌‍‍‍‌‌​​​‍‍‌‍​​‌‍‍‍‌​‍​‍​​‌‍​‌‍‌​​‌⁪Close critical message strip⁪⁪";
	var MESSAGE_STRIP_CLOSE_BUTTON_CUSTOM = "⁪⁪⁪‌‌‌​‍‌​​​‍​‌‍​​​​‍‌​​‍​‍‍‍​‍‍‌‌‌‌​‌​‌​​‌​⁪Close custom message strip⁪⁪";
	var MESSAGE_STRIP_CLOSABLE = "⁪⁪⁪‌‌‍‍​‌​‍‍​‍‌​​‍‍​​​‌‌​​‍​​‍​‌​‌‌‍​​‍​‍​​⁪Closable⁪⁪";
	var MESSAGE_STRIP_ERROR = "⁪⁪⁪‍‍‍‌​‍​‍‍​‍​​‌‍‌‌‍‍‌​​‍‍‍‍‌‍​‍‍‌​​‍‍‌‍⁪Error Message Strip⁪⁪";
	var MESSAGE_STRIP_WARNING = "⁪⁪⁪‌​‍​‌‍‍‍‌‍‍​‍‌​‌‌‍​‌​‍‌‌‍​‌‌​​​‌​‌‍‌‍‍‍‍‌⁪Warning Message Strip⁪⁪";
	var MESSAGE_STRIP_SUCCESS = "⁪⁪⁪‌​​‌‍​‌‌​‍‌​‍‍‌‌​‌​‍‌‍‍‌‌‌‌​​​‌‍‍‍​‍​‌​‍​⁪Success Message Strip⁪⁪";
	var MESSAGE_STRIP_INFORMATION = "⁪⁪⁪‍‍‌​‌​‍‍‌‍‌​​‌‌‍‍​‌​‌​​‌‌‌‌​‌‍‍​‌‌‌‍‍⁪Message Strip⁪⁪";
	var MESSAGE_STRIP_CUSTOM = "⁪⁪⁪‌‌‍‌‌‍​​‌‌‍‌​‍‍‌​‍​​‍‍​‍​‌‍‌‍‍‌‍​‌‍‌‌‌‍‍⁪Custom Message Strip⁪⁪";
	var MULTICOMBOBOX_DIALOG_OK_BUTTON = "⁪⁪⁪‍​‍‍‍​‌‍‌​‍​‍‍​​‌​‌‍​​‍‍‍‍​‌‌‌​‌‍‍‍‍‍​‌⁪OK⁪⁪";
	var COMBOBOX_AVAILABLE_OPTIONS = "⁪⁪⁪‍‌‍‌‍​‌‍​‌​​​‌​‌‌‌‌‌‍‌‌​‍‌‍‌‌‌‌​‌​​‌‍‌‍‌⁪Available Options⁪⁪";
	var COMBOBOX_DIALOG_OK_BUTTON = "⁪⁪⁪‌​‌​‍‍​​‍​‍‍‌‍‍‌‌‌‍‍‌‌‍‍​‌‌‍​‌‍‍‍​‍​​‍​​‍⁪OK⁪⁪";
	var INPUT_AVALIABLE_VALUES = "⁪⁪⁪‌​​‍‍‍‌‍​‌‌​​‌‍​‍‍‍‍‍‌‍‍​‌​​‍‌‍‌‌‌‍‍‌‌‌‌​⁪Available Values⁪⁪";
	var VALUE_STATE_ERROR_ALREADY_SELECTED = "⁪⁪⁪‌‌​‍‍‍‍‌‌​‍‍​​‍‌‍‌​‌​​​‌‍​‌​‍​​‍‌‍‍​​‌​​‍⁪This value is already selected.⁪⁪";
	var MULTIINPUT_ROLEDESCRIPTION_TEXT = "⁪⁪⁪‌‌​​‍​​‌​​‌‍‍​‍‍​​‌​‍​‌‍‍‌​​‌‍‍​‌‌‌‌​‍‍‌⁪Multi Value Input⁪⁪";
	var MULTIINPUT_SHOW_MORE_TOKENS = "⁪⁪⁪‌‌​​​‍​‍‍​‌‍​‍‌‌​​‌‌‍​​‌‌‌‌‌‌‍​​​‍‌‌​‌​‍​⁪​​​{0}‌‌‌ more⁪⁪";
	var MULTIINPUT_VALUE_HELP_LABEL = "⁪⁪⁪‍​‍‍‌‍​‍‌​‌​‌‌‌‍‍​​‍​‌‌​‌‌‍​‍‌‍‍‍‍‌​​​‌⁪Show Value Help⁪⁪";
	var MULTIINPUT_VALUE_HELP = "⁪⁪⁪‌‌​‍‍‌‍‍​‌‍‌‍‌​​​‍‌‍‌‌​‌‌‌‍‍‍​‍‌​‌‌‌​‍​‍‌⁪Value help available⁪⁪";
	var PANEL_ICON = "⁪⁪⁪‍​​‍‌‍​‍‌‍​‍​‍‍​‌‍‍‌‌‍‌‌‌‌​‌‍‍‌‍‍‌​‌‌‍‍​⁪Expand/Collapse⁪⁪";
	var RANGE_SLIDER_ARIA_DESCRIPTION = "⁪⁪⁪‌​​​‌‍‍‌​​​‍‍​‍‍‍‍​​‌​​‌‍‌‍‌‌‌​‌‍‌‌‌‌‍‍‍‍⁪Range⁪⁪";
	var RANGE_SLIDER_START_HANDLE_DESCRIPTION = "⁪⁪⁪‌‌‌‌‍‌​​‍​​‍‍‌‌‍​‍‍‌​‍​​​‌‌‍​​‍‌‌​‍‌‍‌​⁪Left handle⁪⁪";
	var RANGE_SLIDER_END_HANDLE_DESCRIPTION = "⁪⁪⁪‌​‌‍​​‌‍​‍‍‍‌‌‍​‍​‌​​‌​‌‍‍​‍​‌‍‌‌​‍‍‌‍​‌⁪Right handle⁪⁪";
	var RATING_INDICATOR_TOOLTIP_TEXT = "⁪⁪⁪‌‌​​‍​‍​‍‌​‍​‌‍‌​‍‍​‍‌‌‌​‍‍‌​‍‌‌‌‌​‍​‌​​​⁪Rating⁪⁪";
	var RATING_INDICATOR_TEXT = "⁪⁪⁪‌​‍‍​‍​​​‌​‍‍‌‍​‌‍​‌​‌‌​‌‌​​​‍‍‌‍‍‍​‍‍‍‍‌⁪Rating Indicator⁪⁪";
	var RATING_INDICATOR_ARIA_DESCRIPTION = "⁪⁪⁪‍‌‌‍‍‍‍​‍​​‌‍​‍​‌‍‍‌‌​​‍​‌‌‌‍‌‍​‌​‍‍‍‌‌‌⁪Required⁪⁪";
	var RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON = "⁪⁪⁪‌​​​‌‌​‌​‍​​‍‍‍​‍‌​‍​‌‍‌‌‌‍‍​​‌‍‌​‍​‌​​‌‌⁪Decline⁪⁪";
	var SEGMENTEDBUTTON_ARIA_DESCRIPTION = "⁪⁪⁪‌‌‍‍​‌‍‍‌‍‌‍‍‌‌‍‌‌‍‌‍‌​‌​‌​​​​‍​‍‌‌​​‌‍​⁪Segmented button group⁪⁪";
	var SEGMENTEDBUTTON_ARIA_DESCRIBEDBY = "⁪⁪⁪‌‌‌​‌​‌‍‍‍​​‌‌​‌‌‍‍​‌‌‌​‍‌‍‌‌‌‍​‍​‍​​‌​‍⁪Press SPACE or ENTER to select an item⁪⁪";
	var SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION = "⁪⁪⁪‌‌‌‌‍‍​‍‍​​‍​‍‌‍​‍​​‍‍​‍​‍‍‍‍‍​‌​‍‍​‌‍‌‌‍⁪Segmented button⁪⁪";
	var SLIDER_ARIA_DESCRIPTION = "⁪⁪⁪‌‍‌​‌​‍​‍‍​​‍‍‍‌‌​‌​‌‍‌‍‍​​​​‍‍​‍​‌‍‌‌​‍⁪Slider handle⁪⁪";
	var LOAD_MORE_TEXT = "⁪⁪⁪‌‌​‌‍​​‌‌‍‍​‌​​‌​​‍​​‍‍‌‌​‌‍​​​‌‌​​‍​​​‌‍⁪More⁪⁪";
	var TABLE_HEADER_ROW_INFORMATION = "⁪⁪⁪‌​​‍​‌‌‍​​‌‌​‍‌‍‍‍​‍​​‍‍‍‍‍‌‌‍​‌‍​‌‍‍‍‍‌​⁪Header Row 1 of ​​​{0}‌‌‌⁪⁪";
	var TABLE_ROW_POSITION = "⁪⁪⁪‌​​‍​‍‌​‌‍‌‍‌‍‍‌​‍​‍‌​‍​‌‍‍​​‍‍‌‍​​‌​‍‌‌‌⁪​​​{0}‌‌‌ of ​​​{1}‌‌‌⁪⁪";
	var TABLE_GROUP_ROW_ARIA_LABEL = "⁪⁪⁪‍‍‌​‍‍‌‍‌‍​​‍​‍‌‌​‌‌​‍‍‌‍​‍​‍‍‍‌‍‌​​​‌‌‍⁪Group Header Row⁪⁪";
	var ARIA_LABEL_ROW_SELECTION = "⁪⁪⁪‍‌​​‌‍‍‍​‍​​‍‍‌​​‌‌‌​​‍‍​‌‌‌‌‌‍‍‌‌‌‍​​‍‍⁪Item Selection⁪⁪";
	var ARIA_LABEL_SELECT_ALL_CHECKBOX = "⁪⁪⁪‌​‍‍‍‍​‌‌‍‌​‍​‍​‍‍‍​​‍​‌‍‌‍‍‍‌‌​‍‍​‍‍‍​‍⁪Select All Rows⁪⁪";
	var ARIA_LABEL_EMPTY_CELL = "⁪⁪⁪‌​‍​​‍‍‍‌​​‍​​​​‍​‍‌‌‌‍‍‌‍‌‍‍‍‍‍‌​‌‌​​‍⁪Empty⁪⁪";
	var TAB_ARIA_DESIGN_POSITIVE = "⁪⁪⁪‍‍​‌‍​​​‌​‍‍‍‍‍‌​‍‍‌‍‌‌‌‍‌​‌‍‌‌‌‌​​‍​‌​​⁪Positive⁪⁪";
	var TAB_ARIA_DESIGN_NEGATIVE = "⁪⁪⁪‍‌‌‍‍‌‍​‍‍‌‌‌‍​‌​‍​‌‍‌‍‌​​‍‍‌‍​‍‍​‌​‍​‌‍⁪Negative⁪⁪";
	var TAB_ARIA_DESIGN_CRITICAL = "⁪⁪⁪‌​‍‌‌‍‌‍​‌‍​​‌‍‍‌​​‍​‌​‌​‌​​‍‌‍‌​‍​‍‍‍‍‍​⁪Critical⁪⁪";
	var TAB_ARIA_DESIGN_NEUTRAL = "⁪⁪⁪‍‍​‌​‍‌​​‌‍​​‌‌​‍‌​‌​​​​‍​‌‌‌‌‍‍​​‌​​​‍‌⁪Neutral⁪⁪";
	var TAB_SPLIT_ROLE_DESCRIPTION = "⁪⁪⁪‌‌​​​​‌​​​‍​‌‍​​​‌‍​‍‌‍‌‍‌​​‍​​​‌​​​​‌‍⁪Tab with Subitems⁪⁪";
	var TABCONTAINER_NEXT_ICON_ACC_NAME = "⁪⁪⁪‍​​‍‍‍‍‍​​‍‍‌‍‌​‌‍‌‌​​‍‍‌‌‍‍‌​​​​‍‌‌​‍‌​⁪Next⁪⁪";
	var TABCONTAINER_PREVIOUS_ICON_ACC_NAME = "⁪⁪⁪‌‌‌​‌‌‍​​​‍‍​‌‍‌​​​‍​‌​​​​​‍​​‍‌‍‍‍‍‌‍‌‌‌⁪Previous⁪⁪";
	var TABCONTAINER_OVERFLOW_MENU_TITLE = "⁪⁪⁪‍​‍‌‌​‌​‍​‌​​​‍‌‍‌‍‌​​‍​​​‍‌‍​‌​‍​‌‌​‌​‌⁪Overflow Menu⁪⁪";
	var TABCONTAINER_END_OVERFLOW = "⁪⁪⁪‌‌‍‌​​‌‍‌‌​‌‌​‌‍‍‍​‍​‍‌‍‌​‍​​​​​‍​‍​‍​‍​⁪More⁪⁪";
	var TABCONTAINER_POPOVER_CANCEL_BUTTON = "⁪⁪⁪‌​‌‌‍‍‍‌‍‌‍‍‍‍‍‌‍‌‍‍​​​​​‍​‌‍‍​‌‍‍​‌‍​‌‌​⁪Cancel⁪⁪";
	var TABCONTAINER_SUBTABS_DESCRIPTION = "⁪⁪⁪‍‌‍​‌​‍​​‍‌‌‍​‍​‍​‌‍‍‍‌​​‍‍‍‌‍‌​‍‌​‍‍​​‌⁪Press down arrow key to open subitems menu⁪⁪";
	var TEXTAREA_CHARACTERS_LEFT = "⁪⁪⁪‌‌‌‌‍‌​​​‌​‌​‌‍‍‌‌‌​‌​‍‌‌​‌‍​​​‍‌‍‌​​‌‌​​⁪​​​{0}‌‌‌ characters remaining⁪⁪";
	var TEXTAREA_CHARACTERS_EXCEEDED = "⁪⁪⁪‌​‍​​‌​​‌​​‌‍​‍‍‌‍‍​‌‍‍​​​​​‍‍‌​‌​​‍‌‍‌⁪​​​{0}‌‌‌ characters over limit⁪⁪";
	var TIMEPICKER_HOURS_LABEL = "⁪⁪⁪‍​‌‍​‌‌​​​‍‌‌​‌‌‌‍‍‍‍‍‌‍‌​​‍‍‍‍‍‌‍‌​‌‍‍​⁪Hours⁪⁪";
	var TIMEPICKER_MINUTES_LABEL = "⁪⁪⁪‍​‌​​​​‍‍‌‌‌​​​‌‍​​‌‍​‍​‌​‌‍‌​​‍‍​‍‌​‍‍⁪Minutes⁪⁪";
	var TIMEPICKER_SECONDS_LABEL = "⁪⁪⁪‌​​‌​‌​‍​‌‌​‌​​‌​‌‌​‌​‌​​​‌‌​‍‍​‌‍​​‍‍​​⁪Seconds⁪⁪";
	var TIMEPICKER_SUBMIT_BUTTON = "⁪⁪⁪‌​‍‍​‍‌‌‌‌​‍‌‍​‌‍​‌‍‍‌‌‌​‌‍‍​​‌​‌‌‍‌‍‍​‍​⁪OK⁪⁪";
	var TIMEPICKER_CANCEL_BUTTON = "⁪⁪⁪‌‌‌‌‌‍‍‍‍‌​‍‍​‌‍‍‌‍‌‌‌‌‍​‌‌​‌​​​‍‍‍‍​‍​‌‍⁪Cancel⁪⁪";
	var TIMEPICKER_INPUT_DESCRIPTION = "⁪⁪⁪‌‌​‌‍​‌‌​​‍​‍‍‍‌‌‍‌​‍‍‍‍​‌‍‍‌‍‌​‍‌‍‍‌‌​‍⁪Time Input⁪⁪";
	var TIMEPICKER_POPOVER_ACCESSIBLE_NAME = "⁪⁪⁪‌‌​‍​​‍‌‍‍‍‍​‍​‍‍‌‌​‍‌‍‍‌​‌‌‌‍‌‌‍‌‍‌‍​​‌⁪Choose Time for ​​​{0}‌‌‌⁪⁪";
	var TIMEPICKER_CLOCK_DIAL_LABEL = "⁪⁪⁪‌‍‍‌‌‍‍​‍​‍‌‌​‍‌​‍‌​‌‌​‍​‍‍​​‍‍​‍​‍‍‌​‌‌⁪Clock Dial⁪⁪";
	var TIMEPICKER_INPUTS_ENTER_HOURS = "⁪⁪⁪‌‍‍‍‍‍​‌‌​‍‌​​‌‍‌‌‍​‍‌​‌​​​​‌‍‌‍​​​​​​⁪Please enter hours⁪⁪";
	var TIMEPICKER_INPUTS_ENTER_MINUTES = "⁪⁪⁪‌‌‍​‌​‌‍​‍‌‌​​​​‌​‌​‍​‌​​‌​‍‍‍‍‌‍‍​‌‌‌​⁪Please enter minutes⁪⁪";
	var TIMEPICKER_INPUTS_ENTER_SECONDS = "⁪⁪⁪‌​‍​‍​‍​​​‌​‍‍​‍‍​​‍‍‍‍‍‍​‌​‌​‌‌‌‌​‌​‌‌‌⁪Please enter seconds⁪⁪";
	var DURATION_INPUT_DESCRIPTION = "⁪⁪⁪‌‍‍‌‍​‌​​‍​​‌‍‌‌‌​‍‍‌‌​​​‍‌​‌​‍‌​​​‍‍​​​⁪Duration Input⁪⁪";
	var DATETIME_PICKER_DATE_BUTTON = "⁪⁪⁪‌​​​‍‌‌​‍​‌‍‍‍‌‌​‌‍​‌‍‌‍​​​‍‍‍‍‌​‌‍​‌‌‌‌‍⁪Date⁪⁪";
	var DATETIME_PICKER_TIME_BUTTON = "⁪⁪⁪‌​‌‌‌‌‌‌‌​​‍‌‍‍‍‍‌​‌‍‍‍‍‌​‌‍‍​‌​‍​​‍​‌‍⁪Time⁪⁪";
	var TOKEN_ARIA_DELETABLE = "⁪⁪⁪‍‌‍​‌‍‍‍‍‍‌‌‌‍‌‍​‌‍‍‌​​‍​​​‌‌‌‍​​‍‌‍​​​‍⁪Deletable⁪⁪";
	var TOKEN_ARIA_REMOVE = "⁪⁪⁪‌‌‍​‍‌‍‍‌‍‍‌‌‍‌‍‌‌‌​‍​‌‌‌‌‍‌‍‌‌‍‍‍‌​​​​​⁪Remove⁪⁪";
	var TOKEN_ARIA_LABEL = "⁪⁪⁪‍‌‍‍‌‍‌​‌‌‍‍​​​‍​​​​​‌​‍‍‌‍‌​‌​‍‍​​​‍‍​⁪Token⁪⁪";
	var TOKENIZER_ARIA_CONTAIN_TOKEN = "⁪⁪⁪‌‌​‌‌​‍‍‍‌‌‌‍‍​​‍‍​​​‍‌​​​‍‍‌​‌​​​‍‍​​​​⁪No Tokens⁪⁪";
	var TOKENIZER_ARIA_CONTAIN_ONE_TOKEN = "⁪⁪⁪‌​‍‍‍‍‌​‌​‍​‌‌‌‌​‌‌‌‌​​‍‍‌​‍‍​‍​‍‌​‍‌‌‍‍​⁪Contains 1 token⁪⁪";
	var TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS = "⁪⁪⁪‌‌‌​‍‌​‌‍​‌​​‌‍​‌‌‍‍​‌‌​‍‌‌‌​‌‍​‍‍​‍‌​​‍‌⁪Contains ​​​{0}‌‌‌ tokens⁪⁪";
	var TOKENIZER_ARIA_LABEL = "⁪⁪⁪‍​​‍‍​‌​‍​​‍‌​‌​‌‌​​​‍​‌​​‌‌‌​‍‌​‍​​‍‍‍​⁪Tokenizer⁪⁪";
	var TOKENIZER_POPOVER_REMOVE = "⁪⁪⁪‌‍​‍​‍‌​​‌‍‌​​‍‌​​‍​‍​‌​‌‍​‍‌​​‍‍​‌‍​‌​​⁪All items⁪⁪";
	var TOKENIZER_SHOW_ALL_ITEMS = "⁪⁪⁪‍​‍‌‌‌​​‍‌‍‍‌​‍​‌‌‌‍‌‌‌‌‍‌‌​‍‍‌​​‍​‌‍‍​‌⁪​​​{0}‌‌‌ Items⁪⁪";
	var TOKENIZER_CLEAR_ALL = "⁪⁪⁪‌‌​‍‍​‍‍​‍‍​​​‌​‍​‌​‍‍​‌​‌‌‍​‍​​​‍​​‌‌​​‍⁪Clear All⁪⁪";
	var TOKENIZER_DIALOG_CANCEL_BUTTON = "⁪⁪⁪‌‌‌‍​‌​‍​‌​‌​​‌‌‌​‌​‍​‌​‌‌‍‍​​‍​‍‌‍‍‍​​‌⁪Cancel⁪⁪";
	var TOKENIZER_DIALOG_OK_BUTTON = "⁪⁪⁪‍‌‍‍‍‍​​‌​​‌​​​‌​‍‌​‌​‍‍‍‌‌‍‍​​‍‍‌​​​‌‍‌⁪OK⁪⁪";
	var TREE_ITEM_ARIA_LABEL = "⁪⁪⁪‌‌‌​​‌​​​‍‍‌‌​‍‍‍​‍‌​‍​​‍‌‌‍‌‌‌‌‌​‍‌‌‍​‍​⁪Tree Item⁪⁪";
	var TREE_ITEM_EXPAND_NODE = "⁪⁪⁪‍‍‍‍​​‍​‌‍‍​‌‍‍​‍‌‍​​​‌​‍‍‌‌​​‌‌‍‌​‍‌‌​‍⁪Expand Node⁪⁪";
	var TREE_ITEM_COLLAPSE_NODE = "⁪⁪⁪‌‌​‌‌​‌‍‌‌‍‍‌​​​‍​‌‌‌‍‍‍‌‍‌‍‌​‍‌‌​​‍​‌‍‍⁪Collapse Node⁪⁪";
	var VALUE_STATE_TYPE_ERROR = "⁪⁪⁪‌​​‌‍​​‌‍‍‌​‍​​‍​​‌‍​​‍‍​‍‌‌‍‌‌‍​‍​‍‌​‍‍⁪Value State Error⁪⁪";
	var VALUE_STATE_TYPE_WARNING = "⁪⁪⁪‍​​‌‍‌‍‍‍‍‌‍​​​‌​​‍‍‍​‌‌‍‍‌‌‍​​‍​​‌‌​​‌​⁪Value State Warning⁪⁪";
	var VALUE_STATE_TYPE_SUCCESS = "⁪⁪⁪‌​‍‍‌‍‍‌​‍‌‌‍​‍​‌‌‍​‍‌‌‍​‌​​‌‌‍​‌‌‍‍​‌‍​⁪Value State Success⁪⁪";
	var VALUE_STATE_TYPE_INFORMATION = "⁪⁪⁪‌​‌‌‍‌​​‍‍‌‍‍‌‍‍‌‌​‌‍‌‌‌‍​‌​‍‌‌‍‌‌‌‍‍‍‍⁪Value State Information⁪⁪";
	var VALUE_STATE_ERROR = "⁪⁪⁪‍‌‍‌​‍‌‌‍‍​‌​​‌​‌‌‌‌‌‌​​​‍‌‌‍​‍‌‌‍‌‍‍​​⁪Invalid entry⁪⁪";
	var VALUE_STATE_WARNING = "⁪⁪⁪‌​‌‌​‍‍​​‍‍​‌‍​​​​​‌‌​​​‍​‌‍‍‍‌‍‍‌​‍​​‌​​⁪Warning issued⁪⁪";
	var VALUE_STATE_INFORMATION = "⁪⁪⁪‌​‍‍‍‍‍‌‌‍​​‍​‍​‌‌‍‌​‌​‌‍‌‍‌​‍‍‌‌‌‍​​​‌​‍⁪Informative entry⁪⁪";
	var VALUE_STATE_SUCCESS = "⁪⁪⁪‌‍​‍‌‌​​​‌‌‍​‌​‍‌​​​‌​‍‍‌‍‌​‍‌​​‌​‍‍‍‌‌⁪Entry successfully validated⁪⁪";
	var VALUE_STATE_LINK = "⁪⁪⁪‍​‌‌‍​​‌​‍​​‍‍​‌‌‍​‌​‍‍​​‍​‌‍‌‌‍‌​‌‌‍‍‌​⁪To move the focus to the link, press Ctrl+Alt+F8⁪⁪";
	var VALUE_STATE_LINK_MAC = "⁪⁪⁪‍‍‌‌‍​​​‌‌​‍‌‍‍‌‌​​‌‍‍‍‌​​‌‌‌​‌‍‍​​‍‍‍‌​⁪To move the focus to the link, press Cmd+Option+F8⁪⁪";
	var VALUE_STATE_LINKS = "⁪⁪⁪‍‍​‍‍‌‌‌​‍‌​‍‍‌​​‍​​​‍​​​​‍‌‌‌‍​‌​​‍‌‍‍​⁪To go to the first link, press Ctrl+Alt+F8. To move to the next link, use Tab⁪⁪";
	var VALUE_STATE_LINKS_MAC = "⁪⁪⁪‌‌‌‌‌​​​​​​​‌​​​​‍‍‌‌‍​‌​‌​​‌‌‍​‍‍‌‍‍‍​‍⁪To go to the first link, press Cmd+Option+F8. To move to the next link, use Tab⁪⁪";
	var CALENDAR_HEADER_NEXT_BUTTON = "⁪⁪⁪‌‌​​‌‍​‍‍​‌‍‍‌‌‍​​‍‍​‌‍​‌‌‌​‍‍‌‍​‌‌‌‍‌‍‍‌⁪Next⁪⁪";
	var CALENDAR_HEADER_PREVIOUS_BUTTON = "⁪⁪⁪‍​‌‍​‌‌​​‍​‌​​‌‍‌‍​‍‍‍‌‌‌‌‍‍‌‍‍​‌‌‌‍‍‍​‍⁪Previous⁪⁪";
	var DAY_PICKER_WEEK_NUMBER_TEXT = "⁪⁪⁪‌‌​‌​‌‌​‍‌‌​​‌‍‍‍‌‌‌​‍‍​​‌​‌​​​‌‌​‍‌‌‌‌‌⁪Week Number⁪⁪";
	var DAY_PICKER_NON_WORKING_DAY = "⁪⁪⁪‍‌​​​‍‌​​​​‍‌​​​‍‌‌‍‍‌​​​​​​​‌‌​‌‌​‌​‍‌‌⁪Non-Working Day⁪⁪";
	var DAY_PICKER_TODAY = "⁪⁪⁪‌​‌​‌‍‌‍‍‌‌​‌‍‌‍​‍​‌‍​‌‌​‌‌‍‌‌‌‍‌​‌​‍​‌‌​⁪Today⁪⁪";
	var MONTH_PICKER_DESCRIPTION = "⁪⁪⁪‌‌​‌​‍‌‌‌​​‍​‍‌‌‍‍‌‌‍‌‍​‌‌​‌‌​​‌‌‍‍‍​​‌⁪Month Picker⁪⁪";
	var YEAR_PICKER_DESCRIPTION = "⁪⁪⁪‌‍‌​​​‍‌‌‍​‌‍‍‍​‌​‌​‍​​‍‍‌​​‍‌‌​‍‌‍​‌‍‌⁪Year Picker⁪⁪";
	var YEAR_RANGE_PICKER_DESCRIPTION = "⁪⁪⁪‌‌​​‌‍‌​‌​‍‌​‌​‍‌‍‍​‍​​‌‌​‌​‌‍‌​‍‍‌‍​​‌‍⁪Year Range Picker⁪⁪";
	var SLIDER_TOOLTIP_INPUT_DESCRIPTION = "⁪⁪⁪‌‌‍‍​‌‍​‍‌‍‌​​‍​‍‍​‍‌‍​‌​​‍‍‌‌‌‍‍‍‌‌‌‍‌‍⁪Press F2 to enter a value⁪⁪";
	var SLIDER_TOOLTIP_INPUT_LABEL = "⁪⁪⁪‌​‌​​‍‍‍‌‍​‍‌‌‍‍‍‍​‌​‍​​​‌​​‌​‍‌​‍‍‌‌​‌⁪Current Value⁪⁪";
	var STEPINPUT_DEC_ICON_TITLE = "⁪⁪⁪‌‌‌​​​‍​‍‍‍​‌‍​‌‍‌​‌‍​‍‍​‌​‍‍​​‍‌‌‍‌‍‍​‌​⁪Decrease⁪⁪";
	var STEPINPUT_INC_ICON_TITLE = "⁪⁪⁪‌​‍‍‍​‍​‌‌‌‍‍‌​​​​‍‍​​​‍‍‌‍​‍‍‌‍​‌‌‍‍‍​​‍⁪Increase⁪⁪";
	var SPLIT_BUTTON_DESCRIPTION = "⁪⁪⁪‌‌‍‍‌‌​‍​​‌​‌‍​‌‍‌​‍‍​‌​‍‌‌‌‍‌‍​‌‌​​​​‌⁪Split Button⁪⁪";
	var SPLIT_BUTTON_KEYBOARD_HINT = "⁪⁪⁪‌‌​​​​​​​‍‌‍‌‌‍​‌‍‍‌‌​‌​​‌‌‌‍‍​‌​‍‌‌​‍‍‌‌⁪Press Space or Enter to trigger default action and Alt + Arrow Down or F4 to trigger arrow action⁪⁪";
	var SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP = "⁪⁪⁪‌‍​‌​‍‌‍‌‍​‍​‍​​‌‌‍​‌​​‍‌‍‍‌‌‌‍‍‍‍‍‍‌‌‌⁪Open Menu⁪⁪";
	var MENU_BACK_BUTTON_ARIA_LABEL = "⁪⁪⁪‍‍‍‍‍‌‌‌‍‌‌​‌‌​‌‌‍‌‍​‌‌​​​​‌‌‌​‍​‌​‌‍‌‍⁪Back⁪⁪";
	var MENU_CLOSE_BUTTON_ARIA_LABEL = "⁪⁪⁪‌‌​‌​​‍‌‌‍​‍‌‌​​‌‌​​‌‌‍‍​‌‌​‍‌‌​​​​‌‍‍​​⁪Decline⁪⁪";
	var MENU_POPOVER_ACCESSIBLE_NAME = "⁪⁪⁪‌​‍​‍​​​‌​‍‍‍‍‌‍​‌‌‍​‌​‌‌‌‍​‌​‍​‍‍​‌​‍​‍‌⁪Select an option from the menu⁪⁪";
	var MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME = "⁪⁪⁪‌​‍‌‌​‍‌‍​‍​​‍‌​‌​‍‍‌‍‌​‍‍‌‍‍‌​​‌‌‌‌‍‍‌‍‍⁪Contains Non-Selectable Items⁪⁪";
	var MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME = "⁪⁪⁪‌​‌​‌​‌‌‍‍‍‌‌‌‍‍‍‌‌‍​​‌​‍‌​‌​‍​‌‌‍‍‍‍‌‌‍⁪Contains Selectable Items⁪⁪";
	var MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME = "⁪⁪⁪‍‌​‍‍​‍‍‍‌‍‍‌‍‍‍‍‌‍‌‍‌​‍‌‌‌‍‌‍​‌‌‍‍‌‌​⁪Contains Multi-Selectable Items⁪⁪";
	var DIALOG_HEADER_ARIA_ROLE_DESCRIPTION = "⁪⁪⁪‍‌‌‍​‌‌‍‌‌​‍​​​‌‌​‍​‍‌‌‍‍‌‍‍‌​‍​‌​‌‌‍‍‍‍⁪Interactive Header⁪⁪";
	var DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE = "⁪⁪⁪‍‍​‍‍‍‌‍‍‍‌‍‍‌‍‌‌‌‍‌‍​​‍‍‌​‌‍‌‍​‍​‌‌​‍‍​⁪Use Shift+Arrow keys to resize⁪⁪";
	var DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE = "⁪⁪⁪‍‍‌‍‌‍‍​‌‍‍‌‌​​‌​‌‍​​‌‌‍‍‍‌​​​​‍‌‍‍‌​‌​​⁪Use Arrow keys to move⁪⁪";
	var DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE = "⁪⁪⁪‍‌​‌‌​‍​‌‌‍​​​‌​‍‍‍‌‍‍‍‌‍‌​‌‍‍‌‍‌‍‍​‌​‍​⁪Use Arrow keys to move, Shift+Arrow keys to resize⁪⁪";
	var LABEL_COLON = "⁪⁪⁪‌​‌‌‍‌‍‌‌‌‌‍‌‌‌​‌​​​‌​​​‍​‍​‌‍​​‍‍‌‌‍​‌‌⁪:⁪⁪";
	var TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL = "⁪⁪⁪‌​‌‌​‌​‌​‌‌​​​‌​​‍​​​‍‍‌‍‍‍‍​‍‍‌​‍‌‌​‍‌⁪Additional Options⁪⁪";
	var TOOLBAR_POPOVER_AVAILABLE_VALUES = "⁪⁪⁪‌​​‍‌‌​‍‌‍​​‌​​​‍‌​​‍‌​‌‍​‌​‌‌​‍​‍‌‍​‌​‌⁪Available Values⁪⁪";
	var FORM_ACCESSIBLE_NAME = "⁪⁪⁪‌​‍‍‍‍​‌​‌‌‌‍‌​‍‌​‍​​‍​​‌‌‍​‍‍​​​‌‌​‍‌‍‍‍⁪Form⁪⁪";
	var FORM_CHECKABLE_REQUIRED = "⁪⁪⁪‌​‍‌​​‍‍‌‍​‌‌‌‍​​‍‌‍​‌‌‍‌‍‌​‌​​‌‍‌​‌‌‍‍‌‌⁪Please tick this box if you want to proceed.⁪⁪";
	var FORM_MIXED_TEXTFIELD_REQUIRED = "⁪⁪⁪‌​‌‍‌​‍​​‌‍‌​​‌‍‌‌‌‌‌​‌‍‌‍​‌‌‍​‍​‍​​​‍‍‌⁪Please fill in this field or select an item in the list.⁪⁪";
	var FORM_SELECTABLE_REQUIRED = "⁪⁪⁪‌​​‍‌​​‌​‌‌​‌‍‍​​‍‌​​‌‍‌​‌​‍‌‍‌‍​‍‌‌​​‍​‍⁪Please select an item in the list.⁪⁪";
	var FORM_SELECTABLE_REQUIRED2 = "⁪⁪⁪‌​‍​‍‌‍‍​‌​‌‌‌​​​‍‍​‌​​‌‌‍‍‍​‍​‍‌‍‍​‍‍‍‌‌⁪Please select one of these options.⁪⁪";
	var FORM_TEXTFIELD_REQUIRED = "⁪⁪⁪‌​​‍‌‍‌‌‍‍‍​​‍‍​‌‌‌​‌‌‍‍‍‍​‍​‍‌‌‍​‍​‌​‌⁪Please fill in this field.⁪⁪";
	var TABLE_SELECTION = "⁪⁪⁪‌‍‍​​​‌‍‍​‌​​‍​​‍‍‍‍‍‌‍​​‍​‍‌​‌‌​‌‌‍‍‌​‍⁪Selection⁪⁪";
	var TABLE_ROW_SELECTOR = "⁪⁪⁪‌‍‌‌‌‌​‍‍‌‍​‍‌‍​​‍​‍​​​‌‍‌‍​​‍‌‍‌​​‌‍‍⁪Row Selector⁪⁪";
	var TABLE_NO_DATA = "⁪⁪⁪‌‌​‌‌‍‍​‍‌​‌‍​​​‍‍​‌‌‌‍‌​‍​​‌‍‌​​​​‌‌​‌‍​⁪No Data⁪⁪";
	var TABLE_SINGLE_SELECTABLE = "⁪⁪⁪‍​​‍‍‍‍‌​​‍‌​‍‌​‍‌‌‌‍‍‌‌​‌​‌‍‍‍‌‍​‌‍‍‌‌​⁪Single Selection Table⁪⁪";
	var TABLE_MULTI_SELECTABLE = "⁪⁪⁪‍‌​‌‍​‍‌‌​​‍‌‌‍‍‍‌‌‍‌‍‌​​​​​​​‌​‌‍‍‍​‍‌‍⁪Multi Selection Table⁪⁪";
	var TABLE_COLUMNHEADER_SELECTALL_DESCRIPTION = "⁪⁪⁪‌​​‍‍​​‍​‌​​‌​​‌‌‌​‍‍‍‌​​‌‍‌​‍​​‍‍​‌​‌⁪Contains Select All Checkbox⁪⁪";
	var TABLE_COLUMNHEADER_SELECTALL_CHECKED = "⁪⁪⁪‍‍‍​​‌‍​‍‍‍‌​‌‍​​​​‌​‍​​‌​‌‌‍‌‌​‌​‍​‌​‌⁪Checked⁪⁪";
	var TABLE_COLUMNHEADER_SELECTALL_NOT_CHECKED = "⁪⁪⁪‍‌‌‌‌‍​​‌‍‍‍‌‌‍‌‍‌‌‍​‍​‌‍​‍‌​‌‍‌‍​​‌‌​‌‌⁪Not Checked⁪⁪";
	var TABLE_COLUMNHEADER_CLEARALL_DESCRIPTION = "⁪⁪⁪‌‌​‌‍‌‌‌​‌​‌​‌‌‍​‌​‍‍​‌‌‍​​‍‌​‍​‌‌‌​‌‌‌‍⁪Contains Clear All Button⁪⁪";
	var TABLE_COLUMNHEADER_CLEARALL_DISABLED = "⁪⁪⁪‌‌‌‌‍​‍‌‍‌‍​​‌​​​‍‍​‍‍‌​‌​‌‍‌‌‍​​​‌‍​​‌​‍⁪Disabled⁪⁪";
	var TABLE_ROW_POPIN = "⁪⁪⁪‍‌‍​‌‍​‍‌​‍​‌‍​‌‌‍‍‍​​​​‍‍​​​‍‌​​‍​‌​‌‌‌⁪Row Popin⁪⁪";
	var TABLE_MORE = "⁪⁪⁪‌​​​‍​​​‍‍‍‌​‌​​‍​‌‍​‍​​‍‌‍‍‍‍​​​‍​‍​‍‌‍⁪More⁪⁪";
	var TABLE_MORE_DESCRIPTION = "⁪⁪⁪‌​​‌‍​‍‍​​‍‍​‍​​​‌‍​‌‌‌‍‌​‌‍​‍‍​‍‌‌​​‍‍​‌⁪To load more rows, press Enter or Space⁪⁪";
	var TABLE_ROW_ACTIONS = "⁪⁪⁪‌‌‍‍‍‍​‍‍​‌‌‌​‌‌‌‍‍‍‌‍​‍‍​‌‍‍​‍‌‌‍‌‌‍‍⁪Row Actions⁪⁪";
	var TABLE_NAVIGATION = "⁪⁪⁪‌‌​​‍​‌‍​​‌​​‌‍‌‌‌‍​‍‍​‍​‍‍‍‍‌‍‍‍‌‍​‌​⁪Navigation⁪⁪";
	var TABLE_GENERATED_BY_AI = "⁪⁪⁪‌​‌‌​​‌​​‌‍​‌​​​​​​​​‍‍‌​​​‍‍‍‌‌​​​‍‌‍​‍⁪Generated by AI⁪⁪";
	var TABLE_SELECT_ALL_ROWS = "⁪⁪⁪‌‍​‌‍​‍​​‍​​‌‌​‌‌​​‌‌‌‍‍​‍‍‍​‌​​‍​‍​‍‌​‌⁪Select All Rows⁪⁪";
	var TABLE_DESELECT_ALL_ROWS = "⁪⁪⁪‌​‌​​​​‍​​‍‌‌‌‌‍‌‌‌‍‌‌‌‍‌‌‌‌‍​‌​‌‌‍‌‌‌​​​⁪Deselect All Rows⁪⁪";
	var DYNAMIC_DATE_RANGE_YESTERDAY_TEXT = "⁪⁪⁪‌‌​‍‍‌‍​‌​‍‍​​​‍‌​‍‍​‍​‌‌​​‍‌‍​​​​​‍​​‌‍‍⁪Yesterday⁪⁪";
	var DYNAMIC_DATE_RANGE_TODAY_TEXT = "⁪⁪⁪‌‌‌​​‌‍‌​‍‌‌​‍‍‍‍‌‌‍​‌​‍‌‌‌‌​‍‍‍‍‌‌​‍​‌‌‌⁪Today⁪⁪";
	var DYNAMIC_DATE_RANGE_TOMORROW_TEXT = "⁪⁪⁪‌​‌‍‍​‍​‍‌‌​‌​‍‌‌‍‌​​‍​​‌​​‍‍‍​‌​‌‌​‍​​‍​⁪Tomorrow⁪⁪";
	var DYNAMIC_DATE_RANGE_DATE_TEXT = "⁪⁪⁪‌​‌‍‌​‌‍‌​‍‌‌​​‌‌‍​‍‌‍‌‌​‍‌​​​‌​​​​‍‍‌‍‌‍⁪Date⁪⁪";
	var DYNAMIC_DATE_RANGE_DATERANGE_TEXT = "⁪⁪⁪‌‌‌​​​​​‍‌​‌​‌​‌‍‍​​​‌‍​​​‍‌‍‍‌​‍‌‍‌​​​​⁪From / To⁪⁪";
	var DYNAMIC_DATE_RANGE_SELECTED_TEXT = "⁪⁪⁪‌​​‌‍​‍‍‌‍‍‍​‌​‍‍‍​​‍‍‍‍‌‍‍‍​​‍​​‍‌​‌‌​​​⁪Selected⁪⁪";
	var DYNAMIC_DATE_RANGE_EMPTY_SELECTED_TEXT = "⁪⁪⁪‍‍‍‍​​‌​‌‍‌‍​​‌‍‍‍‌‌‌‌‍​‌‌‍​‍‍‌​​‍‍‍‌‌‍⁪Choose Dates⁪⁪";
	var DYNAMIC_DATE_RANGE_NAVIGATION_ICON_TOOLTIP = "⁪⁪⁪‍‍‌​‌​‌‌​‌‍​​‍‌‌‍‍‍‍‌‍‍​​​‍​‍‍‌​‌‌​‍‌‌⁪Navigate Back⁪⁪";
	var TABLE_COLUMN_HEADER_ROW = "⁪⁪⁪‍​​​‍‌‌​‍‍‌​‍‌‌‍‌​‍‍‍‌​‌‍‌‌​‌‌‍‌‌​‍​​‌​‍⁪Column Header Row⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_DAYS_TEXT = "⁪⁪⁪‍‌‌‌‍‌​‌​‍‍‍‍​‍‍‌​‍‌​‍‍​‍​‍​‌‌‌‌‍‌​‍‍‍⁪Last X Days⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_DAYS_TEXT = "⁪⁪⁪‌​​‌‍‍‍‍‌‌​​‌‌‍‌‌​‌‌‌​​‍​‍‌​‌‌​‌‍​‍​​‍‌‌‍⁪Next X Days⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_WEEKS_TEXT = "⁪⁪⁪‍‍‌‌​​‌‍​‍‍‌‌‌​​​​‌‍​‌‌‍​​‍​‌‌‍​‌​‌‌‌‍‍⁪Last X Weeks⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_WEEKS_TEXT = "⁪⁪⁪‍‍​‌‍‍​​‌‍‌​‍‌​‍‌​‍‍‍‍‌​​‌‍​‍‌​‌‌‌‍‌​‌​​⁪Next X Weeks⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_MONTHS_TEXT = "⁪⁪⁪‌‌​​​‍‍‌​‍‌‌‍​​‌‌​‍‌‌‍‌​‌‌‍‍‍​​‍‌‌‍‍​‍‍‌‌⁪Last X Months⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_MONTHS_TEXT = "⁪⁪⁪‌‌‌​‍‍‌​‌‌‌‍​​‍​‍​‍‌​‌‌‍‌‍‌‌‍‌​‌‌‌​‌​​‍​⁪Next X Months⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_QUARTERS_TEXT = "⁪⁪⁪‌‍‍‍​‍‍​‍‍‍‍‍​‌​‌‍‍‌‌​‍​‍​‌‍‍‍‍​‍​‍‌‌‌​‍⁪Last X Quarters⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_QUARTERS_TEXT = "⁪⁪⁪‌​‌‌‍‌‍​‍​​​​‌‌‌‍‍‍​‌‍‌‌‌​‍​‍‌‍‌​​‍‍​‍‍‌‌⁪Next X Quarters⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_YEARS_TEXT = "⁪⁪⁪‌​​‍​‍‌‍​‍​‍‌​‌​​‌‍​‍‍‌​‌‍‌‍‍‌‌​‌​‍​‍​‌‍​⁪Last X Years⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_YEARS_TEXT = "⁪⁪⁪‍‌‍‍‍​‌‌‍‌‍‍​‌​‍​‌‍‍‍​‍‌​​​‌‌​‍​‍‍‌​​​⁪Next X Years⁪⁪";
	var DYNAMIC_DATE_RANGE_VALUE_LABEL_TEXT = "⁪⁪⁪‌‌‌‍‌​‍‍‍‌‌​​‍‌‍​‍​‍‌​‌‍‌‌​​‌‍‍‍‍‌​‌​‌‍⁪Value for X⁪⁪";
	var DYNAMIC_DATE_RANGE_UNIT_OF_TIME_LABEL_TEXT = "⁪⁪⁪‍​‍​‌‍‌‍‍‌​​‌​‌‍​​​‍‌‍​‍‍​​​‌‍‌‍‍‍​‌‍​‌⁪Unit of Time⁪⁪";
	var DYNAMIC_DATE_RANGE_DAYS_UNIT_TEXT = "⁪⁪⁪‌​‍‌​‍​​​​‌​‌‌​‍‌‍‌‍‍‍‍‌​‌​‍‌‍‌‍​‌‌‌‍‍‌​‌⁪Days⁪⁪";
	var DYNAMIC_DATE_RANGE_WEEKS_UNIT_TEXT = "⁪⁪⁪‍‌​‍‌​‌‍‍‍‌‌​‌‍​‌​​​‍‌​‌​​‌‍‍‌‌​​‍‌‍‍​​‌⁪Weeks⁪⁪";
	var DYNAMIC_DATE_RANGE_MONTHS_UNIT_TEXT = "⁪⁪⁪‌‍​‍‍‍‌‍​‌‍‌​‌​‌‌‌​​‌‍‍‌‍​​‍‍‌‌‌‌​​​‌​‍⁪Months⁪⁪";
	var DYNAMIC_DATE_RANGE_QUARTERS_UNIT_TEXT = "⁪⁪⁪‌​​‍‌​‌‌‍​‌‌​​​​‍‍‌‍‍​‌‌​‌‌‍‌‌​‍​‌​​​‌‌‍‍⁪Quarters⁪⁪";
	var DYNAMIC_DATE_RANGE_YEARS_UNIT_TEXT = "⁪⁪⁪‌​​​‌​​‍‍‌‍‌​‍​‍‌‍‌​​​‍​‍‍​‍​‌‌‌‌​‍‍​‌​‍​⁪Years⁪⁪";
	var DYNAMIC_DATE_RANGE_LAST_COMBINED_TEXT = "⁪⁪⁪‌‌‌‍‍‍‌‌​‌‌​‌‍​‍​​‍‍‍​‍​​‌​‍‍​‍​​​‍​‍​​‌⁪Last X ​​​{0}‌‌‌ (Included)⁪⁪";
	var DYNAMIC_DATE_RANGE_NEXT_COMBINED_TEXT = "⁪⁪⁪‌‌‌​‌‍‌‍​​​​‍‍‍‍‍‍‍‌‌​‍‍‌‌​​​‍‌​‍‍​‍‌‍​‍‌⁪Next X ​​​{0}‌‌‌ (Included)⁪⁪";
	var DYNAMIC_DATE_RANGE_INCLUDED_TEXT = "⁪⁪⁪‍​​​​‍‍‌‌‌‌‌‍‍‌​​‍‌‍‌​‍‍‍‌‍‌​‌​‍‌‍‍​‍‍​​⁪(Included)⁪⁪";
	var messagebundle_en_US_saprigi = {
		ARIA_LABEL_CARD_CONTENT: ARIA_LABEL_CARD_CONTENT,
		ARIA_ROLEDESCRIPTION_CARD: ARIA_ROLEDESCRIPTION_CARD,
		ARIA_ROLEDESCRIPTION_CARD_HEADER: ARIA_ROLEDESCRIPTION_CARD_HEADER,
		ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER: ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER,
		AVATAR_TOOLTIP: AVATAR_TOOLTIP,
		AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL: AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL,
		AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL: AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL,
		AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL: AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL,
		AVATAR_GROUP_ARIA_LABEL_GROUP: AVATAR_GROUP_ARIA_LABEL_GROUP,
		AVATAR_GROUP_MOVE: AVATAR_GROUP_MOVE,
		TAG_DESCRIPTION_TAG: TAG_DESCRIPTION_TAG,
		TAG_ROLE_DESCRIPTION: TAG_ROLE_DESCRIPTION,
		TAG_ERROR: TAG_ERROR,
		TAG_WARNING: TAG_WARNING,
		TAG_SUCCESS: TAG_SUCCESS,
		TAG_INFORMATION: TAG_INFORMATION,
		BREADCRUMB_ITEM_POS: BREADCRUMB_ITEM_POS,
		BREADCRUMBS_ARIA_LABEL: BREADCRUMBS_ARIA_LABEL,
		BREADCRUMBS_OVERFLOW_ARIA_LABEL: BREADCRUMBS_OVERFLOW_ARIA_LABEL,
		BREADCRUMBS_CANCEL_BUTTON: BREADCRUMBS_CANCEL_BUTTON,
		FORM_SELECTABLE_AVALIABLE_VALUES: FORM_SELECTABLE_AVALIABLE_VALUES,
		BUSY_INDICATOR_TITLE: BUSY_INDICATOR_TITLE,
		BUTTON_ARIA_TYPE_ACCEPT: BUTTON_ARIA_TYPE_ACCEPT,
		BUTTON_ARIA_TYPE_REJECT: BUTTON_ARIA_TYPE_REJECT,
		BUTTON_ARIA_TYPE_EMPHASIZED: BUTTON_ARIA_TYPE_EMPHASIZED,
		BUTTON_ARIA_TYPE_ATTENTION: BUTTON_ARIA_TYPE_ATTENTION,
		BUTTON_BADGE_ONE_ITEM: BUTTON_BADGE_ONE_ITEM,
		BUTTON_BADGE_MANY_ITEMS: BUTTON_BADGE_MANY_ITEMS,
		CAL_LEGEND_TODAY_TEXT: CAL_LEGEND_TODAY_TEXT,
		CAL_LEGEND_SELECTED_TEXT: CAL_LEGEND_SELECTED_TEXT,
		CAL_LEGEND_WORKING_DAY_TEXT: CAL_LEGEND_WORKING_DAY_TEXT,
		CAL_LEGEND_NON_WORKING_DAY_TEXT: CAL_LEGEND_NON_WORKING_DAY_TEXT,
		CAL_LEGEND_ROLE_DESCRIPTION: CAL_LEGEND_ROLE_DESCRIPTION,
		CAROUSEL_OF_TEXT: CAROUSEL_OF_TEXT,
		CAROUSEL_DOT_TEXT: CAROUSEL_DOT_TEXT,
		CAROUSEL_PREVIOUS_ARROW_TEXT: CAROUSEL_PREVIOUS_ARROW_TEXT,
		CAROUSEL_NEXT_ARROW_TEXT: CAROUSEL_NEXT_ARROW_TEXT,
		CAROUSEL_ARIA_ROLE_DESCRIPTION: CAROUSEL_ARIA_ROLE_DESCRIPTION,
		COLORPALETTE_CONTAINER_LABEL: COLORPALETTE_CONTAINER_LABEL,
		COLORPALETTE_POPOVER_TITLE: COLORPALETTE_POPOVER_TITLE,
		COLORPALETTE_COLOR_LABEL: COLORPALETTE_COLOR_LABEL,
		COLOR_PALETTE_DIALOG_CANCEL_BUTTON: COLOR_PALETTE_DIALOG_CANCEL_BUTTON,
		COLOR_PALETTE_DIALOG_OK_BUTTON: COLOR_PALETTE_DIALOG_OK_BUTTON,
		COLOR_PALETTE_DIALOG_TITLE: COLOR_PALETTE_DIALOG_TITLE,
		COLOR_PALETTE_MORE_COLORS_TEXT: COLOR_PALETTE_MORE_COLORS_TEXT,
		COLOR_PALETTE_DEFAULT_COLOR_TEXT: COLOR_PALETTE_DEFAULT_COLOR_TEXT,
		COLORPICKER_ALPHA_SLIDER: COLORPICKER_ALPHA_SLIDER,
		COLORPICKER_HUE_SLIDER: COLORPICKER_HUE_SLIDER,
		COLORPICKER_HEX: COLORPICKER_HEX,
		COLORPICKER_RED: COLORPICKER_RED,
		COLORPICKER_GREEN: COLORPICKER_GREEN,
		COLORPICKER_BLUE: COLORPICKER_BLUE,
		COLORPICKER_HUE: COLORPICKER_HUE,
		COLORPICKER_SATURATION: COLORPICKER_SATURATION,
		COLORPICKER_LIGHT: COLORPICKER_LIGHT,
		COLORPICKER_TOGGLE_MODE_TOOLTIP: COLORPICKER_TOGGLE_MODE_TOOLTIP,
		COLORPICKER_ALPHA: COLORPICKER_ALPHA,
		DATEPICKER_OPEN_ICON_TITLE: DATEPICKER_OPEN_ICON_TITLE,
		DATEPICKER_DATE_DESCRIPTION: DATEPICKER_DATE_DESCRIPTION,
		DATETIME_DESCRIPTION: DATETIME_DESCRIPTION,
		DATERANGE_DESCRIPTION: DATERANGE_DESCRIPTION,
		DATEPICKER_POPOVER_ACCESSIBLE_NAME: DATEPICKER_POPOVER_ACCESSIBLE_NAME,
		DATETIME_COMPONENTS_PLACEHOLDER_PREFIX: DATETIME_COMPONENTS_PLACEHOLDER_PREFIX,
		DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME: DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME,
		DATERANGEPICKER_POPOVER_ACCESSIBLE_NAME: DATERANGEPICKER_POPOVER_ACCESSIBLE_NAME,
		DELETE: DELETE,
		EMPTY_INDICATOR_SYMBOL: EMPTY_INDICATOR_SYMBOL,
		EMPTY_INDICATOR_ACCESSIBLE_TEXT: EMPTY_INDICATOR_ACCESSIBLE_TEXT,
		EXPANDABLE_TEXT_SHOW_MORE: EXPANDABLE_TEXT_SHOW_MORE,
		EXPANDABLE_TEXT_SHOW_LESS: EXPANDABLE_TEXT_SHOW_LESS,
		EXPANDABLE_TEXT_CLOSE: EXPANDABLE_TEXT_CLOSE,
		EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL: EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL,
		EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL: EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL,
		FILEUPLOADER_ROLE_DESCRIPTION: FILEUPLOADER_ROLE_DESCRIPTION,
		FILEUPLOADER_DEFAULT_PLACEHOLDER: FILEUPLOADER_DEFAULT_PLACEHOLDER,
		FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER: FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER,
		FILEUPLOADER_INPUT_TOOLTIP: FILEUPLOADER_INPUT_TOOLTIP,
		FILEUPLOADER_VALUE_HELP_TOOLTIP: FILEUPLOADER_VALUE_HELP_TOOLTIP,
		FILEUPLOADER_CLEAR_ICON_TOOLTIP: FILEUPLOADER_CLEAR_ICON_TOOLTIP,
		GROUP_HEADER_TEXT: GROUP_HEADER_TEXT,
		SELECT_ROLE_DESCRIPTION: SELECT_ROLE_DESCRIPTION,
		SELECT_OPTIONS: SELECT_OPTIONS,
		SHOW_SELECTED_BUTTON: SHOW_SELECTED_BUTTON,
		INPUT_SUGGESTIONS: INPUT_SUGGESTIONS,
		MCB_SELECTED_ITEMS: MCB_SELECTED_ITEMS,
		INPUT_SUGGESTIONS_TITLE: INPUT_SUGGESTIONS_TITLE,
		INPUT_SUGGESTIONS_ONE_HIT: INPUT_SUGGESTIONS_ONE_HIT,
		INPUT_SUGGESTIONS_MORE_HITS: INPUT_SUGGESTIONS_MORE_HITS,
		INPUT_SUGGESTIONS_NO_HIT: INPUT_SUGGESTIONS_NO_HIT,
		INPUT_CLEAR_ICON_ACC_NAME: INPUT_CLEAR_ICON_ACC_NAME,
		INPUT_SUGGESTIONS_OK_BUTTON: INPUT_SUGGESTIONS_OK_BUTTON,
		LINK_SUBTLE: LINK_SUBTLE,
		LINK_EMPHASIZED: LINK_EMPHASIZED,
		LIST_ITEM_ACTIVE: LIST_ITEM_ACTIVE,
		LIST_ITEM_POSITION: LIST_ITEM_POSITION,
		LIST_ITEM_SELECTED: LIST_ITEM_SELECTED,
		LIST_ITEM_NOT_SELECTED: LIST_ITEM_NOT_SELECTED,
		LIST_ITEM_GROUP_HEADER: LIST_ITEM_GROUP_HEADER,
		LIST_ROLE_LIST_GROUP_DESCRIPTION: LIST_ROLE_LIST_GROUP_DESCRIPTION,
		LIST_ROLE_LISTBOX_GROUP_DESCRIPTION: LIST_ROLE_LISTBOX_GROUP_DESCRIPTION,
		ARIA_LABEL_LIST_ITEM_CHECKBOX: ARIA_LABEL_LIST_ITEM_CHECKBOX,
		ARIA_LABEL_LIST_ITEM_RADIO_BUTTON: ARIA_LABEL_LIST_ITEM_RADIO_BUTTON,
		ARIA_LABEL_LIST_SELECTABLE: ARIA_LABEL_LIST_SELECTABLE,
		ARIA_LABEL_LIST_MULTISELECTABLE: ARIA_LABEL_LIST_MULTISELECTABLE,
		ARIA_LABEL_LIST_DELETABLE: ARIA_LABEL_LIST_DELETABLE,
		MESSAGE_STRIP_CLOSE_BUTTON_INFORMATION: MESSAGE_STRIP_CLOSE_BUTTON_INFORMATION,
		MESSAGE_STRIP_CLOSE_BUTTON_POSITIVE: MESSAGE_STRIP_CLOSE_BUTTON_POSITIVE,
		MESSAGE_STRIP_CLOSE_BUTTON_NEGATIVE: MESSAGE_STRIP_CLOSE_BUTTON_NEGATIVE,
		MESSAGE_STRIP_CLOSE_BUTTON_CRITICAL: MESSAGE_STRIP_CLOSE_BUTTON_CRITICAL,
		MESSAGE_STRIP_CLOSE_BUTTON_CUSTOM: MESSAGE_STRIP_CLOSE_BUTTON_CUSTOM,
		MESSAGE_STRIP_CLOSABLE: MESSAGE_STRIP_CLOSABLE,
		MESSAGE_STRIP_ERROR: MESSAGE_STRIP_ERROR,
		MESSAGE_STRIP_WARNING: MESSAGE_STRIP_WARNING,
		MESSAGE_STRIP_SUCCESS: MESSAGE_STRIP_SUCCESS,
		MESSAGE_STRIP_INFORMATION: MESSAGE_STRIP_INFORMATION,
		MESSAGE_STRIP_CUSTOM: MESSAGE_STRIP_CUSTOM,
		MULTICOMBOBOX_DIALOG_OK_BUTTON: MULTICOMBOBOX_DIALOG_OK_BUTTON,
		COMBOBOX_AVAILABLE_OPTIONS: COMBOBOX_AVAILABLE_OPTIONS,
		COMBOBOX_DIALOG_OK_BUTTON: COMBOBOX_DIALOG_OK_BUTTON,
		INPUT_AVALIABLE_VALUES: INPUT_AVALIABLE_VALUES,
		VALUE_STATE_ERROR_ALREADY_SELECTED: VALUE_STATE_ERROR_ALREADY_SELECTED,
		MULTIINPUT_ROLEDESCRIPTION_TEXT: MULTIINPUT_ROLEDESCRIPTION_TEXT,
		MULTIINPUT_SHOW_MORE_TOKENS: MULTIINPUT_SHOW_MORE_TOKENS,
		MULTIINPUT_VALUE_HELP_LABEL: MULTIINPUT_VALUE_HELP_LABEL,
		MULTIINPUT_VALUE_HELP: MULTIINPUT_VALUE_HELP,
		PANEL_ICON: PANEL_ICON,
		RANGE_SLIDER_ARIA_DESCRIPTION: RANGE_SLIDER_ARIA_DESCRIPTION,
		RANGE_SLIDER_START_HANDLE_DESCRIPTION: RANGE_SLIDER_START_HANDLE_DESCRIPTION,
		RANGE_SLIDER_END_HANDLE_DESCRIPTION: RANGE_SLIDER_END_HANDLE_DESCRIPTION,
		RATING_INDICATOR_TOOLTIP_TEXT: RATING_INDICATOR_TOOLTIP_TEXT,
		RATING_INDICATOR_TEXT: RATING_INDICATOR_TEXT,
		RATING_INDICATOR_ARIA_DESCRIPTION: RATING_INDICATOR_ARIA_DESCRIPTION,
		RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON: RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON,
		SEGMENTEDBUTTON_ARIA_DESCRIPTION: SEGMENTEDBUTTON_ARIA_DESCRIPTION,
		SEGMENTEDBUTTON_ARIA_DESCRIBEDBY: SEGMENTEDBUTTON_ARIA_DESCRIBEDBY,
		SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION: SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION,
		SLIDER_ARIA_DESCRIPTION: SLIDER_ARIA_DESCRIPTION,
		LOAD_MORE_TEXT: LOAD_MORE_TEXT,
		TABLE_HEADER_ROW_INFORMATION: TABLE_HEADER_ROW_INFORMATION,
		TABLE_ROW_POSITION: TABLE_ROW_POSITION,
		TABLE_GROUP_ROW_ARIA_LABEL: TABLE_GROUP_ROW_ARIA_LABEL,
		ARIA_LABEL_ROW_SELECTION: ARIA_LABEL_ROW_SELECTION,
		ARIA_LABEL_SELECT_ALL_CHECKBOX: ARIA_LABEL_SELECT_ALL_CHECKBOX,
		ARIA_LABEL_EMPTY_CELL: ARIA_LABEL_EMPTY_CELL,
		TAB_ARIA_DESIGN_POSITIVE: TAB_ARIA_DESIGN_POSITIVE,
		TAB_ARIA_DESIGN_NEGATIVE: TAB_ARIA_DESIGN_NEGATIVE,
		TAB_ARIA_DESIGN_CRITICAL: TAB_ARIA_DESIGN_CRITICAL,
		TAB_ARIA_DESIGN_NEUTRAL: TAB_ARIA_DESIGN_NEUTRAL,
		TAB_SPLIT_ROLE_DESCRIPTION: TAB_SPLIT_ROLE_DESCRIPTION,
		TABCONTAINER_NEXT_ICON_ACC_NAME: TABCONTAINER_NEXT_ICON_ACC_NAME,
		TABCONTAINER_PREVIOUS_ICON_ACC_NAME: TABCONTAINER_PREVIOUS_ICON_ACC_NAME,
		TABCONTAINER_OVERFLOW_MENU_TITLE: TABCONTAINER_OVERFLOW_MENU_TITLE,
		TABCONTAINER_END_OVERFLOW: TABCONTAINER_END_OVERFLOW,
		TABCONTAINER_POPOVER_CANCEL_BUTTON: TABCONTAINER_POPOVER_CANCEL_BUTTON,
		TABCONTAINER_SUBTABS_DESCRIPTION: TABCONTAINER_SUBTABS_DESCRIPTION,
		TEXTAREA_CHARACTERS_LEFT: TEXTAREA_CHARACTERS_LEFT,
		TEXTAREA_CHARACTERS_EXCEEDED: TEXTAREA_CHARACTERS_EXCEEDED,
		TIMEPICKER_HOURS_LABEL: TIMEPICKER_HOURS_LABEL,
		TIMEPICKER_MINUTES_LABEL: TIMEPICKER_MINUTES_LABEL,
		TIMEPICKER_SECONDS_LABEL: TIMEPICKER_SECONDS_LABEL,
		TIMEPICKER_SUBMIT_BUTTON: TIMEPICKER_SUBMIT_BUTTON,
		TIMEPICKER_CANCEL_BUTTON: TIMEPICKER_CANCEL_BUTTON,
		TIMEPICKER_INPUT_DESCRIPTION: TIMEPICKER_INPUT_DESCRIPTION,
		TIMEPICKER_POPOVER_ACCESSIBLE_NAME: TIMEPICKER_POPOVER_ACCESSIBLE_NAME,
		TIMEPICKER_CLOCK_DIAL_LABEL: TIMEPICKER_CLOCK_DIAL_LABEL,
		TIMEPICKER_INPUTS_ENTER_HOURS: TIMEPICKER_INPUTS_ENTER_HOURS,
		TIMEPICKER_INPUTS_ENTER_MINUTES: TIMEPICKER_INPUTS_ENTER_MINUTES,
		TIMEPICKER_INPUTS_ENTER_SECONDS: TIMEPICKER_INPUTS_ENTER_SECONDS,
		DURATION_INPUT_DESCRIPTION: DURATION_INPUT_DESCRIPTION,
		DATETIME_PICKER_DATE_BUTTON: DATETIME_PICKER_DATE_BUTTON,
		DATETIME_PICKER_TIME_BUTTON: DATETIME_PICKER_TIME_BUTTON,
		TOKEN_ARIA_DELETABLE: TOKEN_ARIA_DELETABLE,
		TOKEN_ARIA_REMOVE: TOKEN_ARIA_REMOVE,
		TOKEN_ARIA_LABEL: TOKEN_ARIA_LABEL,
		TOKENIZER_ARIA_CONTAIN_TOKEN: TOKENIZER_ARIA_CONTAIN_TOKEN,
		TOKENIZER_ARIA_CONTAIN_ONE_TOKEN: TOKENIZER_ARIA_CONTAIN_ONE_TOKEN,
		TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS: TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS,
		TOKENIZER_ARIA_LABEL: TOKENIZER_ARIA_LABEL,
		TOKENIZER_POPOVER_REMOVE: TOKENIZER_POPOVER_REMOVE,
		TOKENIZER_SHOW_ALL_ITEMS: TOKENIZER_SHOW_ALL_ITEMS,
		TOKENIZER_CLEAR_ALL: TOKENIZER_CLEAR_ALL,
		TOKENIZER_DIALOG_CANCEL_BUTTON: TOKENIZER_DIALOG_CANCEL_BUTTON,
		TOKENIZER_DIALOG_OK_BUTTON: TOKENIZER_DIALOG_OK_BUTTON,
		TREE_ITEM_ARIA_LABEL: TREE_ITEM_ARIA_LABEL,
		TREE_ITEM_EXPAND_NODE: TREE_ITEM_EXPAND_NODE,
		TREE_ITEM_COLLAPSE_NODE: TREE_ITEM_COLLAPSE_NODE,
		VALUE_STATE_TYPE_ERROR: VALUE_STATE_TYPE_ERROR,
		VALUE_STATE_TYPE_WARNING: VALUE_STATE_TYPE_WARNING,
		VALUE_STATE_TYPE_SUCCESS: VALUE_STATE_TYPE_SUCCESS,
		VALUE_STATE_TYPE_INFORMATION: VALUE_STATE_TYPE_INFORMATION,
		VALUE_STATE_ERROR: VALUE_STATE_ERROR,
		VALUE_STATE_WARNING: VALUE_STATE_WARNING,
		VALUE_STATE_INFORMATION: VALUE_STATE_INFORMATION,
		VALUE_STATE_SUCCESS: VALUE_STATE_SUCCESS,
		VALUE_STATE_LINK: VALUE_STATE_LINK,
		VALUE_STATE_LINK_MAC: VALUE_STATE_LINK_MAC,
		VALUE_STATE_LINKS: VALUE_STATE_LINKS,
		VALUE_STATE_LINKS_MAC: VALUE_STATE_LINKS_MAC,
		CALENDAR_HEADER_NEXT_BUTTON: CALENDAR_HEADER_NEXT_BUTTON,
		CALENDAR_HEADER_PREVIOUS_BUTTON: CALENDAR_HEADER_PREVIOUS_BUTTON,
		DAY_PICKER_WEEK_NUMBER_TEXT: DAY_PICKER_WEEK_NUMBER_TEXT,
		DAY_PICKER_NON_WORKING_DAY: DAY_PICKER_NON_WORKING_DAY,
		DAY_PICKER_TODAY: DAY_PICKER_TODAY,
		MONTH_PICKER_DESCRIPTION: MONTH_PICKER_DESCRIPTION,
		YEAR_PICKER_DESCRIPTION: YEAR_PICKER_DESCRIPTION,
		YEAR_RANGE_PICKER_DESCRIPTION: YEAR_RANGE_PICKER_DESCRIPTION,
		SLIDER_TOOLTIP_INPUT_DESCRIPTION: SLIDER_TOOLTIP_INPUT_DESCRIPTION,
		SLIDER_TOOLTIP_INPUT_LABEL: SLIDER_TOOLTIP_INPUT_LABEL,
		STEPINPUT_DEC_ICON_TITLE: STEPINPUT_DEC_ICON_TITLE,
		STEPINPUT_INC_ICON_TITLE: STEPINPUT_INC_ICON_TITLE,
		SPLIT_BUTTON_DESCRIPTION: SPLIT_BUTTON_DESCRIPTION,
		SPLIT_BUTTON_KEYBOARD_HINT: SPLIT_BUTTON_KEYBOARD_HINT,
		SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP: SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP,
		MENU_BACK_BUTTON_ARIA_LABEL: MENU_BACK_BUTTON_ARIA_LABEL,
		MENU_CLOSE_BUTTON_ARIA_LABEL: MENU_CLOSE_BUTTON_ARIA_LABEL,
		MENU_POPOVER_ACCESSIBLE_NAME: MENU_POPOVER_ACCESSIBLE_NAME,
		MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME: MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME,
		MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME: MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME,
		MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME: MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME,
		DIALOG_HEADER_ARIA_ROLE_DESCRIPTION: DIALOG_HEADER_ARIA_ROLE_DESCRIPTION,
		DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE: DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE,
		DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE: DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE,
		DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE: DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE,
		LABEL_COLON: LABEL_COLON,
		TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL: TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL,
		TOOLBAR_POPOVER_AVAILABLE_VALUES: TOOLBAR_POPOVER_AVAILABLE_VALUES,
		FORM_ACCESSIBLE_NAME: FORM_ACCESSIBLE_NAME,
		FORM_CHECKABLE_REQUIRED: FORM_CHECKABLE_REQUIRED,
		FORM_MIXED_TEXTFIELD_REQUIRED: FORM_MIXED_TEXTFIELD_REQUIRED,
		FORM_SELECTABLE_REQUIRED: FORM_SELECTABLE_REQUIRED,
		FORM_SELECTABLE_REQUIRED2: FORM_SELECTABLE_REQUIRED2,
		FORM_TEXTFIELD_REQUIRED: FORM_TEXTFIELD_REQUIRED,
		TABLE_SELECTION: TABLE_SELECTION,
		TABLE_ROW_SELECTOR: TABLE_ROW_SELECTOR,
		TABLE_NO_DATA: TABLE_NO_DATA,
		TABLE_SINGLE_SELECTABLE: TABLE_SINGLE_SELECTABLE,
		TABLE_MULTI_SELECTABLE: TABLE_MULTI_SELECTABLE,
		TABLE_COLUMNHEADER_SELECTALL_DESCRIPTION: TABLE_COLUMNHEADER_SELECTALL_DESCRIPTION,
		TABLE_COLUMNHEADER_SELECTALL_CHECKED: TABLE_COLUMNHEADER_SELECTALL_CHECKED,
		TABLE_COLUMNHEADER_SELECTALL_NOT_CHECKED: TABLE_COLUMNHEADER_SELECTALL_NOT_CHECKED,
		TABLE_COLUMNHEADER_CLEARALL_DESCRIPTION: TABLE_COLUMNHEADER_CLEARALL_DESCRIPTION,
		TABLE_COLUMNHEADER_CLEARALL_DISABLED: TABLE_COLUMNHEADER_CLEARALL_DISABLED,
		TABLE_ROW_POPIN: TABLE_ROW_POPIN,
		TABLE_MORE: TABLE_MORE,
		TABLE_MORE_DESCRIPTION: TABLE_MORE_DESCRIPTION,
		TABLE_ROW_ACTIONS: TABLE_ROW_ACTIONS,
		TABLE_NAVIGATION: TABLE_NAVIGATION,
		TABLE_GENERATED_BY_AI: TABLE_GENERATED_BY_AI,
		TABLE_SELECT_ALL_ROWS: TABLE_SELECT_ALL_ROWS,
		TABLE_DESELECT_ALL_ROWS: TABLE_DESELECT_ALL_ROWS,
		DYNAMIC_DATE_RANGE_YESTERDAY_TEXT: DYNAMIC_DATE_RANGE_YESTERDAY_TEXT,
		DYNAMIC_DATE_RANGE_TODAY_TEXT: DYNAMIC_DATE_RANGE_TODAY_TEXT,
		DYNAMIC_DATE_RANGE_TOMORROW_TEXT: DYNAMIC_DATE_RANGE_TOMORROW_TEXT,
		DYNAMIC_DATE_RANGE_DATE_TEXT: DYNAMIC_DATE_RANGE_DATE_TEXT,
		DYNAMIC_DATE_RANGE_DATERANGE_TEXT: DYNAMIC_DATE_RANGE_DATERANGE_TEXT,
		DYNAMIC_DATE_RANGE_SELECTED_TEXT: DYNAMIC_DATE_RANGE_SELECTED_TEXT,
		DYNAMIC_DATE_RANGE_EMPTY_SELECTED_TEXT: DYNAMIC_DATE_RANGE_EMPTY_SELECTED_TEXT,
		DYNAMIC_DATE_RANGE_NAVIGATION_ICON_TOOLTIP: DYNAMIC_DATE_RANGE_NAVIGATION_ICON_TOOLTIP,
		TABLE_COLUMN_HEADER_ROW: TABLE_COLUMN_HEADER_ROW,
		DYNAMIC_DATE_RANGE_LAST_DAYS_TEXT: DYNAMIC_DATE_RANGE_LAST_DAYS_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_DAYS_TEXT: DYNAMIC_DATE_RANGE_NEXT_DAYS_TEXT,
		DYNAMIC_DATE_RANGE_LAST_WEEKS_TEXT: DYNAMIC_DATE_RANGE_LAST_WEEKS_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_WEEKS_TEXT: DYNAMIC_DATE_RANGE_NEXT_WEEKS_TEXT,
		DYNAMIC_DATE_RANGE_LAST_MONTHS_TEXT: DYNAMIC_DATE_RANGE_LAST_MONTHS_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_MONTHS_TEXT: DYNAMIC_DATE_RANGE_NEXT_MONTHS_TEXT,
		DYNAMIC_DATE_RANGE_LAST_QUARTERS_TEXT: DYNAMIC_DATE_RANGE_LAST_QUARTERS_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_QUARTERS_TEXT: DYNAMIC_DATE_RANGE_NEXT_QUARTERS_TEXT,
		DYNAMIC_DATE_RANGE_LAST_YEARS_TEXT: DYNAMIC_DATE_RANGE_LAST_YEARS_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_YEARS_TEXT: DYNAMIC_DATE_RANGE_NEXT_YEARS_TEXT,
		DYNAMIC_DATE_RANGE_VALUE_LABEL_TEXT: DYNAMIC_DATE_RANGE_VALUE_LABEL_TEXT,
		DYNAMIC_DATE_RANGE_UNIT_OF_TIME_LABEL_TEXT: DYNAMIC_DATE_RANGE_UNIT_OF_TIME_LABEL_TEXT,
		DYNAMIC_DATE_RANGE_DAYS_UNIT_TEXT: DYNAMIC_DATE_RANGE_DAYS_UNIT_TEXT,
		DYNAMIC_DATE_RANGE_WEEKS_UNIT_TEXT: DYNAMIC_DATE_RANGE_WEEKS_UNIT_TEXT,
		DYNAMIC_DATE_RANGE_MONTHS_UNIT_TEXT: DYNAMIC_DATE_RANGE_MONTHS_UNIT_TEXT,
		DYNAMIC_DATE_RANGE_QUARTERS_UNIT_TEXT: DYNAMIC_DATE_RANGE_QUARTERS_UNIT_TEXT,
		DYNAMIC_DATE_RANGE_YEARS_UNIT_TEXT: DYNAMIC_DATE_RANGE_YEARS_UNIT_TEXT,
		DYNAMIC_DATE_RANGE_LAST_COMBINED_TEXT: DYNAMIC_DATE_RANGE_LAST_COMBINED_TEXT,
		DYNAMIC_DATE_RANGE_NEXT_COMBINED_TEXT: DYNAMIC_DATE_RANGE_NEXT_COMBINED_TEXT,
		DYNAMIC_DATE_RANGE_INCLUDED_TEXT: DYNAMIC_DATE_RANGE_INCLUDED_TEXT
	};

	exports.ARIA_LABEL_CARD_CONTENT = ARIA_LABEL_CARD_CONTENT;
	exports.ARIA_LABEL_EMPTY_CELL = ARIA_LABEL_EMPTY_CELL;
	exports.ARIA_LABEL_LIST_DELETABLE = ARIA_LABEL_LIST_DELETABLE;
	exports.ARIA_LABEL_LIST_ITEM_CHECKBOX = ARIA_LABEL_LIST_ITEM_CHECKBOX;
	exports.ARIA_LABEL_LIST_ITEM_RADIO_BUTTON = ARIA_LABEL_LIST_ITEM_RADIO_BUTTON;
	exports.ARIA_LABEL_LIST_MULTISELECTABLE = ARIA_LABEL_LIST_MULTISELECTABLE;
	exports.ARIA_LABEL_LIST_SELECTABLE = ARIA_LABEL_LIST_SELECTABLE;
	exports.ARIA_LABEL_ROW_SELECTION = ARIA_LABEL_ROW_SELECTION;
	exports.ARIA_LABEL_SELECT_ALL_CHECKBOX = ARIA_LABEL_SELECT_ALL_CHECKBOX;
	exports.ARIA_ROLEDESCRIPTION_CARD = ARIA_ROLEDESCRIPTION_CARD;
	exports.ARIA_ROLEDESCRIPTION_CARD_HEADER = ARIA_ROLEDESCRIPTION_CARD_HEADER;
	exports.ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER = ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER;
	exports.AVATAR_GROUP_ARIA_LABEL_GROUP = AVATAR_GROUP_ARIA_LABEL_GROUP;
	exports.AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL = AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL;
	exports.AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL = AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL;
	exports.AVATAR_GROUP_MOVE = AVATAR_GROUP_MOVE;
	exports.AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL = AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL;
	exports.AVATAR_TOOLTIP = AVATAR_TOOLTIP;
	exports.BREADCRUMBS_ARIA_LABEL = BREADCRUMBS_ARIA_LABEL;
	exports.BREADCRUMBS_CANCEL_BUTTON = BREADCRUMBS_CANCEL_BUTTON;
	exports.BREADCRUMBS_OVERFLOW_ARIA_LABEL = BREADCRUMBS_OVERFLOW_ARIA_LABEL;
	exports.BREADCRUMB_ITEM_POS = BREADCRUMB_ITEM_POS;
	exports.BUSY_INDICATOR_TITLE = BUSY_INDICATOR_TITLE;
	exports.BUTTON_ARIA_TYPE_ACCEPT = BUTTON_ARIA_TYPE_ACCEPT;
	exports.BUTTON_ARIA_TYPE_ATTENTION = BUTTON_ARIA_TYPE_ATTENTION;
	exports.BUTTON_ARIA_TYPE_EMPHASIZED = BUTTON_ARIA_TYPE_EMPHASIZED;
	exports.BUTTON_ARIA_TYPE_REJECT = BUTTON_ARIA_TYPE_REJECT;
	exports.BUTTON_BADGE_MANY_ITEMS = BUTTON_BADGE_MANY_ITEMS;
	exports.BUTTON_BADGE_ONE_ITEM = BUTTON_BADGE_ONE_ITEM;
	exports.CALENDAR_HEADER_NEXT_BUTTON = CALENDAR_HEADER_NEXT_BUTTON;
	exports.CALENDAR_HEADER_PREVIOUS_BUTTON = CALENDAR_HEADER_PREVIOUS_BUTTON;
	exports.CAL_LEGEND_NON_WORKING_DAY_TEXT = CAL_LEGEND_NON_WORKING_DAY_TEXT;
	exports.CAL_LEGEND_ROLE_DESCRIPTION = CAL_LEGEND_ROLE_DESCRIPTION;
	exports.CAL_LEGEND_SELECTED_TEXT = CAL_LEGEND_SELECTED_TEXT;
	exports.CAL_LEGEND_TODAY_TEXT = CAL_LEGEND_TODAY_TEXT;
	exports.CAL_LEGEND_WORKING_DAY_TEXT = CAL_LEGEND_WORKING_DAY_TEXT;
	exports.CAROUSEL_ARIA_ROLE_DESCRIPTION = CAROUSEL_ARIA_ROLE_DESCRIPTION;
	exports.CAROUSEL_DOT_TEXT = CAROUSEL_DOT_TEXT;
	exports.CAROUSEL_NEXT_ARROW_TEXT = CAROUSEL_NEXT_ARROW_TEXT;
	exports.CAROUSEL_OF_TEXT = CAROUSEL_OF_TEXT;
	exports.CAROUSEL_PREVIOUS_ARROW_TEXT = CAROUSEL_PREVIOUS_ARROW_TEXT;
	exports.COLORPALETTE_COLOR_LABEL = COLORPALETTE_COLOR_LABEL;
	exports.COLORPALETTE_CONTAINER_LABEL = COLORPALETTE_CONTAINER_LABEL;
	exports.COLORPALETTE_POPOVER_TITLE = COLORPALETTE_POPOVER_TITLE;
	exports.COLORPICKER_ALPHA = COLORPICKER_ALPHA;
	exports.COLORPICKER_ALPHA_SLIDER = COLORPICKER_ALPHA_SLIDER;
	exports.COLORPICKER_BLUE = COLORPICKER_BLUE;
	exports.COLORPICKER_GREEN = COLORPICKER_GREEN;
	exports.COLORPICKER_HEX = COLORPICKER_HEX;
	exports.COLORPICKER_HUE = COLORPICKER_HUE;
	exports.COLORPICKER_HUE_SLIDER = COLORPICKER_HUE_SLIDER;
	exports.COLORPICKER_LIGHT = COLORPICKER_LIGHT;
	exports.COLORPICKER_RED = COLORPICKER_RED;
	exports.COLORPICKER_SATURATION = COLORPICKER_SATURATION;
	exports.COLORPICKER_TOGGLE_MODE_TOOLTIP = COLORPICKER_TOGGLE_MODE_TOOLTIP;
	exports.COLOR_PALETTE_DEFAULT_COLOR_TEXT = COLOR_PALETTE_DEFAULT_COLOR_TEXT;
	exports.COLOR_PALETTE_DIALOG_CANCEL_BUTTON = COLOR_PALETTE_DIALOG_CANCEL_BUTTON;
	exports.COLOR_PALETTE_DIALOG_OK_BUTTON = COLOR_PALETTE_DIALOG_OK_BUTTON;
	exports.COLOR_PALETTE_DIALOG_TITLE = COLOR_PALETTE_DIALOG_TITLE;
	exports.COLOR_PALETTE_MORE_COLORS_TEXT = COLOR_PALETTE_MORE_COLORS_TEXT;
	exports.COMBOBOX_AVAILABLE_OPTIONS = COMBOBOX_AVAILABLE_OPTIONS;
	exports.COMBOBOX_DIALOG_OK_BUTTON = COMBOBOX_DIALOG_OK_BUTTON;
	exports.DATEPICKER_DATE_DESCRIPTION = DATEPICKER_DATE_DESCRIPTION;
	exports.DATEPICKER_OPEN_ICON_TITLE = DATEPICKER_OPEN_ICON_TITLE;
	exports.DATEPICKER_POPOVER_ACCESSIBLE_NAME = DATEPICKER_POPOVER_ACCESSIBLE_NAME;
	exports.DATERANGEPICKER_POPOVER_ACCESSIBLE_NAME = DATERANGEPICKER_POPOVER_ACCESSIBLE_NAME;
	exports.DATERANGE_DESCRIPTION = DATERANGE_DESCRIPTION;
	exports.DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME = DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME;
	exports.DATETIME_COMPONENTS_PLACEHOLDER_PREFIX = DATETIME_COMPONENTS_PLACEHOLDER_PREFIX;
	exports.DATETIME_DESCRIPTION = DATETIME_DESCRIPTION;
	exports.DATETIME_PICKER_DATE_BUTTON = DATETIME_PICKER_DATE_BUTTON;
	exports.DATETIME_PICKER_TIME_BUTTON = DATETIME_PICKER_TIME_BUTTON;
	exports.DAY_PICKER_NON_WORKING_DAY = DAY_PICKER_NON_WORKING_DAY;
	exports.DAY_PICKER_TODAY = DAY_PICKER_TODAY;
	exports.DAY_PICKER_WEEK_NUMBER_TEXT = DAY_PICKER_WEEK_NUMBER_TEXT;
	exports.DELETE = DELETE;
	exports.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE = DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE;
	exports.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE = DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE;
	exports.DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE = DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE;
	exports.DIALOG_HEADER_ARIA_ROLE_DESCRIPTION = DIALOG_HEADER_ARIA_ROLE_DESCRIPTION;
	exports.DURATION_INPUT_DESCRIPTION = DURATION_INPUT_DESCRIPTION;
	exports.DYNAMIC_DATE_RANGE_DATERANGE_TEXT = DYNAMIC_DATE_RANGE_DATERANGE_TEXT;
	exports.DYNAMIC_DATE_RANGE_DATE_TEXT = DYNAMIC_DATE_RANGE_DATE_TEXT;
	exports.DYNAMIC_DATE_RANGE_DAYS_UNIT_TEXT = DYNAMIC_DATE_RANGE_DAYS_UNIT_TEXT;
	exports.DYNAMIC_DATE_RANGE_EMPTY_SELECTED_TEXT = DYNAMIC_DATE_RANGE_EMPTY_SELECTED_TEXT;
	exports.DYNAMIC_DATE_RANGE_INCLUDED_TEXT = DYNAMIC_DATE_RANGE_INCLUDED_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_COMBINED_TEXT = DYNAMIC_DATE_RANGE_LAST_COMBINED_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_DAYS_TEXT = DYNAMIC_DATE_RANGE_LAST_DAYS_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_MONTHS_TEXT = DYNAMIC_DATE_RANGE_LAST_MONTHS_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_QUARTERS_TEXT = DYNAMIC_DATE_RANGE_LAST_QUARTERS_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_WEEKS_TEXT = DYNAMIC_DATE_RANGE_LAST_WEEKS_TEXT;
	exports.DYNAMIC_DATE_RANGE_LAST_YEARS_TEXT = DYNAMIC_DATE_RANGE_LAST_YEARS_TEXT;
	exports.DYNAMIC_DATE_RANGE_MONTHS_UNIT_TEXT = DYNAMIC_DATE_RANGE_MONTHS_UNIT_TEXT;
	exports.DYNAMIC_DATE_RANGE_NAVIGATION_ICON_TOOLTIP = DYNAMIC_DATE_RANGE_NAVIGATION_ICON_TOOLTIP;
	exports.DYNAMIC_DATE_RANGE_NEXT_COMBINED_TEXT = DYNAMIC_DATE_RANGE_NEXT_COMBINED_TEXT;
	exports.DYNAMIC_DATE_RANGE_NEXT_DAYS_TEXT = DYNAMIC_DATE_RANGE_NEXT_DAYS_TEXT;
	exports.DYNAMIC_DATE_RANGE_NEXT_MONTHS_TEXT = DYNAMIC_DATE_RANGE_NEXT_MONTHS_TEXT;
	exports.DYNAMIC_DATE_RANGE_NEXT_QUARTERS_TEXT = DYNAMIC_DATE_RANGE_NEXT_QUARTERS_TEXT;
	exports.DYNAMIC_DATE_RANGE_NEXT_WEEKS_TEXT = DYNAMIC_DATE_RANGE_NEXT_WEEKS_TEXT;
	exports.DYNAMIC_DATE_RANGE_NEXT_YEARS_TEXT = DYNAMIC_DATE_RANGE_NEXT_YEARS_TEXT;
	exports.DYNAMIC_DATE_RANGE_QUARTERS_UNIT_TEXT = DYNAMIC_DATE_RANGE_QUARTERS_UNIT_TEXT;
	exports.DYNAMIC_DATE_RANGE_SELECTED_TEXT = DYNAMIC_DATE_RANGE_SELECTED_TEXT;
	exports.DYNAMIC_DATE_RANGE_TODAY_TEXT = DYNAMIC_DATE_RANGE_TODAY_TEXT;
	exports.DYNAMIC_DATE_RANGE_TOMORROW_TEXT = DYNAMIC_DATE_RANGE_TOMORROW_TEXT;
	exports.DYNAMIC_DATE_RANGE_UNIT_OF_TIME_LABEL_TEXT = DYNAMIC_DATE_RANGE_UNIT_OF_TIME_LABEL_TEXT;
	exports.DYNAMIC_DATE_RANGE_VALUE_LABEL_TEXT = DYNAMIC_DATE_RANGE_VALUE_LABEL_TEXT;
	exports.DYNAMIC_DATE_RANGE_WEEKS_UNIT_TEXT = DYNAMIC_DATE_RANGE_WEEKS_UNIT_TEXT;
	exports.DYNAMIC_DATE_RANGE_YEARS_UNIT_TEXT = DYNAMIC_DATE_RANGE_YEARS_UNIT_TEXT;
	exports.DYNAMIC_DATE_RANGE_YESTERDAY_TEXT = DYNAMIC_DATE_RANGE_YESTERDAY_TEXT;
	exports.EMPTY_INDICATOR_ACCESSIBLE_TEXT = EMPTY_INDICATOR_ACCESSIBLE_TEXT;
	exports.EMPTY_INDICATOR_SYMBOL = EMPTY_INDICATOR_SYMBOL;
	exports.EXPANDABLE_TEXT_CLOSE = EXPANDABLE_TEXT_CLOSE;
	exports.EXPANDABLE_TEXT_SHOW_LESS = EXPANDABLE_TEXT_SHOW_LESS;
	exports.EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL = EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL;
	exports.EXPANDABLE_TEXT_SHOW_MORE = EXPANDABLE_TEXT_SHOW_MORE;
	exports.EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL = EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL;
	exports.FILEUPLOADER_CLEAR_ICON_TOOLTIP = FILEUPLOADER_CLEAR_ICON_TOOLTIP;
	exports.FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER = FILEUPLOADER_DEFAULT_MULTIPLE_PLACEHOLDER;
	exports.FILEUPLOADER_DEFAULT_PLACEHOLDER = FILEUPLOADER_DEFAULT_PLACEHOLDER;
	exports.FILEUPLOADER_INPUT_TOOLTIP = FILEUPLOADER_INPUT_TOOLTIP;
	exports.FILEUPLOADER_ROLE_DESCRIPTION = FILEUPLOADER_ROLE_DESCRIPTION;
	exports.FILEUPLOADER_VALUE_HELP_TOOLTIP = FILEUPLOADER_VALUE_HELP_TOOLTIP;
	exports.FORM_ACCESSIBLE_NAME = FORM_ACCESSIBLE_NAME;
	exports.FORM_CHECKABLE_REQUIRED = FORM_CHECKABLE_REQUIRED;
	exports.FORM_MIXED_TEXTFIELD_REQUIRED = FORM_MIXED_TEXTFIELD_REQUIRED;
	exports.FORM_SELECTABLE_AVALIABLE_VALUES = FORM_SELECTABLE_AVALIABLE_VALUES;
	exports.FORM_SELECTABLE_REQUIRED = FORM_SELECTABLE_REQUIRED;
	exports.FORM_SELECTABLE_REQUIRED2 = FORM_SELECTABLE_REQUIRED2;
	exports.FORM_TEXTFIELD_REQUIRED = FORM_TEXTFIELD_REQUIRED;
	exports.GROUP_HEADER_TEXT = GROUP_HEADER_TEXT;
	exports.INPUT_AVALIABLE_VALUES = INPUT_AVALIABLE_VALUES;
	exports.INPUT_CLEAR_ICON_ACC_NAME = INPUT_CLEAR_ICON_ACC_NAME;
	exports.INPUT_SUGGESTIONS = INPUT_SUGGESTIONS;
	exports.INPUT_SUGGESTIONS_MORE_HITS = INPUT_SUGGESTIONS_MORE_HITS;
	exports.INPUT_SUGGESTIONS_NO_HIT = INPUT_SUGGESTIONS_NO_HIT;
	exports.INPUT_SUGGESTIONS_OK_BUTTON = INPUT_SUGGESTIONS_OK_BUTTON;
	exports.INPUT_SUGGESTIONS_ONE_HIT = INPUT_SUGGESTIONS_ONE_HIT;
	exports.INPUT_SUGGESTIONS_TITLE = INPUT_SUGGESTIONS_TITLE;
	exports.LABEL_COLON = LABEL_COLON;
	exports.LINK_EMPHASIZED = LINK_EMPHASIZED;
	exports.LINK_SUBTLE = LINK_SUBTLE;
	exports.LIST_ITEM_ACTIVE = LIST_ITEM_ACTIVE;
	exports.LIST_ITEM_GROUP_HEADER = LIST_ITEM_GROUP_HEADER;
	exports.LIST_ITEM_NOT_SELECTED = LIST_ITEM_NOT_SELECTED;
	exports.LIST_ITEM_POSITION = LIST_ITEM_POSITION;
	exports.LIST_ITEM_SELECTED = LIST_ITEM_SELECTED;
	exports.LIST_ROLE_LISTBOX_GROUP_DESCRIPTION = LIST_ROLE_LISTBOX_GROUP_DESCRIPTION;
	exports.LIST_ROLE_LIST_GROUP_DESCRIPTION = LIST_ROLE_LIST_GROUP_DESCRIPTION;
	exports.LOAD_MORE_TEXT = LOAD_MORE_TEXT;
	exports.MCB_SELECTED_ITEMS = MCB_SELECTED_ITEMS;
	exports.MENU_BACK_BUTTON_ARIA_LABEL = MENU_BACK_BUTTON_ARIA_LABEL;
	exports.MENU_CLOSE_BUTTON_ARIA_LABEL = MENU_CLOSE_BUTTON_ARIA_LABEL;
	exports.MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME = MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME;
	exports.MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME = MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME;
	exports.MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME = MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME;
	exports.MENU_POPOVER_ACCESSIBLE_NAME = MENU_POPOVER_ACCESSIBLE_NAME;
	exports.MESSAGE_STRIP_CLOSABLE = MESSAGE_STRIP_CLOSABLE;
	exports.MESSAGE_STRIP_CLOSE_BUTTON_CRITICAL = MESSAGE_STRIP_CLOSE_BUTTON_CRITICAL;
	exports.MESSAGE_STRIP_CLOSE_BUTTON_CUSTOM = MESSAGE_STRIP_CLOSE_BUTTON_CUSTOM;
	exports.MESSAGE_STRIP_CLOSE_BUTTON_INFORMATION = MESSAGE_STRIP_CLOSE_BUTTON_INFORMATION;
	exports.MESSAGE_STRIP_CLOSE_BUTTON_NEGATIVE = MESSAGE_STRIP_CLOSE_BUTTON_NEGATIVE;
	exports.MESSAGE_STRIP_CLOSE_BUTTON_POSITIVE = MESSAGE_STRIP_CLOSE_BUTTON_POSITIVE;
	exports.MESSAGE_STRIP_CUSTOM = MESSAGE_STRIP_CUSTOM;
	exports.MESSAGE_STRIP_ERROR = MESSAGE_STRIP_ERROR;
	exports.MESSAGE_STRIP_INFORMATION = MESSAGE_STRIP_INFORMATION;
	exports.MESSAGE_STRIP_SUCCESS = MESSAGE_STRIP_SUCCESS;
	exports.MESSAGE_STRIP_WARNING = MESSAGE_STRIP_WARNING;
	exports.MONTH_PICKER_DESCRIPTION = MONTH_PICKER_DESCRIPTION;
	exports.MULTICOMBOBOX_DIALOG_OK_BUTTON = MULTICOMBOBOX_DIALOG_OK_BUTTON;
	exports.MULTIINPUT_ROLEDESCRIPTION_TEXT = MULTIINPUT_ROLEDESCRIPTION_TEXT;
	exports.MULTIINPUT_SHOW_MORE_TOKENS = MULTIINPUT_SHOW_MORE_TOKENS;
	exports.MULTIINPUT_VALUE_HELP = MULTIINPUT_VALUE_HELP;
	exports.MULTIINPUT_VALUE_HELP_LABEL = MULTIINPUT_VALUE_HELP_LABEL;
	exports.PANEL_ICON = PANEL_ICON;
	exports.RANGE_SLIDER_ARIA_DESCRIPTION = RANGE_SLIDER_ARIA_DESCRIPTION;
	exports.RANGE_SLIDER_END_HANDLE_DESCRIPTION = RANGE_SLIDER_END_HANDLE_DESCRIPTION;
	exports.RANGE_SLIDER_START_HANDLE_DESCRIPTION = RANGE_SLIDER_START_HANDLE_DESCRIPTION;
	exports.RATING_INDICATOR_ARIA_DESCRIPTION = RATING_INDICATOR_ARIA_DESCRIPTION;
	exports.RATING_INDICATOR_TEXT = RATING_INDICATOR_TEXT;
	exports.RATING_INDICATOR_TOOLTIP_TEXT = RATING_INDICATOR_TOOLTIP_TEXT;
	exports.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON = RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON;
	exports.SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION = SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION;
	exports.SEGMENTEDBUTTON_ARIA_DESCRIBEDBY = SEGMENTEDBUTTON_ARIA_DESCRIBEDBY;
	exports.SEGMENTEDBUTTON_ARIA_DESCRIPTION = SEGMENTEDBUTTON_ARIA_DESCRIPTION;
	exports.SELECT_OPTIONS = SELECT_OPTIONS;
	exports.SELECT_ROLE_DESCRIPTION = SELECT_ROLE_DESCRIPTION;
	exports.SHOW_SELECTED_BUTTON = SHOW_SELECTED_BUTTON;
	exports.SLIDER_ARIA_DESCRIPTION = SLIDER_ARIA_DESCRIPTION;
	exports.SLIDER_TOOLTIP_INPUT_DESCRIPTION = SLIDER_TOOLTIP_INPUT_DESCRIPTION;
	exports.SLIDER_TOOLTIP_INPUT_LABEL = SLIDER_TOOLTIP_INPUT_LABEL;
	exports.SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP = SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP;
	exports.SPLIT_BUTTON_DESCRIPTION = SPLIT_BUTTON_DESCRIPTION;
	exports.SPLIT_BUTTON_KEYBOARD_HINT = SPLIT_BUTTON_KEYBOARD_HINT;
	exports.STEPINPUT_DEC_ICON_TITLE = STEPINPUT_DEC_ICON_TITLE;
	exports.STEPINPUT_INC_ICON_TITLE = STEPINPUT_INC_ICON_TITLE;
	exports.TABCONTAINER_END_OVERFLOW = TABCONTAINER_END_OVERFLOW;
	exports.TABCONTAINER_NEXT_ICON_ACC_NAME = TABCONTAINER_NEXT_ICON_ACC_NAME;
	exports.TABCONTAINER_OVERFLOW_MENU_TITLE = TABCONTAINER_OVERFLOW_MENU_TITLE;
	exports.TABCONTAINER_POPOVER_CANCEL_BUTTON = TABCONTAINER_POPOVER_CANCEL_BUTTON;
	exports.TABCONTAINER_PREVIOUS_ICON_ACC_NAME = TABCONTAINER_PREVIOUS_ICON_ACC_NAME;
	exports.TABCONTAINER_SUBTABS_DESCRIPTION = TABCONTAINER_SUBTABS_DESCRIPTION;
	exports.TABLE_COLUMNHEADER_CLEARALL_DESCRIPTION = TABLE_COLUMNHEADER_CLEARALL_DESCRIPTION;
	exports.TABLE_COLUMNHEADER_CLEARALL_DISABLED = TABLE_COLUMNHEADER_CLEARALL_DISABLED;
	exports.TABLE_COLUMNHEADER_SELECTALL_CHECKED = TABLE_COLUMNHEADER_SELECTALL_CHECKED;
	exports.TABLE_COLUMNHEADER_SELECTALL_DESCRIPTION = TABLE_COLUMNHEADER_SELECTALL_DESCRIPTION;
	exports.TABLE_COLUMNHEADER_SELECTALL_NOT_CHECKED = TABLE_COLUMNHEADER_SELECTALL_NOT_CHECKED;
	exports.TABLE_COLUMN_HEADER_ROW = TABLE_COLUMN_HEADER_ROW;
	exports.TABLE_DESELECT_ALL_ROWS = TABLE_DESELECT_ALL_ROWS;
	exports.TABLE_GENERATED_BY_AI = TABLE_GENERATED_BY_AI;
	exports.TABLE_GROUP_ROW_ARIA_LABEL = TABLE_GROUP_ROW_ARIA_LABEL;
	exports.TABLE_HEADER_ROW_INFORMATION = TABLE_HEADER_ROW_INFORMATION;
	exports.TABLE_MORE = TABLE_MORE;
	exports.TABLE_MORE_DESCRIPTION = TABLE_MORE_DESCRIPTION;
	exports.TABLE_MULTI_SELECTABLE = TABLE_MULTI_SELECTABLE;
	exports.TABLE_NAVIGATION = TABLE_NAVIGATION;
	exports.TABLE_NO_DATA = TABLE_NO_DATA;
	exports.TABLE_ROW_ACTIONS = TABLE_ROW_ACTIONS;
	exports.TABLE_ROW_POPIN = TABLE_ROW_POPIN;
	exports.TABLE_ROW_POSITION = TABLE_ROW_POSITION;
	exports.TABLE_ROW_SELECTOR = TABLE_ROW_SELECTOR;
	exports.TABLE_SELECTION = TABLE_SELECTION;
	exports.TABLE_SELECT_ALL_ROWS = TABLE_SELECT_ALL_ROWS;
	exports.TABLE_SINGLE_SELECTABLE = TABLE_SINGLE_SELECTABLE;
	exports.TAB_ARIA_DESIGN_CRITICAL = TAB_ARIA_DESIGN_CRITICAL;
	exports.TAB_ARIA_DESIGN_NEGATIVE = TAB_ARIA_DESIGN_NEGATIVE;
	exports.TAB_ARIA_DESIGN_NEUTRAL = TAB_ARIA_DESIGN_NEUTRAL;
	exports.TAB_ARIA_DESIGN_POSITIVE = TAB_ARIA_DESIGN_POSITIVE;
	exports.TAB_SPLIT_ROLE_DESCRIPTION = TAB_SPLIT_ROLE_DESCRIPTION;
	exports.TAG_DESCRIPTION_TAG = TAG_DESCRIPTION_TAG;
	exports.TAG_ERROR = TAG_ERROR;
	exports.TAG_INFORMATION = TAG_INFORMATION;
	exports.TAG_ROLE_DESCRIPTION = TAG_ROLE_DESCRIPTION;
	exports.TAG_SUCCESS = TAG_SUCCESS;
	exports.TAG_WARNING = TAG_WARNING;
	exports.TEXTAREA_CHARACTERS_EXCEEDED = TEXTAREA_CHARACTERS_EXCEEDED;
	exports.TEXTAREA_CHARACTERS_LEFT = TEXTAREA_CHARACTERS_LEFT;
	exports.TIMEPICKER_CANCEL_BUTTON = TIMEPICKER_CANCEL_BUTTON;
	exports.TIMEPICKER_CLOCK_DIAL_LABEL = TIMEPICKER_CLOCK_DIAL_LABEL;
	exports.TIMEPICKER_HOURS_LABEL = TIMEPICKER_HOURS_LABEL;
	exports.TIMEPICKER_INPUTS_ENTER_HOURS = TIMEPICKER_INPUTS_ENTER_HOURS;
	exports.TIMEPICKER_INPUTS_ENTER_MINUTES = TIMEPICKER_INPUTS_ENTER_MINUTES;
	exports.TIMEPICKER_INPUTS_ENTER_SECONDS = TIMEPICKER_INPUTS_ENTER_SECONDS;
	exports.TIMEPICKER_INPUT_DESCRIPTION = TIMEPICKER_INPUT_DESCRIPTION;
	exports.TIMEPICKER_MINUTES_LABEL = TIMEPICKER_MINUTES_LABEL;
	exports.TIMEPICKER_POPOVER_ACCESSIBLE_NAME = TIMEPICKER_POPOVER_ACCESSIBLE_NAME;
	exports.TIMEPICKER_SECONDS_LABEL = TIMEPICKER_SECONDS_LABEL;
	exports.TIMEPICKER_SUBMIT_BUTTON = TIMEPICKER_SUBMIT_BUTTON;
	exports.TOKENIZER_ARIA_CONTAIN_ONE_TOKEN = TOKENIZER_ARIA_CONTAIN_ONE_TOKEN;
	exports.TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS = TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS;
	exports.TOKENIZER_ARIA_CONTAIN_TOKEN = TOKENIZER_ARIA_CONTAIN_TOKEN;
	exports.TOKENIZER_ARIA_LABEL = TOKENIZER_ARIA_LABEL;
	exports.TOKENIZER_CLEAR_ALL = TOKENIZER_CLEAR_ALL;
	exports.TOKENIZER_DIALOG_CANCEL_BUTTON = TOKENIZER_DIALOG_CANCEL_BUTTON;
	exports.TOKENIZER_DIALOG_OK_BUTTON = TOKENIZER_DIALOG_OK_BUTTON;
	exports.TOKENIZER_POPOVER_REMOVE = TOKENIZER_POPOVER_REMOVE;
	exports.TOKENIZER_SHOW_ALL_ITEMS = TOKENIZER_SHOW_ALL_ITEMS;
	exports.TOKEN_ARIA_DELETABLE = TOKEN_ARIA_DELETABLE;
	exports.TOKEN_ARIA_LABEL = TOKEN_ARIA_LABEL;
	exports.TOKEN_ARIA_REMOVE = TOKEN_ARIA_REMOVE;
	exports.TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL = TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL;
	exports.TOOLBAR_POPOVER_AVAILABLE_VALUES = TOOLBAR_POPOVER_AVAILABLE_VALUES;
	exports.TREE_ITEM_ARIA_LABEL = TREE_ITEM_ARIA_LABEL;
	exports.TREE_ITEM_COLLAPSE_NODE = TREE_ITEM_COLLAPSE_NODE;
	exports.TREE_ITEM_EXPAND_NODE = TREE_ITEM_EXPAND_NODE;
	exports.VALUE_STATE_ERROR = VALUE_STATE_ERROR;
	exports.VALUE_STATE_ERROR_ALREADY_SELECTED = VALUE_STATE_ERROR_ALREADY_SELECTED;
	exports.VALUE_STATE_INFORMATION = VALUE_STATE_INFORMATION;
	exports.VALUE_STATE_LINK = VALUE_STATE_LINK;
	exports.VALUE_STATE_LINKS = VALUE_STATE_LINKS;
	exports.VALUE_STATE_LINKS_MAC = VALUE_STATE_LINKS_MAC;
	exports.VALUE_STATE_LINK_MAC = VALUE_STATE_LINK_MAC;
	exports.VALUE_STATE_SUCCESS = VALUE_STATE_SUCCESS;
	exports.VALUE_STATE_TYPE_ERROR = VALUE_STATE_TYPE_ERROR;
	exports.VALUE_STATE_TYPE_INFORMATION = VALUE_STATE_TYPE_INFORMATION;
	exports.VALUE_STATE_TYPE_SUCCESS = VALUE_STATE_TYPE_SUCCESS;
	exports.VALUE_STATE_TYPE_WARNING = VALUE_STATE_TYPE_WARNING;
	exports.VALUE_STATE_WARNING = VALUE_STATE_WARNING;
	exports.YEAR_PICKER_DESCRIPTION = YEAR_PICKER_DESCRIPTION;
	exports.YEAR_RANGE_PICKER_DESCRIPTION = YEAR_RANGE_PICKER_DESCRIPTION;
	exports.default = messagebundle_en_US_saprigi;

}));
