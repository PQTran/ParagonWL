var workLogApp = angular.module("workLogApp", ["kendo.directives"]);

workLogApp.controller("workLogController", ["$scope", "$http", function ($scope, $http) {
    var likeAPIUrl = "https://api.myjson.com/bins/3ws6l";

    $scope.storeUserOptions = {};

    var hasLocalStorageSupport = function () {
        return (localStorage !== undefined);
    };
    var localStorageSupported = hasLocalStorageSupport();

    $scope.showHideUserOption = (localStorageSupported ? "displayOption" : "hideOption");

    var autoUnfocusCheckboxes = function () {
        $('input:checkbox').change(function () {
            $('input:checkbox').blur();
        });
    };
    autoUnfocusCheckboxes();

    var getTotalWorkLogAppLikes = function () {
        $http({
            method: "GET",
            url: likeAPIUrl
        }).then(function (response) {
            $scope.currentLikes = parseInt(response.data.likes);
        }, function (response) {
            $("#Like_App").attr("id", "Unavailable");
        });
    };

    var removeOpenNotifications = function () {
        var notifications = $scope.notification.getNotifications();
        notifications.each(function () {
            $(this).remove();
        });
    };

    $scope.likeWorkLogApp = function () {
        removeOpenNotifications();

        if (!localStorageSupported) {
            $scope.notification.show("Your browser is not compatible.", "error");
        }
        else {

            if (!localStorage.getItem("workLogLiked")) {
                $http({
                    method: "PUT",
                    url: likeAPIUrl,
                    data: '{"likes":"' + ($scope.currentLikes + 1) + '"}'
                }).then(function (response) {
                    localStorage.setItem("workLogLiked", "true");
                    $scope.currentLikes += 1;
                    $scope.taskButtonTooltip.refresh();
                    $scope.notification.show("Thank you!", "info");
                }, function (response) {
                    $scope.notification.show("Unable to record like, sorry!", "error");
                });
            }
            else {
                $scope.notification.show("You may only like once.", "error");
            }

        }
    };

    $scope.getWorkLog = function () {
        $('#getWorkLogButton').blur();
        if ($scope.validator.validate()) {
            $('#username').blur();

            $(".spinner").addClass("startLoading");
            $("#iframePanelPlaceHolder").addClass("startLoading");

            var startValue = kendo.toString($scope.startCalendar.value(), "d MMM yyyy");
            var endValue = kendo.toString($scope.endCalendar.value(), "d MMM yyyy");

            var startDay = startValue.split(" ")[0];
            var startMonth = startValue.split(" ")[1];
            var startYear = startValue.split(" ")[2];

            var endDay = endValue.split(" ")[0];
            var endMonth = endValue.split(" ")[1];
            var endYear = endValue.split(" ")[2];

            var contentUrl =
                "https://paragontesting.atlassian.net/secure/ConfigureReport.jspa?" +
                "startDate=" + startDay + "%2F" + startMonth + "%2F" + startYear +
                "&endDate=" + endDay + "%2F" + endMonth + "%2F" + endYear +
                "&reportKey=jira-timesheet-plugin%3Areport&targetUser=" + $scope.userName;

            if ($scope.showComments)
                contentUrl += "&showDetails=true";
            if ($scope.showWeekends)
                contentUrl += "&weekends=true";
            if (!$scope.showSubtasks)
                contentUrl += "&sumSubTasks=true";

            $scope.splitter.ajaxRequest("#iframePanel", contentUrl);

            setTimeout(function () {
                $(".k-content-frame").on('load', function () {
                    $(".spinner").removeClass("startLoading");
                });
            }, 500);

            setTimeout(function () {
                $(".spinner").removeClass("startLoading");
            }, 1500);
        }
    };

    $scope.initialsTooltipOptions = {
        content: "Made with KendoUI + AngularJS",
        position: "left"
    };

    $scope.taskButtonTooltipOptions = {
        position: "top",
        showAfter: 600,
        animation: {
            open: {
                effects: "zoom:in slideIn:down",
                duration: 200
            },
            close: {
                effects: "slideIn:up",
                duration: 200,
                reverse: true
            }
        },
        filter: "a",
        content: function (e) {
            var element = e.target["0"];
            if (element.id == "Like_App") {
                return $scope.currentLikes + " likes!";
            }
            else {
                var resultString = element.id.replace("_", " ");
                return resultString;
            }
        }
    };

    $scope.expandButtonTooltipOptions = {
        position: "bottom",
        showAfter: 600,
        animation: {
            open: {
                effects: "zoom:in slideIn:up",
                duration: 200
            },
            close: {
                effects: "slideIn:down",
                duration: 200,
                reverse: true
            }
        },
        filter: "a"
    };

    $scope.splitterOptions = {
        orientation: "vertical",
        panes: [
            { collapsible: true, min: "365px" },
            { min: "390px" }
        ],
        resize: function () {
            adjustInspirationalContentHeight();
            adjustTaskButtonsHeight();
            removeSplitterCollapseExpandButton();
        }
    };

    $scope.informationWindowOptions = {
        visible: false,
        title: 'Give Credit Where Credit is Due',
        height: 200,
        width: 500,
        content: {
            template: $('#informationWindowTemplate').html()
        },
        animation: {
            open: {
                effects: false
            },
            close: {
                effects: false
            }
        },
        resizable: false,
        scrollable: false,
        close: function (e) {
            $scope.informationWindowOpened = false;
        }
    };

    var adjustInspirationalContentHeight = function () {
        var startingBottomFrameHeight = 503;
        var currentBottomFrameHeight = $("#iframePanel").height();
        var bottomFrameHeightDifference = startingBottomFrameHeight - currentBottomFrameHeight;

        var heightDiff = "-=" + (bottomFrameHeightDifference / 5).toString() + "px";

        $(".spinner").css('bottom', '25%').css('bottom', heightDiff);
    };

    $scope.loginPromptWindowOptions = {
        visible: false,
        resizable: false,
        height: 200,
        width: 500,
        modal: true,
        scrollable: false,
        draggable: false,
        content: {
            template: $("#loginPromptWindowTemplate").html()
        },
        open: function () {
            autoUnfocusCheckboxes();
            $(".k-widget.k-window").keypress(function (e) {
                if (e.which == 13)
                    $scope.closeLoginPromptWindow();
            });
        }
    };

    $scope.calendarOptions = {
        footer: "Today",
        value: new Date()
    };

    $scope.validatorOptions = {
        validateOnBlur: false,
        rules: {
            empty: function (input) {
                if (input.is("[name='username']"))
                    return $.trim(input.val()) !== "";
                return true;
            },
            longLength: function (input) {
                if (input.is("[name='username']"))
                    return $.trim(input.val()).length < 20;
                return true;
            }
        },
        messages: {
            empty: "Input is empty. Try again.",
            longLength: "Input is too long. Try again."
        },
        errorTemplate: "<span><small>#=message#</small></span>"
    };

    $scope.notificationOptions = {
        appendTo: "#taskButtons > .nav",
        autoHideAfter: 1000,
        show: function (e) {
            if (e.element["0"].className.indexOf("error") > -1) {
                $(".k-icon.k-i-note").replaceWith("<span class='icon-frown'></span>");
            }
            else if (e.element["0"].className.indexOf("info") > -1) {
                $(".k-icon.k-i-note").replaceWith("<span class='icon-smile'></span>");
            }
        }
    };

    $scope.$on("kendoRendered", function (e) {
        $('.k-window-content.k-content').css('background', "transparent url('img/crossword.png') repeat scroll 0% 0%");

        $scope.updateStartCalendar();
        $scope.updateEndCalendar();

        var calendarHeaders = $(".k-link.k-nav-fast");
        calendarHeaders.unbind();
        calendarHeaders.click(function () {
            return false;
        });

        $.getJSON("http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=?", function (data) {
            $("#inspirationalQuote").append(data.quoteText);
            $("#inspirationalAuthor").append(data.quoteAuthor);

            $('body').addClass('loaded');

            if ((!localStorageSupported) || (localStorageSupported && !localStorage.getItem("stopDisplayingPagePopup"))) {
                setTimeout(function () {
                    $scope.loginPromptWindow.center();
                    $scope.loginPromptWindow.open();
                }, 1000);
            }

        });

        getTotalWorkLogAppLikes();

    });

    $scope.removeOverlayAndSVG = function () {
        $("#newFeature").removeClass("showNewFeatureSVG");
        $("#newFeature").addClass("hideNewFeatureSVG");
    };

    var removeSplitterCollapseExpandButton = function () {
        $(".k-icon.k-collapse-prev").remove();
        $(".k-icon.k-expand-prev").remove();
    };

    $(document).on("click", ".k-overlay", function () {
        $scope.closeLoginPromptWindow(false);
    });

    $scope.updateStartCalendar = function () {
        var startDate = $scope.startCalendar.value();
        $scope.endCalendar.min(startDate);
    };

    $scope.updateEndCalendar = function () {
        var endDate = $scope.endCalendar.value();
        $scope.startCalendar.max(endDate);
    };

    $scope.closeLoginPromptWindow = function (buttonPressed) {
        if (localStorageSupported && $scope.storeUserOptions.stopDisplayingPagePopup && buttonPressed) {
            localStorage.setItem("stopDisplayingPagePopup", "true");
            $scope.notification.show("Setting has been saved.", "info");
        }

        $scope.loginPromptWindow.close();
        $("#username").focus();


        if (localStorageSupported && !localStorage.getItem("firstRunComplete")) {
            localStorage.setItem("firstRunComplete", "true");

            $("#newFeature").removeClass("hidden");
            $("#newFeature").addClass("showNewFeatureSVG");
        }
    };

    $scope.collapsePanel = function () {
        $scope.splitter.collapse("#navigationPanel");
        $scope.navigationPanelIsCollapsed = true;
    };

    $scope.expandPanel = function () {
        $scope.splitter.expand("#navigationPanel");
        $scope.navigationPanelIsCollapsed = false;
        $scope.expandButtonTooltip.hide();
    };

    var adjustTaskButtonsHeight = function () {
        var navigationPanelHeight = $('#navigationPanel').height();
        var taskButtonTopAdjustment = navigationPanelHeight - 49;

        $('#taskButtons').css({ top: taskButtonTopAdjustment + "px", position: 'absolute' });
    };

    $scope.openCloseInformationWindow = function () {
        if (!$scope.informationWindowOpened) {
            $scope.informationWindow.center();
            $scope.informationWindow.open();
            $scope.informationWindowOpened = true;
        }
        else {
            $scope.informationWindow.close();
            $scope.informationWindowOpened = false;
        }
    };

}]);