/**
 * Плагин для выборки списка элементов(checkbox), которые сгруппированы по
 * категориям
 * @author Robert Kuznetsov
 */
;
(function () {

    var plugin = {

        /**
         * Настройки плагина
         * @type Object
         */
        plgOptions: {},
        /**
         * HTML грепп(отделов)
         */
        groupList: '',
        /**
         * Cодержит массив элементов. Элемент - key, value и св-во указывающее
         * на группы, которым принадлежит элемент.
         */
        items: [],
        checkedItems: [],
        /**
         * Инициализация плагина, этот метод вызывается клиентом плагина
         *
         * @param {object} options
         * @returns {undefined}
         */
        init: function (options) {
            var defaults = {
                selector: '#managers-group-list', //СSS-cелектор блока в котором отрисуется компонент
                selectorItemInput: '.plg-mlg-item-input',
                data: [], //Данные
                titleItems: 'Специалисты по продажам',
                nameCheckboxAll: 'Выбрать всех',
                modalTitle: 'Выбор специалистов по продаже',
                maxCheckedRender: 4,
                splitSymbol: ','               //Символ разделитель для кодов групп в html-атрибуте "data-groupvalue"
            };

            this.plgOptions = $.extend(defaults, options);
            $(document).ready(this.handlerReady);
            this.render();
        },
        render: function () {
            var html = [
                '<div class="panel panel-default plg-mlg-panel">',
                '<div class="panel-body">',
                '<a id="plg-mlg-btn-selector-manager" class="btn btn-primary btn-xs pull-right">выбрать</a>',
                '</div>',
                '</div>',
            ].join('');

            $(plugin.plgOptions.selector).html(html);

            plugin.setCssFormElement();
        },
        renderAfterSave: function () {
            var htmlSelectedItems = '';
            var index = 0;
            for(var i in plugin.checkedItems) {
                if(plugin.checkedItems[i].checked) {
                    if(index >= plugin.plgOptions.maxCheckedRender) {
                        htmlSelectedItems += 'и другие';
                        break;
                    }
                    index += 1;
                    htmlSelectedItems += [
                        '<div class="label label-default plg-mlg-item-selected" data-value="', plugin.checkedItems[i].value, '">',
                            plugin.checkedItems[i].name,
                        '</div>'
                    ].join('');
                }
            }
            var html = [
                '<div class="panel panel-default plg-mlg-panel">',
                    '<div class="panel-body">',
                        htmlSelectedItems,
                        '<a id="plg-mlg-btn-selector-manager" class="btn btn-primary btn-xs pull-right">выбрать</a>',
                    '</div>',
                '</div>',
            ].join('');
            $(plugin.plgOptions.selector).html(html);
            plugin.setCssFormElement();
        },
        handlerReady: function () {
            $(document).on('click', '#plg-mlg-btn-selector-manager', plugin.openModal);
            $(document).on('click', '.plg-mlg-group-input', plugin.clickGroupCheckbox);
            $(document).on('click', '.plg-mlg-all-items', plugin.clickAllCheckbox);
            $(document).on('click', '.plg-mlg-item-input', plugin.clickItemCheckbox);
            $(document).on('click', '.btn-save-plg-mlg', plugin.clickSaveBtn);
        },
        /**
         * Сортировка элементов по наименованию
         * @param {object} item1
         * @param {object} item2
         * @returns {Number}
         */
        compareItems: function (item1, item2) {
            if (item1.itemName > item2.itemName)
                return 1;
            if (item1.itemName < item2.itemName)
                return -1;
        },
        setCssFormElement: function () {
            $('.panel.plg-mlg-panel').css('margin-bottom', '0px');
            $('.panel.plg-mlg-panel .panel-body').css('padding', '5px');
            $('.plg-mlg-item-selected').css('margin', '0px 3px');
            $('.plg-mlg-item-selected').css('display', 'inline-block');
        },
        setCheckedItems: function() {
            if(plugin.checkedItems.length > 0) {
                for(var i in plugin.checkedItems) {
                    if(plugin.checkedItems[i].checked == true) {
                        $(plugin.plgOptions.selectorItemInput).each(function (i, e) {
                            if($(e).val() == plugin.checkedItems[i].value && plugin.checkedItems[i].checked == true) {
                                $(e).prop('checked', true);
                            }
                        });
                    }
                }
            }
        },
        isGroup: function (e, groupValue) {
            var groups = $(e).data('groupvalue').split(plugin.plgOptions.splitSymbol);
            var isGroup = false;
            groups.forEach(function (item) {
                if (item == groupValue) {
                    isGroup = true;
                }
            });
            return isGroup;
        },
        clickAllCheckbox: function () {
            if( $(this).is(':checked') ) {
                $('.plg-mlg-item-input').prop('checked', true);
                $('.plg-mlg-group-input').prop('checked', true);
            } else {
                $('.plg-mlg-item-input').prop('checked', false);
                $('.plg-mlg-group-input').prop('checked', false);
            }
        },
        clickSaveBtn: function () {
            plugin.checkedItems = [];
            $('.plg-mlg-item-input').each(function (i, e) {
                plugin.checkedItems.push({
                    checked: $(e).prop('checked'),
                    value: $(e).val(),
                    name: $(e).parent().text()
                });
            });
            plugin.renderAfterSave();
        },
        clickGroupCheckbox: function () {
            var groupValue = $(this).val();
            if ($(this).is(':checked')) {
                $('.plg-mlg-item-input').each(function (i, e) {
                    if (plugin.isGroup(e, groupValue)) {
                        $(e).prop('checked', true);
                    }
                });
            } else {
                $('.plg-mlg-item-input').each(function (i, e) {
                    if (plugin.isGroup(e, groupValue)) {
                        $(e).prop('checked', false);
                    }
                });
            }
        },
        clickItemCheckbox: function () {
            var itemValue = $(this).val();
            var groupValues = $(this).data('groupvalue');
            var groupValue = groupValues.split(plugin.plgOptions.splitSymbol);
            if ($(this).is(':checked')) {
                for(var index in groupValue) {
                    var isAllChecked = true;
                    $('.plg-mlg-item-input').each(function (i, e) {
                        var gv = $(e).data('groupvalue').split(plugin.plgOptions.splitSymbol);
                        for(var y in gv) {
                            if (gv[y] == groupValue[index] && !$(e).is(':checked')) {
                                console.log($(e).val())
                                isAllChecked = false;
                            }
                        }
                    });
                    if (isAllChecked) {
                        $('.plg-mlg-group-input[value="' + groupValue[index] + '"]').prop('checked', true);
                    }
                }
            } else {
                for(var i in groupValue) {
                    $('.plg-mlg-group-input[value="' + groupValue[i] + '"]').prop('checked', false);
                }
            }
        },
        /**
         * Open modal and load and prepare data and initialisation graphic interface elements
         * with it data.
         * @returns {undefined}
         */
        openModal: function () {

        /*    if (plugin.plgOptions.data.length == 0) {
                getApiAjax(plugin.plgOptions.url, {

                }, plugin.getRemoteData, plugin.getRemoteDataError);
            }*/

            var btns = [
                '<a class="btn btn-primary btn-save-plg-mlg" data-dismiss="modal">',
                    'Сохранить',
                '</a>',
                '<a class="btn btn-default" data-dismiss="modal">',
                    'Отмена',
                '</a>'
            ].join('');

            if(plugin.groupList.length == 0) {

                var groups = plugin.plgOptions.data;
                var groupsList = '';
                var items = [];

                for (var i in groups) {

                    groupsList += [
                        '<div class="col-sm-2 checkbox checkbox-plg-mlg">',
                            '<label>',
                                '<input class="plg-mlg-group-input" type="checkbox" value="', groups[i].value, '">', groups[i].name,
                            '</label>',
                        '</div>',
                    ].join('');

                    var groupItems = groups[i].group;
                    var groupValue = groups[i].value;

                    for (var y in groupItems) {
                        var isUnique = true;
                        items.forEach(function (item, i, arr) {
                            if (item.itemValue == groupItems[y].value) {
                                isUnique = false;
                                var groupValues = arr[i].groupValue;
                                arr[i].groupValue = groupValues + plugin.plgOptions.splitSymbol + groupValue;
                            }
                        });
                        if (isUnique) {
                            items.push({
                                groupValue: groups[i].value,
                                groupName: groups[i].name,
                                itemValue: groupItems[y].value,
                                itemName: groupItems[y].name,
                            });
                        }
                    }

                }

                items.sort(plugin.compareItems);
                plugin.items = items;
                plugin.groupList = groupsList;

            }

            itemsList = plugin.getItemsList();

            var content = [
                '<div class="row">',
                    '<div class="panel panel-default">',
                        '<div class="panel-heading">',
                            'Отделы',
                            '<div class="checkbox-plg-mlg checkbox pull-right">',
                                '<label>',
                                    '<input type="checkbox" class="plg-mlg-all-items">', plugin.plgOptions.nameCheckboxAll,
                                '</label>',
                            '</div>',
                        '</div>',
                        '<div class="plg-list">',
                            '<div class="row">',
                                plugin.groupList,
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="row">',
                    '<div class="panel panel-default">',
                        '<div class="panel-heading">',
                            plugin.plgOptions.titleItems,
                        '</div>',
                        '<div class="plg-list">',
                            '<div class="row">',
                                itemsList,
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            ].join('');

            MessageModal.show({
                title: plugin.plgOptions.modalTitle,
                content: content,
                footerContent: btns
            }, 'S');

            //Set stylesheets
            $('.checkbox-plg-mlg').css('margin-top', '0px');
            $('.checkbox-plg-mlg').css('margin-bottom', '0px');
            $('.checkbox-plg-mlg').css('padding-left', '15px');
            $('.plg-list').css('margin-top', '5px');
            $('.plg-list').css('margin-bottom', '5px');
            $('.panel-heading > .checkbox-plg-mlg').css('padding-left', '0px');

            plugin.setCheckedItems();

        },
        getItemsList: function () {
            var items = plugin.items;
            var itemsList = '';
            for (var i in items) {
                itemsList += [
                    '<div class="col-sm-2 checkbox checkbox-plg-mlg">',
                        '<label>',
                            '<input type="checkbox" class="plg-mlg-item-input" data-groupvalue="', items[i].groupValue, '" value="', items[i].itemValue, '">', items[i].itemName,
                        '</label>',
                    '</div>',
                ].join('');
            }
            return itemsList;
        },
        getRemoteData: function (response) {
            console.log(response)
        },
        getRemoteDataError: function (response) {
            console.log(response)
        }
    };

    window.plgModalListGroup = plugin;

}());