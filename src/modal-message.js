var MessageModal = {
    config: {
        init: false, // Если true инициализировать и не показывать
        container: 'messageModal',
        title: '',
        content: '',
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>', //Текст или HTML футера, по умолчанию кнопка закрыть

        headerShow: true,
        btnCloseShow: true,
        footerShow: true,

        maxHeight: '500px',
        overflow_y: 'auto',
        size: 'modal-lg',
        afterRender: function (data) {},
        backdrop: true,
        keyboard: true
    },
    show: function (uConfig, type) {
        var config = {};
        $.extend(config, MessageModal.config);
        $.extend(config, uConfig);
        var messageModal = $('#' + config.container); // Контейнер для сообщений
        var btnCloseModal = '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
        var titleModal = $('<h4 class="modal-title">').append(config.title);
        var headerModal = $('<div class="modal-header">').empty();
        var bodyModal = $('<div class="modal-body">').empty();
        var footerModal = $('<div class="modal-footer">').empty();
        var close = $('.btn-close, .close').off();

        bodyModal.css({'overflowY': config.overflow_y, 'maxHeight': config.maxHeight});

        if (messageModal.length == 0) {
            $('body').append($('<div id="' + config.container + '" class="modal fade full-close">')); // добавляем контейнер для сообщений
            messageModal = $('#' + config.container).html('<div class="modal-dialog ' + config.size + '"><div class="modal-content">');

        } else {
            messageModal.empty(); // Удаляем предыдущее сообщение
            messageModal.html($('<div class="modal-dialog ' + config.size + '"><div class="modal-content">'));
            var options = $('#' + config.container).data('bs.modal');
            options.options.backdrop = config.backdrop;
            $('#' + config.container).data('bs.modal', options);
        }

        if (config.btnCloseShow) {
            headerModal.append(btnCloseModal);
        }

        if (config.headerShow) {
            if (type == 'E' || type == 'A') {
                if (typeof config.title == 'undefined' || config.title == '') {
                    titleModal.text('Ошибка');
                }
                headerModal.removeClass().addClass('modal-header bg-danger');
            } else if (type == 'S') {
                if (typeof config.title == 'undefined' || config.title == '') {
                    titleModal.text('Информация');
                }
                headerModal.removeClass().addClass('modal-header bg-success');
            } else if (type == 'W') {
                if (typeof config.title == 'undefined' || config.title == '') {
                    titleModal.text('Внимание');
                }
                headerModal.removeClass().addClass('modal-header bg-info');
            } else if (type == 'I') {
                if (typeof config.title == 'undefined' || config.title == '') {
                    titleModal.text('Информация');
                }
                headerModal.removeClass().addClass('modal-header bg-primary');
            }
            headerModal.append(titleModal);
        } else {
            headerModal = '';
        }

        bodyModal.html(config.content);

        if (config.footerShow) {
            footerModal.append(config.footerContent);
        } else {
            footerModal = ''
        }

        messageModal.find('.modal-content').append(headerModal, bodyModal, footerModal);

        if (config.init == false) {
            messageModal.modal({
                backdrop: config.backdrop,
                show: true
            });
        }

        if (typeof config.afterRender == 'function') {
            config.afterRender();
        }

        if (config.keyboard) {
            $(document).on('keydown.modal', function (e) {
                if (e.keyCode == 27) {
                    $(document).off('keydown.modal');
                    messageModal.modal('hide');
                }
            });
        }
    },
    reshow: function (uConfig) {
        var config = {};
        $.extend(config, MessageModal.config);
        $.extend(config, uConfig);

        var messageModal = $('#' + config.container);
        messageModal.modal('show');
    },
    hide: function (uConfig) {
        var config = {};
        $.extend(config, MessageModal.config);
        $.extend(config, uConfig);

        var messageModal = $('#' + config.container);
        messageModal.modal('hide');
        if (typeof config.afterRender == 'function') {
            config.afterRender();
        }
    },
    spinnerShow: function () {
        MessageModal.show({
            content: '<div class="spinner_new">' +
                    '<p class="loader_text_modal">идет загрузка</p>' +
                    '<div class="loader"></div>' +
                    '</div>',
            headerShow: false, // Показывать ли блок заголовка
            footerShow: false, // отображать ли заголовок сообщения, по умолчанию показать
            maxHeight: '300px', // максимальная высота блока для сообщения
            overflow_y: 'none', // включет или отключает вертикальный скрол блока для сообщения
            size: '' // класс bootstrap для задания размера блока сообщения
        })
    },
    spinnerHide: function () {
        MessageModal.hide();
    },
    showMessages: function (messages, key, logout) {
        if (typeof key == 'undefined') {
            key = 0;
        }
        var close;
        if (messages.length > 0) {
            if (messages[key].type == 'A') {
                logout = true;
            }
            MessageModal.show({
                container: 'messageModal',
                content: messages[key].text,
                backdrop: 'static',
                size: 'modal-lg',
                afterRender: function () {
                    close = $('.full-close');
                    if (messages.length > ++key) {
                        $('.close, .btn-default').removeAttr('data-dismiss');
                        close.off('click.messages').on('click.messages', function () {
                            MessageModal.showMessages(messages, key, logout);
                        });
                    } else {
                        close.off('click.messages').on('click.messages', function () {
                            $('.close, .btn-default').removeAttr('data-dismiss');
                            MessageModal.hide({
                                afterRender: function () {
                                    $('.full-close').off('click.messages');
                                    $('.close, .btn-default').attr('data-dismiss', 'modal');
                                }
                            });
                            if (logout) {
                                window.location.replace(Routing.generate('security_logout', {_locale: 'ru'}));
                            }
                        });
                    }
                }
            }, messages[key].type);
        }
    }
}

var escapeHtml = function (string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
};