(function ($, window, document, undefined) {
    // Create the defaults once
    var pluginName = 'wizard',
		        defaults = {
		            navigationSelector: null,
		            navigationButtonClass: 'btn',
		            headerSelector: null,
		            errorSelector: null,
		            progressBarSelector: null
		        };

    // The actual plugin constructor
    function wizard(element, options) {
        var wizardSelf = this;
        this.element = $(element);
        this.current = null;
        this.wizardSteps = null;
        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.Next = function () {
            var stepValidateFunc = eval(wizardSelf.current.data('step-validate'));
            var valid = true;
            if (typeof (stepValidateFunc) == 'function')
                valid = stepValidateFunc.call(wizardSelf.current);

            if (valid) {
                var currentStepCount = parseInt(wizardSelf.current.data('wizard-step'));
                wizardSelf.hideError();
                wizardSelf.current.fadeOut(function () {
                    wizardSelf.current = $(wizardSelf.wizardSteps[currentStepCount]);
                    $(wizardSelf.current).fadeIn()
                    if (currentStepCount + 1 == wizardSelf.wizardSteps.length) {
                        $('#nextButton').hide();
                        $('#submitButton').show();
                    }
                    $('#previousButton').removeAttr('disabled');
                    wizardSelf.SetHeader();
                    wizardSelf.setProgress();
                });
            } else {
                wizardSelf.showError();
            }
        }

        this.Previous = function () {
            var currentStepCount = parseInt(wizardSelf.current.data('wizard-step'));

            wizardSelf.current.fadeOut(function () {
                wizardSelf.current = $(wizardSelf.wizardSteps[currentStepCount - 2])
                $(wizardSelf.current).fadeIn();
                if (currentStepCount - 1 == 1) {
                    $('#previousButton').attr('disabled', 'disabled');
                }
                $('#nextButton').show();
                $('#submitButton').hide();
                wizardSelf.SetHeader();
                wizardSelf.setProgress();
            });
        }

        this.SetHeader = function () {
            var headerText = wizardSelf.current.data('wizard-header-text');
            var headerSelector = wizardSelf.getOptionVal(wizardSelf.options.headerSelector);
            $(headerSelector).html(headerText);
        }

        this.showError = function () {
            var errorSelector = wizardSelf.getOptionVal(wizardSelf.options.errorSelector);
            $(errorSelector).html(wizardSelf.current.data('step-error'));
            $(wizardSelf.element).find('[data-toggle-error="true"]').show();
            $(errorSelector).fadeIn();

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

        this.getOptionVal = function (option) {
            return typeof (option) == 'function' ? option.call(wizardSelf.element) : option;
        }

        this.navButtons = '<input type="button" style="float: left" disabled="disabled" class="' + this.options.navigationButtonClass + '" value="&larr; Previous" id="previousButton"/>';
        this.navButtons += '<input type="button" style="float: right;" class="' + this.options.navigationButtonClass + '" value="Next &rarr;" id="nextButton"/>';
        this.navButtons += '<input type="submit" style="display: none; float: right;" class="' + this.options.navigationButtonClass + '" value="Submit" id="submitButton"/>';

        this.init();
    }

    wizard.prototype.init = function () {
        this.wizardSteps = this.sort(this.element.find('[data-wizard-step]'));
        this.wizardSteps.hide();

        //Set Up Errors
        this.hideError();

        //Set Up Nav
        var navSelector = this.getOptionVal(this.options.navigationSelector);
        $(navSelector).html(this.navButtons);

        //Wireup Nav Events;

        $('#nextButton').click(this.Next);
        $('#previousButton').click(this.Previous);
        this.current = this.wizardSteps.first().fadeIn();
        this.SetHeader();
        this.setProgress();

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
        }
    });
});