(function ($, window, document, undefined) {
    // Create the defaults once
    var pluginName = 'wizard',
		        defaults = {
		            navigationSelector: null,
		            navigationButtonClass: 'btn',
		            headerSelector: null,
		            errorSelector: null,
		            progressBarSelector: null,
		            contentLoaded: null,
		            useStepListForNavigation: false
		        };

    // The actual plugin constructor
    function wizard(element, options) {
        var wizardSelf = this;
        this.element = $(element);
        this.current = null;
        this.wizardSteps = null;
        this.navList = new Array();
        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.Next = function () {
            if (wizardSelf.validate()) {
                var currentStepCount = parseInt(wizardSelf.current.data('wizard-step'));
                wizardSelf.setStep(currentStepCount);
                window.location.hash = "wizardstep-" + currentStepCount;
            }
        }

        this.setStep = function (index) {
            wizardSelf.hideError();
            if (wizardSelf.current) {
                wizardSelf.current.fadeOut(function () {
                    wizardSelf.current = $(wizardSelf.wizardSteps[index]);
                    $(wizardSelf.current).fadeIn()
                    wizardSelf.showNavButtons();
                    wizardSelf.setHeader();
                    wizardSelf.setProgress();
                });
            }
            else {
                wizardSelf.current = $(wizardSelf.wizardSteps[index]);
                $(wizardSelf.current).fadeIn()
                wizardSelf.showNavButtons();

                wizardSelf.setHeader();
                wizardSelf.setProgress();
            }
        }

        this.showNavButtons = function () {
            var useStepListForNavigation = wizardSelf.getOptionVal(wizardSelf.options.useStepListForNavigation);
            var currentStepCount = parseInt(wizardSelf.current.data('wizard-step')) - 1;
            if (useStepListForNavigation) {
                for (var i = 0; i < wizardSelf.navList.length; i++) {
                    var navStep = wizardSelf.navList[i];

                    navStep.removeClass('active');
                    navStep.removeClass('disabled');

                    if (i > currentStepCount) {
                        navStep.addClass('disabled');
                        navStep.find('a').attr('href', 'javascript:;')
                    }
                    else if (i == currentStepCount) {
                        navStep.addClass('active');
                    }
                    else {
                        navStep.find('a').attr('href', '#wizardstep-' + i)
                    }

                }

                var nextTrigger = wizardSelf.current.data("stepNext");
                if (nextTrigger) {
                    wizardSelf.current.on('click', nextTrigger, wizardSelf.Next);
                    $('#nextButton').hide();
                    $('#submitButton').hide();
                }
            }
            else {

                var nextTrigger = wizardSelf.current.data("stepNext");
                if (nextTrigger) {
                    wizardSelf.current.on('click', nextTrigger, wizardSelf.Next);
                    $('#nextButton').hide();
                    $('#submitButton').hide();
                }
                else
                    if (currentStepCount + 1 == wizardSelf.wizardSteps.length) {
                        $('#nextButton').hide();
                        if (wizardSelf.current.data('show-submit') != false)
                            $('#submitButton').show();
                    }

                if (currentStepCount != 0)
                    $('#previousButton').removeAttr('disabled');
                else
                    $('#previousButton').attr('disabled', 'disabled');
            }
        }

        this.validate = function () {
            var stepvalidateFunc = eval(wizardSelf.current.data('step-validate'));
            var valid = true;
            if (typeof (stepvalidateFunc) == 'function') {
                valid = stepvalidateFunc.call(wizardSelf.current);
            }
            if (!valid)
                wizardSelf.showError();
            return valid;
        }

        this.previous = function () {
            var currentStepCount = parseInt(wizardSelf.current.data('wizard-step'));
            window.location.hash = "wizardstep-" + (currentStepCount - 2);
        }

        this.setHeader = function () {
            var headerText = wizardSelf.current.data('wizard-header-text');
            var headerSelector = wizardSelf.getOptionVal(wizardSelf.options.headerSelector);
            $(headerSelector).html(headerText);
            wizardSelf.runContentLoaded($(headerSelector));
        }

        this.showError = function () {
            var $errorSelector = $(wizardSelf.getOptionVal(wizardSelf.options.errorSelector));
            $errorSelector.html(wizardSelf.current.data('step-error'));
            $(wizardSelf.element).find('[data-toggle-error="true"]').show();
            $errorSelector.fadeIn();
            wizardSelf.runContentLoaded($errorSelector);

        }

        this.runContentLoaded = function ($selector) {
            var contenteLoadedFunction = eval(wizardSelf.getOptionVal(wizardSelf.options.contentLoaded));
            if (typeof (contenteLoadedFunction) == 'function')
                contenteLoadedFunction.call($selector);
        }

        this.hideError = function () {
            $(wizardSelf.getOptionVal(this.options.errorSelector)).hide();
            $(wizardSelf.element).find('[data-toggle-error="true"]').hide();
        }

        this.setProgress = function () {
            var currentStepCount = parseInt(wizardSelf.current.data('wizard-step'));
            var width = (currentStepCount / (wizardSelf.wizardSteps.length)) * 100 + '%';
            var $wizardBar = $(wizardSelf.getOptionVal(wizardSelf.options.progressBarSelector))
            $wizardBar.css('width', width);
            $wizardBar.html('Step ' + currentStepCount + ' of ' + wizardSelf.wizardSteps.length);
        }

        this.hashChange = function () {
            var hash = window.location.hash;
            if (hash.indexOf('wizardstep-') != -1) {
                var step = parseInt(hash.split('-')[1]);
                wizardSelf.setStep(step);
            }

        }

        this.sort = function (elements) {
            var keepSorting = false;
            this.elements = elements;
            do {
                keepSorting = false;
                for (var i = 0; i < elements.length - 1; i++) {
                    var step1 = parseInt($(elements[i]).data('wizard-step'));
                    var step2 = parseInt($(elements[i + 1]).data('wizard-step'));

                    if (step1 > step2) {
                        elements.splice(i + 2, 0, elements[i]);
                        elements.splice(i, 1);
                        keepSorting = true;
                    }
                }
            } while (keepSorting);

            return elements;
        }

        this.buildListNav = function () {
            for (var i = 0; i < wizardSelf.wizardSteps.length; i++) {
                var step = $(wizardSelf.wizardSteps[i]);
                var useStep = step.data('wizard-hide-step') || false;
                var navText = step.data('wizard-nav-text') || step.data('wizard-header-text');


                if (!useStep) {
                    var menuString = "<li><a href='#wizardstep-" + i + "' >" + navText + "</a></li>";
                    wizardSelf.navList.push($(menuString));
                }
            }

            return wizardSelf.navList;
        }

        this.getOptionVal = function (option) {
            return typeof (option) == 'function' ? option.call(wizardSelf.element) : option;
        }

        this.navButtons = '<input type="button" style="float: left" disabled="disabled" class="' + this.options.navigationButtonClass + '" value="&larr; previous" id="previousButton"/>';
        this.navButtons += '<input type="button" style="float: right;" class="' + this.options.navigationButtonClass + '" value="Next &rarr;" id="nextButton"/>';
        this.navButtons += '<input type="submit" style="display: none; float: right;" class="' + this.options.navigationButtonClass + '" value="Submit" id="submitButton"/>';

        this.init();
    }

    wizard.prototype.init = function () {
        var wizardSelf = this;
        this.wizardSteps = this.sort(this.element.find('[data-wizard-step]'));
        this.wizardSteps.hide();
        var useStepListForNavigation = this.getOptionVal(this.options.useStepListForNavigation);
        //Set Up Errors
        this.hideError();

        //Set Up Nav
        var navSelector = this.getOptionVal(this.options.navigationSelector);
        if (useStepListForNavigation) {
            $(navSelector).html(this.buildListNav());
        }
        else {
            $(navSelector).html(this.navButtons);
        }

        //Wireup Nav Events;

        $('#nextButton').click(this.Next);
        $('#previousButton').click(this.previous);
        $('#submitButton').click(this.validate);
        //        this.current = this.wizardSteps.first().fadeIn();      
        //        this.showNavButtons();
        //        this.setHeader();
        //        this.setProgress();

        window.onhashchange = this.hashChange;
        var firstHash = "wizardstep-" + 0;
        if (window.location.hash != "#" + firstHash)
            window.location.hash = "wizardstep-" + 0;
        else
            this.setStep(0);

    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
		                new wizard(this, options));
            }
        });
    }

})(jQuery, window, document);


//unobtrusive api;
$(document).ready(function () {
    $('[data-wizard="true"]').wizard({
        navigationSelector: function () {
            return $(this).data('wizardNav');
        },
        headerSelector: function () {
            return $(this).data('wizardHeader');
        },
        errorSelector: function () {
            return $(this).data('wizardError');
        },
        progressBarSelector: function () {
            return $(this).data('wizardProgress');
        },
        contentLoaded: function () {
            return $(this).data('wizardContentLoaded');
        },
        useStepListForNavigation: function () {
            var data = $(this).data('wizardStepNav');

            if (data)
                return true;

            return false;
        }
    });
});
